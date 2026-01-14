import React, { useState, useEffect } from 'react';
import './BookingsManager.css';

const BookingsManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Данные для форм
  const [users, setUsers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    owner_id: '',
    start_time: '09:00',
    end_time: '18:00',
    booking_date: new Date().toISOString().split('T')[0],
    status: 'бронь'
  });

  // Статусы бронирований
  const statuses = ['бронь', 'подтверждена', 'завершена', 'отменена'];
  
  // Время для выбора
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/boat_rental/api/booking/get.php');
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        setBookings(data.data.bookings || []);
      } else {
        showNotification('Ошибка загрузки бронирований: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
      showNotification('Ошибка подключения к серверу', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndOwners = async () => {
    try {
      // Загружаем пользователей
      const usersResponse = await fetch('http://localhost/boat_rental/api/users/get.php');
      const usersData = await usersResponse.json();
      
      // Загружаем владельцев - создадим простой API если его нет
      let ownersData;
      try {
        const ownersResponse = await fetch('http://localhost/boat_rental/api/owners/get.php');
        ownersData = await ownersResponse.json();
      } catch (error) {
        console.log('Нет API владельцев, используем заглушку');
        // Если нет API владельцев, используем тестовые данные
        ownersData = {
          success: true,
          data: {
            owners: [
              { id_owner: 1, name: "Владелец 1", email: "owner1@example.com" },
              { id_owner: 2, name: "Владелец 2", email: "owner2@example.com" },
              { id_owner: 3, name: "Владелец 3", email: "owner3@example.com" }
            ]
          }
        };
      }
      
      console.log('usersData:', usersData);
      console.log('ownersData:', ownersData);
      
      // Установка пользователей
      if (usersData.success && usersData.data && usersData.data.users) {
        setUsers(usersData.data.users);
      } else if (usersData.success && usersData.data && Array.isArray(usersData.data)) {
        setUsers(usersData.data);
      } else if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.warn('Неверный формат данных пользователей, используем тестовые');
        setUsers([
          { id_user: 1, name: "Иван Иванов", email: "ivan@example.com" },
          { id_user: 2, name: "Петр Петров", email: "petr@example.com" },
          { id_user: 3, name: "Сергей Сергеев", email: "sergey@example.com" }
        ]);
      }
      
      // Установка владельцев
      if (ownersData.success && ownersData.data && ownersData.data.owners) {
        setOwners(ownersData.data.owners);
      } else if (ownersData.success && ownersData.data && Array.isArray(ownersData.data)) {
        setOwners(ownersData.data);
      } else if (Array.isArray(ownersData)) {
        setOwners(ownersData);
      } else {
        console.warn('Неверный формат данных владельцев, используем тестовые');
        setOwners([
          { id_owner: 1, name: "Алексей Владелец", email: "owner1@example.com" },
          { id_owner: 2, name: "Дмитрий Арендодатель", email: "owner2@example.com" },
          { id_owner: 3, name: "Ольга Собственник", email: "owner3@example.com" }
        ]);
      }
      
    } catch (error) {
      console.error('Ошибка загрузки пользователей или владельцев:', error);
      // Устанавливаем тестовые данные при ошибке
      setUsers([
        { id_user: 1, name: "Иван Иванов", email: "ivan@example.com" },
        { id_user: 2, name: "Петр Петров", email: "petr@example.com" }
      ]);
      setOwners([
        { id_owner: 1, name: "Алексей Владелец", email: "owner1@example.com" },
        { id_owner: 2, name: "Дмитрий Арендодатель", email: "owner2@example.com" }
      ]);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchUsersAndOwners();
  }, []);

  // ========== УВЕДОМЛЕНИЯ ==========
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // ========== РАСЧЕТ ПРОДОЛЖИТЕЛЬНОСТИ ==========
  const calculateDuration = (start, end) => {
    if (!start || !end) return '0 ч';
    
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const diffMs = endTime - startTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.round(diffHours * 60)} мин`;
    }
    
    const hours = Math.floor(diffHours);
    const minutes = Math.round((diffHours - hours) * 60);
    
    if (minutes === 0) {
      return `${hours} ч`;
    }
    return `${hours} ч ${minutes} мин`;
  };

  // ========== ДОБАВЛЕНИЕ БРОНИРОВАНИЯ ==========
  const handleAddBooking = async (e) => {
    e.preventDefault();
    
    console.log('Отправка данных:', formData);
    
    // Валидация
    if (!formData.user_id || !formData.owner_id) {
      showNotification('Выберите клиента и владельца', 'error');
      return;
    }

    if (formData.user_id === formData.owner_id) {
      showNotification('Клиент и владелец не могут быть одним человеком', 'error');
      return;
    }

    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    if (end <= start) {
      showNotification('Время окончания должно быть позже времени начала', 'error');
      return;
    }

    const bookingDate = new Date(formData.booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      showNotification('Дата бронирования не может быть в прошлом', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost/boat_rental/api/booking/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(formData.user_id),
          owner_id: parseInt(formData.owner_id),
          start_time: formData.start_time,
          end_time: formData.end_time,
          booking_date: formData.booking_date,
          status: formData.status
        })
      });
      
      const text = await response.text();
      console.log('Ответ сервера:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError);
        showNotification('Ошибка сервера: неверный формат ответа', 'error');
        return;
      }
      
      if (data.success) {
        showNotification('✅ Бронирование успешно создано!', 'success');
        setShowAddForm(false);
        resetForm();
        fetchBookings();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка создания бронирования:', error);
      showNotification('Ошибка сети: ' + error.message, 'error');
    }
  };

  // ========== РЕДАКТИРОВАНИЕ БРОНИРОВАНИЯ ==========
  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      user_id: booking.user_id || '',
      owner_id: booking.owner_id || '',
      start_time: booking.start_time || '09:00',
      end_time: booking.end_time || '18:00',
      booking_date: booking.booking_date ? 
        booking.booking_date.split('.').reverse().join('-') : 
        new Date().toISOString().split('T')[0],
      status: booking.status || 'бронь'
    });
    setShowEditForm(true);
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.owner_id) {
      showNotification('Выберите клиента и владельца', 'error');
      return;
    }

    if (formData.user_id === formData.owner_id) {
      showNotification('Клиент и владелец не могут быть одним человеком', 'error');
      return;
    }

    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    if (end <= start) {
      showNotification('Время окончания должно быть позже времени начала', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost/boat_rental/api/booking/update.php?id=${selectedBooking.id_booking}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Бронирование успешно обновлено!', 'success');
        setShowEditForm(false);
        setSelectedBooking(null);
        fetchBookings();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка обновления бронирования:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== УДАЛЕНИЕ БРОНИРОВАНИЯ ==========
  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Вы уверены, что хотите отменить бронирование?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost/boat_rental/api/booking/delete.php?id=${id}`, {
        method: 'DELETE'
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Бронирование отменено!', 'success');
        fetchBookings();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка отмены бронирования:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== ИЗМЕНЕНИЕ СТАТУСА ==========
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost/boat_rental/api/booking/update.php?id=${bookingId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Статус бронирования обновлен!', 'success');
        fetchBookings();
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
      user_id: '',
      owner_id: '',
      start_time: '09:00',
      end_time: '18:00',
      booking_date: new Date().toISOString().split('T')[0],
      status: 'бронь'
    });
  };

  // Фильтрация бронирований
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.user_name && booking.user_name.toLowerCase().includes(search.toLowerCase())) ||
      (booking.owner_name && booking.owner_name.toLowerCase().includes(search.toLowerCase())) ||
      (booking.user_email && booking.user_email.toLowerCase().includes(search.toLowerCase())) ||
      booking.id_booking.toString().includes(search) ||
      (booking.booking_date && booking.booking_date.includes(search));
    
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Получение цвета статуса
  const getStatusColor = (status) => {
    switch(status) {
      case 'бронь': return '#f59e0b'; // желтый
      case 'подтверждена': return '#10b981'; // зеленый
      case 'отменена': return '#ef4444'; // красный
      case 'завершена': return '#3b82f6'; // синий
      default: return '#6b7280'; // серый
    }
  };

  // Статистика по статусам
  const statusStats = {};
  bookings.forEach(booking => {
    const status = booking.status || 'бронь';
    statusStats[status] = (statusStats[status] || 0) + 1;
  });

  // Получение сегодняшних бронирований
  const todayBookings = bookings.filter(booking => {
    const today = new Date().toLocaleDateString('ru-RU');
    return booking.booking_date === today;
  });

  // ========== ИНТЕРФЕЙС ==========
  return (
    <div className="bookings-manager">
      {/* Уведомление */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Заголовок */}
      <div className="bookings-header">
        <h1>
          <span className="bookings-icon">📅</span>
          Управление бронированиями
        </h1>
        <button 
          className="btn-add-booking"
          onClick={() => {
            console.log('Открытие формы, users:', users.length, 'owners:', owners.length);
            resetForm();
            setShowAddForm(true);
          }}
        >
          <span className="btn-icon">+</span>
          Создать бронирование
        </button>
      </div>

      {/* Статистика */}
      <div className="bookings-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Всего бронирований</h3>
              <div className="stat-number">{bookings.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>На рассмотрении</h3>
              <div className="stat-number" style={{ color: getStatusColor('бронь') }}>
                {statusStats['бронь'] || 0}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Подтверждены</h3>
              <div className="stat-number" style={{ color: getStatusColor('подтверждена') }}>
                {statusStats['подтверждена'] || 0}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📆</div>
            <div className="stat-info">
              <h3>На сегодня</h3>
              <div className="stat-number">{todayBookings.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bookings-filters">
        <div className="filter-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск по ID, клиенту, владельцу или дате..."
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
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({statusStats[status] || 0})
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
          {statuses.map(status => (
            <button
              key={status}
              className={`status-btn ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
              style={{ backgroundColor: selectedStatus === status ? getStatusColor(status) + '20' : 'white' }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Список бронирований */}
      <div className="bookings-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка бронирований...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>Бронирований не найдено</h3>
            <p>{search || selectedStatus !== 'all' ? 'Попробуйте изменить фильтры' : 'Создайте первое бронирование'}</p>
            {!search && selectedStatus === 'all' && (
              <button 
                className="btn-add-first"
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
              >
                Создать бронирование
              </button>
            )}
          </div>
        ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Дата</th>
                  <th>Начало</th>
                  <th>Конец</th>
                  <th>Длительность</th>
                  <th>Клиент</th>
                  <th>Владелец</th>
                  <th>Статус</th>
                  <th>Создано</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id_booking}>
                    <td className="booking-id">#{booking.id_booking}</td>
                    <td className="booking-date">
                      {booking.booking_date}
                    </td>
                    <td className="booking-start">
                      {booking.start_time}
                    </td>
                    <td className="booking-end">
                      {booking.end_time}
                    </td>
                    <td className="booking-duration">
                      {calculateDuration(booking.start_time, booking.end_time)}
                    </td>
                    <td className="booking-user">
                      <div className="user-info">
                        <div className="user-name">{booking.user_name}</div>
                        {booking.user_email && (
                          <div className="user-email">{booking.user_email}</div>
                        )}
                      </div>
                    </td>
                    <td className="booking-owner">
                      <div className="owner-info">
                        <div className="owner-name">{booking.owner_name}</div>
                        {booking.owner_email && (
                          <div className="owner-email">{booking.owner_email}</div>
                        )}
                      </div>
                    </td>
                    <td className="booking-status">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id_booking, e.target.value)}
                        className="status-select-small"
                        style={{ 
                          backgroundColor: getStatusColor(booking.status) + '20',
                          borderColor: getStatusColor(booking.status),
                          color: getStatusColor(booking.status)
                        }}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="booking-created">{booking.created_at}</td>
                    <td className="booking-actions">
                      <button 
                        className="btn-edit-booking"
                        onClick={() => handleEditClick(booking)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete-booking"
                        onClick={() => handleDeleteBooking(booking.id_booking)}
                        title="Отменить"
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
              <h2>Создать бронирование</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddBooking} className="booking-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="user_id">Клиент *</label>
                    <select
                      id="user_id"
                      value={formData.user_id}
                      onChange={(e) => {
                        console.log('Выбран user_id:', e.target.value);
                        setFormData({...formData, user_id: e.target.value});
                      }}
                      required
                    >
                      <option value="">Выберите клиента</option>
                      {Array.isArray(users) && users.length > 0 ? (
                        users.map(user => (
                          <option 
                            key={user.id_user || user.id} 
                            value={user.id_user || user.id}
                          >
                            {user.name} ({user.email})
                          </option>
                        ))
                      ) : (
                        <option disabled>Загрузка пользователей...</option>
                      )}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="owner_id">Владелец *</label>
                    <select
                      id="owner_id"
                      value={formData.owner_id}
                      onChange={(e) => {
                        console.log('Выбран owner_id:', e.target.value);
                        setFormData({...formData, owner_id: e.target.value});
                      }}
                      required
                    >
                      <option value="">Выберите владельца</option>
                      {Array.isArray(owners) && owners.length > 0 ? (
                        owners.map(owner => (
                          <option 
                            key={owner.id_owner || owner.id} 
                            value={owner.id_owner || owner.id}
                          >
                            {owner.name} ({owner.email})
                          </option>
                        ))
                      ) : (
                        <option disabled>Загрузка владельцев...</option>
                      )}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="status">Статус</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="booking_date">Дата бронирования *</label>
                    <input
                      type="date"
                      id="booking_date"
                      value={formData.booking_date}
                      onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Время бронирования</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start_time">Время начала *</label>
                    <select
                      id="start_time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      required
                    >
                      {timeOptions.map(time => (
                        <option key={`start-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="end_time">Время окончания *</label>
                    <select
                      id="end_time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      required
                    >
                      {timeOptions.map(time => (
                        <option key={`end-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="time-info">
                  <div className="duration-preview">
                    <strong>Продолжительность:</strong> 
                    <span className="duration-value">
                      {calculateDuration(formData.start_time, formData.end_time)}
                    </span>
                  </div>
                  {new Date(`2000-01-01T${formData.end_time}`) <= new Date(`2000-01-01T${formData.start_time}`) && (
                    <div className="time-error">
                      ⚠️ Время окончания должно быть позже времени начала
                    </div>
                  )}
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
                  Создать бронирование
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ========== */}
      {showEditForm && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Редактировать бронирование #{selectedBooking.id_booking}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateBooking} className="booking-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_user_id">Клиент *</label>
                    <select
                      id="edit_user_id"
                      value={formData.user_id}
                      onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                      required
                    >
                      <option value="">Выберите клиента</option>
                      {Array.isArray(users) && users.length > 0 ? (
                        users.map(user => (
                          <option 
                            key={user.id_user || user.id} 
                            value={user.id_user || user.id}
                          >
                            {user.name} ({user.email})
                          </option>
                        ))
                      ) : (
                        <option disabled>Загрузка пользователей...</option>
                      )}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit_owner_id">Владелец *</label>
                    <select
                      id="edit_owner_id"
                      value={formData.owner_id}
                      onChange={(e) => setFormData({...formData, owner_id: e.target.value})}
                      required
                    >
                      <option value="">Выберите владельца</option>
                      {Array.isArray(owners) && owners.length > 0 ? (
                        owners.map(owner => (
                          <option 
                            key={owner.id_owner || owner.id} 
                            value={owner.id_owner || owner.id}
                          >
                            {owner.name} ({owner.email})
                          </option>
                        ))
                      ) : (
                        <option disabled>Загрузка владельцев...</option>
                      )}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_status">Статус</label>
                    <select
                      id="edit_status"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit_booking_date">Дата бронирования *</label>
                    <input
                      type="date"
                      id="edit_booking_date"
                      value={formData.booking_date}
                      onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Время бронирования</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_start_time">Время начала *</label>
                    <select
                      id="edit_start_time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      required
                    >
                      {timeOptions.map(time => (
                        <option key={`start-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit_end_time">Время окончания *</label>
                    <select
                      id="edit_end_time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      required
                    >
                      {timeOptions.map(time => (
                        <option key={`end-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="time-info">
                  <div className="duration-preview">
                    <strong>Продолжительность:</strong> 
                    <span className="duration-value">
                      {calculateDuration(formData.start_time, formData.end_time)}
                    </span>
                  </div>
                  {new Date(`2000-01-01T${formData.end_time}`) <= new Date(`2000-01-01T${formData.start_time}`) && (
                    <div className="time-error">
                      ⚠️ Время окончания должно быть позже времени начала
                    </div>
                  )}
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

export default BookingsManager;