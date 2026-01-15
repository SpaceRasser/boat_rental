import React, { useState, useEffect } from 'react';
import './BoatManager.css';

const BoatManager = () => {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Данные формы
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    price_discount: '',
    quantity: 1,
    available: true,
    image_url: '',
    available_days: 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье',
    available_time_start: '09:00',
    available_time_end: '18:00'
  });

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
  const fetchBoats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/boats/get.php');
      const data = await response.json();
      
      if (data.success) {
        setBoats(data.data.boats || []);
      } else {
        showNotification('Ошибка загрузки лодок: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Ошибка загрузки лодок:', error);
      showNotification('Ошибка подключения к серверу', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoats();
  }, []);

  // ========== УВЕДОМЛЕНИЯ ==========
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // ========== ДОБАВЛЕНИЕ ЛОДКИ ==========
  const handleAddBoat = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name || !formData.price) {
      showNotification('Заполните название и цену', 'error');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      showNotification('Цена должна быть больше 0', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/boats/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Лодка успешно добавлена!', 'success');
        setShowAddForm(false);
        resetForm();
        fetchBoats();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка добавления:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== РЕДАКТИРОВАНИЕ ЛОДКИ ==========
  const handleEditClick = (boat) => {
    setSelectedBoat(boat);
    setFormData({
      name: boat.name || '',
      description: boat.description || '',
      price: boat.price || '',
      price_discount: boat.price_discount || '',
      quantity: boat.quantity || 1,
      available: boat.available === '1' || boat.available === true,
      image_url: boat.image_url || '',
      available_days: boat.available_days || 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье',
      available_time_start: boat.available_time_start || '09:00',
      available_time_end: boat.available_time_end || '18:00'
    });
    setShowEditForm(true);
  };

  const handleUpdateBoat = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      showNotification('Заполните название и цену', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/boats/update.php?id=${selectedBoat.id_boat}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Лодка успешно обновлена!', 'success');
        setShowEditForm(false);
        setSelectedBoat(null);
        fetchBoats();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка обновления:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== УДАЛЕНИЕ ЛОДКИ ==========
  const handleDeleteBoat = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить лодку? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/boats/delete.php?id=${id}`, {
        method: 'DELETE'
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Лодка успешно удалена!', 'success');
        fetchBoats();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      price_discount: '',
      quantity: 1,
      available: true,
      image_url: '',
      available_days: 'Понедельник,Вторник,Среда,Четверг,Пятница,Суббота,Воскресенье',
      available_time_start: '09:00',
      available_time_end: '18:00'
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

  // Фильтрация по поиску
  const filteredBoats = boats.filter(boat =>
    boat.name.toLowerCase().includes(search.toLowerCase()) ||
    (boat.description && boat.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Форматирование цены
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ₽/час';
  };

  // ========== ИНТЕРФЕЙС ==========
  return (
    <div className="boat-manager">
      {/* Уведомление */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Заголовок */}
      <div className="boats-header">
        <h1>
          <span className="boats-icon">🚤</span>
          Управление лодками
        </h1>
        <button 
          className="btn-add-boat"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
        >
          <span className="btn-icon">+</span>
          Добавить лодку
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="boats-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="boats-stats">
          <span className="stat-item">
            Всего: <strong>{boats.length}</strong>
          </span>
          <span className="stat-item">
            Доступно: <strong className="available">{boats.filter(b => b.available === '1' || b.available === true).length}</strong>
          </span>
          <span className="stat-item">
            Недоступно: <strong className="unavailable">{boats.filter(b => !(b.available === '1' || b.available === true)).length}</strong>
          </span>
        </div>
      </div>

      {/* Список лодок */}
      <div className="boats-list-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка лодок...</p>
          </div>
        ) : filteredBoats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚤</div>
            <h3>Лодок не найдено</h3>
            <p>{search ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первую лодку'}</p>
            {!search && (
              <button 
                className="btn-add-first"
                onClick={() => setShowAddForm(true)}
              >
                Добавить лодку
              </button>
            )}
          </div>
        ) : (
          <div className="boats-grid">
            {filteredBoats.map((boat) => (
              <div key={boat.id_boat} className="boat-card">
                <div className="boat-image">
                  {boat.image_url ? (
                    <img src={boat.image_url} alt={boat.name} />
                  ) : (
                    <div className="boat-image-placeholder">
                      <span className="placeholder-icon">🚤</span>
                    </div>
                  )}
                  <div className={`boat-status ${boat.available === '1' || boat.available === true ? 'available' : 'unavailable'}`}>
                    {boat.available === '1' || boat.available === true ? 'Доступна' : 'Недоступна'}
                  </div>
                </div>
                
                <div className="boat-content">
                  <div className="boat-header">
                    <h3 className="boat-name">{boat.name}</h3>
                    <span className="boat-id">#{boat.id_boat}</span>
                  </div>
                  
                  {boat.description && (
                    <p className="boat-description">{boat.description}</p>
                  )}
                  
                  <div className="boat-details">
                    <div className="boat-price">
                      <span className="price-current">{formatPrice(boat.price)}</span>
                      {boat.price_discount && (
                        <span className="price-discount">
                          {formatPrice(boat.price_discount)}
                        </span>
                      )}
                    </div>
                    
                    <div className="boat-meta">
                      <span className="meta-item">
                        <span className="meta-icon">📦</span>
                        {boat.quantity} шт.
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">⏰</span>
                        {boat.available_time_start} - {boat.available_time_end}
                      </span>
                    </div>
                    
                    <div className="boat-days">
                      {boat.available_days.split(',').map((day, index) => (
                        <span key={index} className="day-tag">
                          {day.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="boat-actions">
                  <button 
                    className="btn-edit-boat"
                    onClick={() => handleEditClick(boat)}
                  >
                    ✏️ Изменить
                  </button>
                  <button 
                    className="btn-delete-boat"
                    onClick={() => handleDeleteBoat(boat.id_boat)}
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ========== */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Добавить лодку</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddBoat} className="boat-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Название лодки *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Например: Катер 'Морской'"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Описание</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Описание лодки, характеристики..."
                    rows="3"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Цена за час (₽) *</label>
                    <input
                      type="number"
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="1500.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price_discount">Цена со скидкой (₽)</label>
                    <input
                      type="number"
                      id="price_discount"
                      value={formData.price_discount}
                      onChange={(e) => setFormData({...formData, price_discount: e.target.value})}
                      placeholder="1200.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="quantity">Количество</label>
                    <input
                      type="number"
                      id="quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      min="1"
                      step="1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="image_url">Ссылка на фото</label>
                    <input
                      type="url"
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://example.com/boat.jpg"
                    />
                  </div>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    />
                    <span className="checkbox-text">Доступна для аренды</span>
                  </label>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Доступность</h3>
                
                <div className="form-group">
                  <label>Дни недели</label>
                  <div className="days-selector">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`day-btn ${isDaySelected(day) ? 'selected' : ''}`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
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
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>{time}</option>
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
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="form-buttons">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowAddForm(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn-save">
                  Сохранить лодку
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ========== */}
      {showEditForm && selectedBoat && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Редактировать лодку</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateBoat} className="boat-form">
              {/* Тот же самый код формы, что и в добавлении */}
              {/* Можно вынести в отдельный компонент формы */}
              
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-group">
                  <label htmlFor="edit-name">Название лодки *</label>
                  <input
                    type="text"
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-description">Описание</label>
                  <textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-price">Цена за час (₽) *</label>
                    <input
                      type="number"
                      id="edit-price"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-price_discount">Цена со скидкой (₽)</label>
                    <input
                      type="number"
                      id="edit-price_discount"
                      value={formData.price_discount}
                      onChange={(e) => setFormData({...formData, price_discount: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-quantity">Количество</label>
                    <input
                      type="number"
                      id="edit-quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      min="1"
                      step="1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-image_url">Ссылка на фото</label>
                    <input
                      type="url"
                      id="edit-image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    />
                    <span className="checkbox-text">Доступна для аренды</span>
                  </label>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Доступность</h3>
                
                <div className="form-group">
                  <label>Дни недели</label>
                  <div className="days-selector">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`day-btn ${isDaySelected(day) ? 'selected' : ''}`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-available_time_start">Время начала</label>
                    <select
                      id="edit-available_time_start"
                      value={formData.available_time_start}
                      onChange={(e) => setFormData({...formData, available_time_start: e.target.value})}
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-available_time_end">Время окончания</label>
                    <select
                      id="edit-available_time_end"
                      value={formData.available_time_end}
                      onChange={(e) => setFormData({...formData, available_time_end: e.target.value})}
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="form-buttons">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowEditForm(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn-save">
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

export default BoatManager;
