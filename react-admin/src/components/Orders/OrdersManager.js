import React, { useState, useEffect } from 'react';
import './OrdersManager.css';

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Данные для форм
  const [boats, setBoats] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    boat_id: '',
    product_id: '',
    status: 'ожидание',
    available: true,
    available_days: 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье',
    available_time_start: '09:00',
    available_time_end: '18:00',
    quantity: 1,
    price: '',
    price_discount: ''
  });

  // Статусы заказов
  const statuses = ['ожидание', 'подтвержден', 'отменен', 'завершен'];
  
  // Дни недели для выбора
  const daysOfWeek = [
    'Понедельник',
    'Вторник', 
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье'
  ];

  // Время для выбора
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/orders/get.php');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders || []);
      } else {
        showNotification('Ошибка загрузки заказов: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      showNotification('Ошибка подключения к серверу', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBoats = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/boats/get.php');
      const data = await response.json();
      
      if (data.success) {
        setBoats(data.data.boats || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки лодок:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products/get.php');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBoats();
    fetchProducts();
  }, []);

  // ========== УВЕДОМЛЕНИЯ ==========
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // ========== ДОБАВЛЕНИЕ ЗАКАЗА ==========
  const handleAddOrder = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.boat_id || !formData.price) {
      showNotification('Выберите лодку и укажите цену', 'error');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      showNotification('Цена должна быть больше 0', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/orders/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Заказ успешно создан!', 'success');
        setShowAddForm(false);
        resetForm();
        fetchOrders();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== РЕДАКТИРОВАНИЕ ЗАКАЗА ==========
  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setFormData({
      boat_id: order.boat_id || '',
      product_id: order.product_id || '',
      status: order.status || 'ожидание',
      available: order.available === '1' || order.available === true,
      available_days: order.available_days || 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье',
      available_time_start: order.available_time_start || '09:00',
      available_time_end: order.available_time_end || '18:00',
      quantity: order.quantity || 1,
      price: order.price || '',
      price_discount: order.price_discount || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.boat_id || !formData.price) {
      showNotification('Выберите лодку и укажите цену', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/orders/update.php?id=${selectedOrder.id_order}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Заказ успешно обновлен!', 'success');
        setShowEditForm(false);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка обновления заказа:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== УДАЛЕНИЕ ЗАКАЗА ==========
  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить заказ? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/orders/delete.php?id=${id}`, {
        method: 'DELETE'
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Заказ успешно удален!', 'success');
        fetchOrders();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка удаления заказа:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== ИЗМЕНЕНИЕ СТАТУСА ==========
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/update.php?id=${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Статус заказа обновлен!', 'success');
        fetchOrders();
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
      boat_id: '',
      product_id: '',
      status: 'ожидание',
      available: true,
      available_days: 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье',
      available_time_start: '09:00',
      available_time_end: '18:00',
      quantity: 1,
      price: '',
      price_discount: ''
    });
  };

  const handleDayToggle = (day) => {
    const currentDays = formData.available_days.split(',').map(d => d.trim());
    
    if (currentDays.includes(day)) {
      // Убираем день
      const newDays = currentDays.filter(d => d !== day);
      setFormData({...formData, available_days: newDays.join(', ')});
    } else {
      // Добавляем день
      currentDays.push(day);
      setFormData({...formData, available_days: currentDays.join(', ')});
    }
  };

  const isDaySelected = (day) => {
    const currentDays = formData.available_days.split(',').map(d => d.trim());
    return currentDays.includes(day);
  };

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.boat_name && order.boat_name.toLowerCase().includes(search.toLowerCase())) ||
      (order.product_name && order.product_name.toLowerCase().includes(search.toLowerCase())) ||
      order.id_order.toString().includes(search);
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Форматирование цены
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ₽';
  };

  // Получение цвета статуса
  const getStatusColor = (status) => {
    switch(status) {
      case 'ожидание': return '#f59e0b'; // желтый
      case 'подтвержден': return '#10b981'; // зеленый
      case 'отменен': return '#ef4444'; // красный
      case 'завершен': return '#3b82f6'; // синий
      default: return '#6b7280'; // серый
    }
  };

  // Статистика по статусам
  const statusStats = {};
  orders.forEach(order => {
    const status = order.status || 'ожидание';
    statusStats[status] = (statusStats[status] || 0) + 1;
  });

  // ========== ИНТЕРФЕЙС ==========
  return (
    <div className="orders-manager">
      {/* Уведомление */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Заголовок */}
      <div className="orders-header">
        <h1>
          <span className="orders-icon">📋</span>
          Управление заказами
        </h1>
        <button 
          className="btn-add-order"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
        >
          <span className="btn-icon">+</span>
          Создать заказ
        </button>
      </div>

      {/* Статистика */}
      <div className="orders-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>Всего заказов</h3>
              <div className="stat-number">{orders.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Ожидают</h3>
              <div className="stat-number" style={{ color: getStatusColor('ожидание') }}>
                {statusStats['ожидание'] || 0}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Подтверждены</h3>
              <div className="stat-number" style={{ color: getStatusColor('подтвержден') }}>
                {statusStats['подтвержден'] || 0}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Общая сумма</h3>
              <div className="stat-number">
                {orders.length > 0 
                  ? formatPrice(orders.reduce((sum, o) => sum + parseFloat(o.price), 0))
                  : '0 ₽'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="orders-filters">
        <div className="filter-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск по ID, лодке или товару..."
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

      {/* Список заказов */}
      <div className="orders-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка заказов...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Заказов не найдено</h3>
            <p>{search || selectedStatus !== 'all' ? 'Попробуйте изменить фильтры' : 'Создайте первый заказ'}</p>
            {!search && selectedStatus === 'all' && (
              <button 
                className="btn-add-first"
                onClick={() => setShowAddForm(true)}
              >
                Создать заказ
              </button>
            )}
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Лодка</th>
                  <th>Товар</th>
                  <th>Статус</th>
                  <th>Кол-во</th>
                  <th>Цена</th>
                  <th>Дни</th>
                  <th>Время</th>
                  <th>Дата создания</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id_order}>
                    <td className="order-id">#{order.id_order}</td>
                    <td className="order-boat">
                      {order.boat_name || `Лодка #${order.boat_id}`}
                    </td>
                    <td className="order-product">
                      {order.product_name ? order.product_name : 'Без товара'}
                    </td>
                    <td className="order-status">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id_order, e.target.value)}
                        className="status-select-small"
                        style={{ 
                          backgroundColor: getStatusColor(order.status) + '20',
                          borderColor: getStatusColor(order.status),
                          color: getStatusColor(order.status)
                        }}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="order-quantity">{order.quantity}</td>
                    <td className="order-price">
                      <div className="price-info">
                        <div className="price-current">{formatPrice(order.price)}</div>
                        {order.price_discount && (
                          <div className="price-discount">
                            {formatPrice(order.price_discount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="order-days">
                      <div className="days-tags">
                        {order.available_days.split(',').slice(0, 3).map((day, index) => (
                          <span key={index} className="day-tag">
                            {day.trim()}
                          </span>
                        ))}
                        {order.available_days.split(',').length > 3 && (
                          <span className="day-tag-more">+{order.available_days.split(',').length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="order-time">
                      {order.available_time_start} - {order.available_time_end}
                    </td>
                    <td className="order-created">{order.created_at}</td>
                    <td className="order-actions">
                      <button 
                        className="btn-edit-order"
                        onClick={() => handleEditClick(order)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete-order"
                        onClick={() => handleDeleteOrder(order.id_order)}
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
              <h2>Создать заказ</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddOrder} className="order-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="boat_id">Лодка *</label>
                    <select
                      id="boat_id"
                      value={formData.boat_id}
                      onChange={(e) => setFormData({...formData, boat_id: e.target.value})}
                      required
                    >
                      <option value="">Выберите лодку</option>
                      {boats.map(boat => (
                        <option key={boat.id_boat} value={boat.id_boat}>
                          {boat.name} - {formatPrice(boat.price)}/час
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="product_id">Товар (опционально)</label>
                    <select
                      id="product_id"
                      value={formData.product_id}
                      onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                    >
                      <option value="">Без товара</option>
                      {products.map(product => (
                        <option key={product.id_product} value={product.id_product}>
                          {product.name} - {formatPrice(product.price)}
                        </option>
                      ))}
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
                    <label htmlFor="quantity">Количество</label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Цена</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Цена *</label>
                    <input
                      type="number"
                      id="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price_discount">Цена со скидкой (опционально)</label>
                    <input
                      type="number"
                      id="price_discount"
                      step="0.01"
                      min="0"
                      value={formData.price_discount}
                      onChange={(e) => setFormData({...formData, price_discount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Доступность</h3>
                
                <div className="form-row">
                  <div className="form-group availability-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({...formData, available: e.target.checked})}
                      />
                      <span className="toggle-label">Доступен для заказа</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Дни недели</label>
                  <div className="days-selector">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`day-btn ${isDaySelected(day) ? 'selected' : ''}`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day.charAt(0)}
                      </button>
                    ))}
                    <div className="days-selected">
                      Выбрано: {formData.available_days.split(',').length} дней
                    </div>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="available_time_start">Время начала</label>
                    <select
                      id="available_time_start"
                      value={formData.available_time_start}
                      onChange={(e) => setFormData({...formData, available_time_start: e.target.value})}
                    >
                      {timeOptions.map(time => (
                        <option key={`start-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="available_time_end">Время окончания</label>
                    <select
                      id="available_time_end"
                      value={formData.available_time_end}
                      onChange={(e) => setFormData({...formData, available_time_end: e.target.value})}
                    >
                      {timeOptions.map(time => (
                        <option key={`end-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
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
                  Создать заказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ========== */}
      {showEditForm && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Редактировать заказ #{selectedOrder.id_order}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateOrder} className="order-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_boat_id">Лодка *</label>
                    <select
                      id="edit_boat_id"
                      value={formData.boat_id}
                      onChange={(e) => setFormData({...formData, boat_id: e.target.value})}
                      required
                    >
                      <option value="">Выберите лодку</option>
                      {boats.map(boat => (
                        <option key={boat.id_boat} value={boat.id_boat}>
                          {boat.name} - {formatPrice(boat.price)}/час
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit_product_id">Товар (опционально)</label>
                    <select
                      id="edit_product_id"
                      value={formData.product_id}
                      onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                    >
                      <option value="">Без товара</option>
                      {products.map(product => (
                        <option key={product.id_product} value={product.id_product}>
                          {product.name} - {formatPrice(product.price)}
                        </option>
                      ))}
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
                    <label htmlFor="edit_quantity">Количество</label>
                    <input
                      type="number"
                      id="edit_quantity"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Цена</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_price">Цена *</label>
                    <input
                      type="number"
                      id="edit_price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit_price_discount">Цена со скидкой (опционально)</label>
                    <input
                      type="number"
                      id="edit_price_discount"
                      step="0.01"
                      min="0"
                      value={formData.price_discount}
                      onChange={(e) => setFormData({...formData, price_discount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Доступность</h3>
                
                <div className="form-row">
                  <div className="form-group availability-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({...formData, available: e.target.checked})}
                      />
                      <span className="toggle-label">Доступен для заказа</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Дни недели</label>
                  <div className="days-selector">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`day-btn ${isDaySelected(day) ? 'selected' : ''}`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day.charAt(0)}
                      </button>
                    ))}
                    <div className="days-selected">
                      Выбрано: {formData.available_days.split(',').length} дней
                    </div>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_available_time_start">Время начала</label>
                    <select
                      id="edit_available_time_start"
                      value={formData.available_time_start}
                      onChange={(e) => setFormData({...formData, available_time_start: e.target.value})}
                    >
                      {timeOptions.map(time => (
                        <option key={`start-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit_available_time_end">Время окончания</label>
                    <select
                      id="edit_available_time_end"
                      value={formData.available_time_end}
                      onChange={(e) => setFormData({...formData, available_time_end: e.target.value})}
                    >
                      {timeOptions.map(time => (
                        <option key={`end-${time}`} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
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

export default OrdersManager;
