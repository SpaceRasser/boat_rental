import React, { useState, useEffect } from 'react';
import './OwnersManager.css';

const OwnersManager = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Данные для форм
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const fetchOwners = async () => {
  console.log('Начало загрузки арендодателей...');
  setLoading(true);
  try {
    const response = await fetch('http://localhost/boat_rental/api/owners/get.php');
    console.log('Ответ получен, статус:', response.status);
    
    const text = await response.text();
    console.log('Ответ (текст):', text);
    
    const data = JSON.parse(text);
    console.log('Ответ (JSON):', data);
    
    // ВАРИАНТ А: Если API возвращает {success: true, data: {owners: [...]}}
    if (data.success && data.data && data.data.owners) {
      console.log('Формат 1: success.data.owners');
      console.log('Данные арендодателей:', data.data.owners);
      setOwners(data.data.owners);
    }
    // ВАРИАНТ Б: Если API возвращает {success: true, owners: [...]}
    else if (data.success && data.owners) {
      console.log('Формат 2: success.owners');
      console.log('Данные арендодателей:', data.owners);
      setOwners(data.owners);
    }
    // ВАРИАНТ В: Если API возвращает {owners: [...]}
    else if (data.owners) {
      console.log('Формат 3: owners');
      console.log('Данные арендодателей:', data.owners);
      setOwners(data.owners);
    }
    // ВАРИАНТ Г: Если API возвращает прямой массив [...]
    else if (Array.isArray(data)) {
      console.log('Формат 4: прямой массив');
      console.log('Данные арендодателей:', data);
      setOwners(data);
    }
    // ВАРИАНТ Д: Если API возвращает {success: true, data: [...]}
    else if (data.success && data.data && Array.isArray(data.data)) {
      console.log('Формат 5: success.data (массив)');
      console.log('Данные арендодателей:', data.data);
      setOwners(data.data);
    }
    else {
      console.error('Неизвестный формат данных:', data);
      setOwners([]);
      showNotification('Ошибка загрузки: неверный формат данных', 'error');
    }
    
  } catch (error) {
    console.error('Ошибка загрузки арендодателей:', error);
    showNotification('Ошибка подключения к серверу', 'error');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchOwners();
  }, []);

  // ========== УВЕДОМЛЕНИЯ ==========
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // ========== ДОБАВЛЕНИЕ АРЕНДОДАТЕЛЯ ==========
  const handleAddOwner = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name || !formData.email) {
      showNotification('Заполните имя и email', 'error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showNotification('Введите корректный email', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost/boat_rental/api/owners/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        })
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Арендодатель успешно создан!', 'success');
        setShowAddForm(false);
        resetForm();
        fetchOwners();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка создания арендодателя:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== РЕДАКТИРОВАНИЕ АРЕНДОДАТЕЛЯ ==========
  const handleEditClick = (owner) => {
    setSelectedOwner(owner);
    setFormData({
      name: owner.name || '',
      email: owner.email || '',
      password: '',
      confirmPassword: ''
    });
    setShowEditForm(true);
  };

  const handleUpdateOwner = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      showNotification('Заполните имя и email', 'error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showNotification('Введите корректный email', 'error');
      return;
    }

    // Если указан пароль, проверяем подтверждение
    if (formData.password && formData.password !== formData.confirmPassword) {
      showNotification('Пароли не совпадают', 'error');
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // Добавляем пароль только если он указан
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`http://localhost/boat_rental/api/owners/update.php?id=${selectedOwner.id_owner}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Арендодатель успешно обновлен!', 'success');
        setShowEditForm(false);
        setSelectedOwner(null);
        resetForm();
        fetchOwners();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка обновления арендодателя:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== УДАЛЕНИЕ АРЕНДОДАТЕЛЯ ==========
  const handleDeleteOwner = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить арендодателя?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost/boat_rental/api/owners/delete.php?id=${id}`, {
        method: 'DELETE'
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Арендодатель удален!', 'success');
        fetchOwners();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка удаления арендодателя:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Фильтрация арендодателей
  const filteredOwners = owners.filter(owner => {
    return (
      (owner.name && owner.name.toLowerCase().includes(search.toLowerCase())) ||
      (owner.email && owner.email.toLowerCase().includes(search.toLowerCase())) ||
      owner.id_owner.toString().includes(search)
    );
  });

  // ========== ИНТЕРФЕЙС ==========
  return (
    <div className="owners-manager">
      {/* Уведомление */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Заголовок */}
      <div className="owners-header">
        <h1>
          <span className="owners-icon">👤</span>
          Управление арендодателями
        </h1>
        <button 
          className="btn-add-owner"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
        >
          <span className="btn-icon">+</span>
          Добавить арендодателя
        </button>
      </div>

      {/* Статистика */}
      <div className="owners-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <h3>Всего арендодателей</h3>
              <div className="stat-number">{owners.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Активных</h3>
              <div className="stat-number">{owners.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Поиск */}
      <div className="owners-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Поиск по имени, email или ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Список арендодателей */}
      <div className="owners-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка арендодателей...</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>Арендодателей не найдено</h3>
            <p>{search ? 'Попробуйте изменить поиск' : 'Добавьте первого арендодателя'}</p>
            {!search && (
              <button 
                className="btn-add-first"
                onClick={() => setShowAddForm(true)}
              >
                Добавить арендодателя
              </button>
            )}
          </div>
        ) : (
          <div className="owners-table-container">
            <table className="owners-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Дата регистрации</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.map((owner) => (
                  <tr key={owner.id_owner}>
                    <td className="owner-id">#{owner.id_owner}</td>
                    <td className="owner-name">
                      {owner.name}
                    </td>
                    <td className="owner-email">
                      {owner.email}
                    </td>
                    <td className="owner-created">
                      {owner.created_at}
                    </td>
                    <td className="owner-actions">
                      <button 
                        className="btn-edit-owner"
                        onClick={() => handleEditClick(owner)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete-owner"
                        onClick={() => handleDeleteOwner(owner.id_owner)}
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
              <h2>Добавить арендодателя</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddOwner} className="owner-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Имя *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Введите имя"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="form-info">
                <p><strong>Примечание:</strong> При создании арендодателя будет установлен временный пароль. Пользователь сможет изменить его позже.</p>
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
                  Добавить арендодателя
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ========== */}
      {showEditForm && selectedOwner && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Редактировать арендодателя #{selectedOwner.id_owner}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateOwner} className="owner-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-group">
                  <label htmlFor="edit_name">Имя *</label>
                  <input
                    type="text"
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Введите имя"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit_email">Email *</label>
                  <input
                    type="email"
                    id="edit_email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="form-section">
                <h3>Смена пароля</h3>
                <p className="form-hint">Оставьте пустым, если не хотите менять пароль</p>
                
                <div className="form-group">
                  <label htmlFor="password">Новый пароль</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Новый пароль"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Подтвердите пароль</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Подтвердите пароль"
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

export default OwnersManager;