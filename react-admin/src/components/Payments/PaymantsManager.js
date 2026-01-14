import React, { useState, useEffect } from 'react';
import './PaymantsManager.css';

const PaymentsManager = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Данные для форм
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    booking_id: '',
    user_id: '',
    amount: '',
    payment_method: 'card',
    status: 'pending',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  // Опции
  const paymentMethods = [
    { id: 'card', name: 'Карта' },
    { id: 'cash', name: 'Наличные' },
    { id: 'transfer', name: 'Перевод' },
    { id: 'online', name: 'Онлайн' }
  ];

  const paymentStatuses = [
    { id: 'pending', name: 'Ожидает' },
    { id: 'completed', name: 'Завершен' },
    { id: 'failed', name: 'Неудача' },
    { id: 'refunded', name: 'Возврат' }
  ];

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/boat_rental/api/paymants/get.php');
      const text = await response.text();
      console.log('Raw response:', text);
      
      const data = JSON.parse(text);
      console.log('Parsed data:', data);
      
      if (data.success) {
        setPayments(data.data.payments || []);
      } else {
        showNotification('Ошибка загрузки платежей: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Полная ошибка загрузки:', error);
      showNotification('Ошибка подключения к серверу: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndBookings = async () => {
    try {
      // Загружаем пользователей
      const usersResponse = await fetch('http://localhost/boat_rental/api/users/get.php');
      const usersText = await usersResponse.text();
      console.log('Users raw:', usersText);
      
      const usersData = JSON.parse(usersText);
      if (usersData.success && usersData.data && usersData.data.users) {
        setUsers(usersData.data.users);
      } else if (Array.isArray(usersData)) {
        setUsers(usersData);
      }
      
      // Загружаем бронирования
      const bookingsResponse = await fetch('http://localhost/boat_rental/api/bookings/get.php');
      const bookingsText = await bookingsResponse.text();
      console.log('Bookings raw:', bookingsText);
      
      const bookingsData = JSON.parse(bookingsText);
      if (bookingsData.success && bookingsData.data && bookingsData.data.bookings) {
        setBookings(bookingsData.data.bookings);
      } else if (Array.isArray(bookingsData)) {
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchUsersAndBookings();
  }, []);

  // ========== УВЕДОМЛЕНИЯ ==========
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // ========== ФОРМАТИРОВАНИЕ ==========
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // ========== ДОБАВЛЕНИЕ ПЛАТЕЖА ==========
  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.user_id || !formData.amount) {
      showNotification('Выберите пользователя и укажите сумму', 'error');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      showNotification('Сумма должна быть больше 0', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost/boat_rental/api/paymants/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: formData.booking_id || null,
          user_id: parseInt(formData.user_id),
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method,
          status: formData.status,
          transaction_id: formData.transaction_id || '',
          payment_date: formData.payment_date
        })
      });
      
      const text = await response.text();
      console.log('Create response:', text);
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Платеж успешно создан!', 'success');
        setShowAddForm(false);
        resetForm();
        fetchPayments();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка создания платежа:', error);
      showNotification('Ошибка сети: ' + error.message, 'error');
    }
  };

  // ========== РЕДАКТИРОВАНИЕ ПЛАТЕЖА ==========
  const handleEditClick = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      booking_id: payment.booking_id || '',
      user_id: payment.user_id || '',
      amount: payment.amount || '',
      payment_method: payment.payment_method || 'card',
      status: payment.status || 'pending',
      transaction_id: payment.transaction_id || '',
      payment_date: payment.payment_date ? 
        payment.payment_date.split('.').reverse().join('-') : 
        new Date().toISOString().split('T')[0]
    });
    setShowEditForm(true);
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.amount) {
      showNotification('Выберите пользователя и укажите сумму', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost/boat_rental/api/paymants/update.php?id=${selectedPayment.id_payment}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: formData.booking_id || null,
          user_id: parseInt(formData.user_id),
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method,
          status: formData.status,
          transaction_id: formData.transaction_id || '',
          payment_date: formData.payment_date
        })
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Платеж успешно обновлен!', 'success');
        setShowEditForm(false);
        setSelectedPayment(null);
        fetchPayments();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка обновления платежа:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== УДАЛЕНИЕ ПЛАТЕЖА ==========
  const handleDeletePayment = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить платеж?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost/boat_rental/api/paymants/delete.php?id=${id}`, {
        method: 'DELETE'
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Платеж удален!', 'success');
        fetchPayments();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка удаления платежа:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== ИЗМЕНЕНИЕ СТАТУСА ==========
  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost/boat_rental/api/paymants/update.php?id=${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Статус платежа обновлен!', 'success');
        fetchPayments();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  const resetForm = () => {
    setFormData({
      booking_id: '',
      user_id: '',
      amount: '',
      payment_method: 'card',
      status: 'pending',
      transaction_id: '',
      payment_date: new Date().toISOString().split('T')[0]
    });
  };

  // Фильтрация платежей
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      (payment.user_name && payment.user_name.toLowerCase().includes(search.toLowerCase())) ||
      (payment.transaction_id && payment.transaction_id.toLowerCase().includes(search.toLowerCase())) ||
      (payment.id_payment && payment.id_payment.toString().includes(search)) ||
      (payment.booking_number && payment.booking_number.toString().includes(search));
    
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Получение цвета статуса
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10b981'; // зеленый
      case 'pending': return '#f59e0b'; // желтый
      case 'failed': return '#ef4444'; // красный
      case 'refunded': return '#8b5cf6'; // фиолетовый
      default: return '#6b7280'; // серый
    }
  };

  // Получение иконки метода оплаты
  const getMethodIcon = (method) => {
    switch(method) {
      case 'card': return '💳';
      case 'cash': return '💰';
      case 'transfer': return '🏦';
      case 'online': return '🌐';
      default: return '💳';
    }
  };

  // Статистика
  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const completedPayments = payments.filter(p => p.status === 'completed');
  const totalCompleted = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const completedCount = completedPayments.length;
  const failedCount = payments.filter(p => p.status === 'failed').length;

  // ========== ИНТЕРФЕЙС ==========
  return (
    <div className="payments-manager">
      {/* Уведомление */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Заголовок */}
      <div className="payments-header">
        <h1>
          <span className="payments-icon">💰</span>
          Управление платежами
        </h1>
        <button 
          className="btn-add-payment"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
        >
          <span className="btn-icon">+</span>
          Добавить платеж
        </button>
      </div>

      {/* Статистика */}
      <div className="payments-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Общая сумма</h3>
              <div className="stat-number">{formatCurrency(totalAmount)}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Завершено</h3>
              <div className="stat-number">{formatCurrency(totalCompleted)}</div>
              <div className="stat-subtext">{completedCount} платежей</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Ожидают</h3>
              <div className="stat-number">{pendingCount}</div>
              <div className="stat-subtext">платежей</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Сегодня</h3>
              <div className="stat-number">
                {formatCurrency(payments.filter(p => p.payment_date === new Date().toLocaleDateString('ru-RU')).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="payments-filters">
        <div className="filter-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск по ID, пользователю, транзакции..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="status-filter">
            <label>Статус:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-select"
            >
              <option value="all">Все статусы</option>
              {paymentStatuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Быстрые статусы */}
        <div className="quick-statuses">
          <button 
            className={`status-btn ${selectedStatus === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('all')}
          >
            Все
          </button>
          {paymentStatuses.map(status => (
            <button
              key={status.id}
              className={`status-btn ${selectedStatus === status.id ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status.id)}
              style={{ backgroundColor: selectedStatus === status.id ? getStatusColor(status.id) + '20' : 'white' }}
            >
              {status.name}
            </button>
          ))}
        </div>
      </div>

      {/* Список платежей */}
      <div className="payments-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка платежей...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>Платежей не найдено</h3>
            <p>{search || selectedStatus !== 'all' ? 'Попробуйте изменить фильтры' : 'Добавьте первый платеж'}</p>
            {!search && selectedStatus === 'all' && (
              <button 
                className="btn-add-first"
                onClick={() => setShowAddForm(true)}
              >
                Добавить платеж
              </button>
            )}
          </div>
        ) : (
          <div className="payments-table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Бронь</th>
                  <th>Пользователь</th>
                  <th>Сумма</th>
                  <th>Метод</th>
                  <th>Статус</th>
                  <th>Транзакция</th>
                  <th>Дата</th>
                  <th>Создано</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id_payment}>
                    <td className="payment-id">#{payment.id_payment}</td>
                    <td className="payment-booking">
                      {payment.booking_number ? `#${payment.booking_number}` : '—'}
                    </td>
                    <td className="payment-user">
                      <div className="user-info">
                        <div className="user-name">{payment.user_name || `Пользователь #${payment.user_id}`}</div>
                        {payment.user_email && (
                          <div className="user-email">{payment.user_email}</div>
                        )}
                      </div>
                    </td>
                    <td className="payment-amount">
                      <strong>{formatCurrency(payment.amount)}</strong>
                    </td>
                    <td className="payment-method">
                      <span className="method-icon">{getMethodIcon(payment.payment_method)}</span>
                      <span className="method-text">
                        {paymentMethods.find(m => m.id === payment.payment_method)?.name || payment.payment_method}
                      </span>
                    </td>
                    <td className="payment-status">
                      <select
                        value={payment.status || 'pending'}
                        onChange={(e) => handleStatusChange(payment.id_payment, e.target.value)}
                        className="status-select-small"
                        style={{ 
                          backgroundColor: getStatusColor(payment.status) + '20',
                          borderColor: getStatusColor(payment.status),
                          color: getStatusColor(payment.status)
                        }}
                      >
                        {paymentStatuses.map(status => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="payment-transaction">
                      {payment.transaction_id ? (
                        <code>{payment.transaction_id.substring(0, 8)}...</code>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="payment-date">{payment.payment_date}</td>
                    <td className="payment-created">{payment.created_at}</td>
                    <td className="payment-actions">
                      <button 
                        className="btn-edit-payment"
                        onClick={() => handleEditClick(payment)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete-payment"
                        onClick={() => handleDeletePayment(payment.id_payment)}
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========== МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ========== */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Добавить платеж</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddPayment} className="payment-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="user_id">Пользователь *</label>
                    <select
                      id="user_id"
                      value={formData.user_id}
                      onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                      required
                    >
                      <option value="">Выберите пользователя</option>
                      {users.map(user => (
                        <option key={user.id_user || user.id} value={user.id_user || user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="booking_id">Бронирование (опционально)</label>
                    <select
                      id="booking_id"
                      value={formData.booking_id}
                      onChange={(e) => setFormData({...formData, booking_id: e.target.value})}
                    >
                      <option value="">Без привязки к брони</option>
                      {bookings.map(booking => (
                        <option key={booking.id_booking} value={booking.id_booking}>
                          Бронь #{booking.id_booking} - {booking.user_name} ({booking.booking_date})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="amount">Сумма *</label>
                    <div className="amount-input">
                      <input
                        type="number"
                        id="amount"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                      <span className="currency">₽</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="payment_date">Дата платежа</label>
                    <input
                      type="date"
                      id="payment_date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Детали оплаты</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="payment_method">Метод оплаты</label>
                    <select
                      id="payment_method"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                    >
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status">Статус</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      {paymentStatuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="transaction_id">ID транзакции (опционально)</label>
                  <input
                    type="text"
                    id="transaction_id"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                    placeholder="tr_1234567890"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddForm(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                >
                  Добавить платеж
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ========== */}
      {showEditForm && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Редактировать платеж #{selectedPayment.id_payment}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdatePayment} className="payment-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_user_id">Пользователь *</label>
                    <select
                      id="edit_user_id"
                      value={formData.user_id}
                      onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                      required
                    >
                      <option value="">Выберите пользователя</option>
                      {users.map(user => (
                        <option key={user.id_user || user.id} value={user.id_user || user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit_booking_id">Бронирование (опционально)</label>
                    <select
                      id="edit_booking_id"
                      value={formData.booking_id}
                      onChange={(e) => setFormData({...formData, booking_id: e.target.value})}
                    >
                      <option value="">Без привязки к брони</option>
                      {bookings.map(booking => (
                        <option key={booking.id_booking} value={booking.id_booking}>
                          Бронь #{booking.id_booking} - {booking.user_name} ({booking.booking_date})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_amount">Сумма *</label>
                    <div className="amount-input">
                      <input
                        type="number"
                        id="edit_amount"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                      <span className="currency">₽</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit_payment_date">Дата платежа</label>
                    <input
                      type="date"
                      id="edit_payment_date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Детали оплаты</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_payment_method">Метод оплаты</label>
                    <select
                      id="edit_payment_method"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                    >
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit_status">Статус</label>
                    <select
                      id="edit_status"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      {paymentStatuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit_transaction_id">ID транзакции (опционально)</label>
                  <input
                    type="text"
                    id="edit_transaction_id"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                    placeholder="tr_1234567890"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditForm(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManager;