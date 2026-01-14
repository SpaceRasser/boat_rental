import React, { useState, useEffect } from 'react';
import './UsersManager.css';

const UsersManager = () => {
  // Состояния
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Форма
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birth_date: '',
    password: '',
    role: 'client'
  });

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/boat_rental/api/users/get.php');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users || []);
      } else {
        alert('Ошибка загрузки: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка подключения к серверу');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем пользователей при загрузке компонента
  useEffect(() => {
    fetchUsers();
  }, []);

  // ========== ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ==========
  const handleAddUser = async (e) => {
  e.preventDefault();
  
  // Проверка заполнения полей
  if (!formData.name || !formData.email || !formData.password) {
    alert('Заполните все обязательные поля!');
    return;
  }

  try {
    console.log('Отправляю данные:', formData);
    
    const response = await fetch('http://localhost/boat_rental/api/users/create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    console.log('Статус ответа:', response.status);
    console.log('Заголовки ответа:', response.headers);
    
    const text = await response.text();
    console.log('Текст ответа:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Ошибка парсинга JSON:', parseError);
      console.error('Сырой ответ:', text);
      alert('Сервер вернул невалидный JSON: ' + text.substring(0, 100));
      return;
    }
    
    if (data.success) {
      alert('✅ Пользователь успешно добавлен!');
      setShowAddForm(false);
      setFormData({ name: '', email: '', birth_date: '', password: '', role: 'client' });
      fetchUsers(); // Обновляем список
    } else {
      alert('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'));
    }
  } catch (error) {
    console.error('Полная ошибка:', error);
    alert('Ошибка сети: ' + error.message);
  }
};

  // ========== УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ==========
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить пользователя?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost/boat_rental/api/users/delete.php?id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Пользователь успешно удален!');
        fetchUsers(); // Обновляем список
      } else {
        alert('❌ Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка сети');
      console.error(error);
    }
  };

  // ========== РЕДАКТИРОВАНИЕ ПОЛЬЗОВАТЕЛЯ ==========
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      birth_date: user.birth_date || '',
      password: '', // Пароль не показываем
      role: user.role || 'client'
    });
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e) => {
  e.preventDefault();
  
  console.log('Редактирую пользователя:', selectedUser);
  console.log('Данные формы:', formData);
  
  if (!formData.name || !formData.email) {
    alert('Заполните обязательные поля!');
    return;
  }

  try {
    // Создаем объект с данными
    const updateData = {
      id: selectedUser.id_user,
      name: formData.name,
      email: formData.email,
      birth_date: formData.birth_date || null,
      role: formData.role
    };
    
    // Добавляем пароль только если он введен
    if (formData.password && formData.password.trim() !== '') {
      updateData.password = formData.password;
    }
    
    console.log('Отправляю данные обновления:', updateData);
    
    // Пробуем простой вариант API (используем POST вместо PUT)
    const response = await fetch('http://localhost/boat_rental/api/users/update_simple.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('Статус ответа:', response.status);
    
    const text = await response.text();
    console.log('Ответ сервера:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Ошибка парсинга JSON:', parseError);
      console.error('Сырой ответ:', text);
      alert('Сервер вернул невалидный JSON. Проверьте Console (F12)');
      return;
    }
    
    if (data.success) {
      alert('✅ Пользователь успешно обновлен!');
      setShowEditForm(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', birth_date: '', password: '' });
      fetchUsers(); // Обновляем список
    } else {
      alert('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'));
    }
  } catch (error) {
    console.error('Полная ошибка при обновлении:', error);
    alert('Ошибка сети: ' + error.message);
  }
};

  // ========== ИНТЕРФЕЙС ==========
  return (
    <div className="users-manager">
      {/* Заголовок */}
      <div className="users-header">
        <h1>
          <span className="icon">👥</span>
          Управление пользователями
        </h1>
        <button 
          className="btn-add"
          onClick={() => setShowAddForm(true)}
        >
          <span className="btn-icon">+</span>
          Добавить пользователя
        </button>
      </div>

      {/* Список пользователей */}
      <div className="users-list-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка данных...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>Нет пользователей</h3>
            <p>Добавьте первого пользователя</p>
            <button 
              className="btn-add-first"
              onClick={() => setShowAddForm(true)}
            >
              Добавить пользователя
            </button>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Дата рождения</th>
                  <th>Дата регистрации</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id_user}>
                    <td className="user-id">#{user.id_user}</td>
                    <td className="user-name">{user.name}</td>
                    <td className="user-email">{user.email}</td>
                    <td className="user-role">
                      {user.role === 'admin' ? 'Администратор' : 
                       user.role === 'owner' ? 'Арендодатель' : 
                       user.role === 'client' ? 'Клиент' : user.role || 'Не указана'}
                    </td>
                    <td className="user-birthdate">
                      {user.birth_date || 'Не указана'}
                    </td>
                    <td className="user-created">{user.created_at}</td>
                    <td className="user-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditClick(user)}
                      >
                        ✏️ Изменить
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user.id_user)}
                      >
                        🗑️ Удалить
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
              <h2>Добавить пользователя</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddUser}>
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
              
              <div className="form-group">
                <label htmlFor="role">Роль *</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="client">Клиент</option>
                  <option value="owner">Арендодатель</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="birth_date">Дата рождения</label>
                <input
                  type="date"
                  id="birth_date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Пароль *</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Введите пароль"
                  required
                />
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
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ========== */}
      {showEditForm && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Редактировать пользователя</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label htmlFor="edit-name">Имя *</label>
                <input
                  type="text"
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Введите имя"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-email">Email *</label>
                <input
                  type="email"
                  id="edit-email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-role">Роль *</label>
                <select
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="client">Клиент</option>
                  <option value="owner">Арендодатель</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-birth_date">Дата рождения</label>
                <input
                  type="date"
                  id="edit-birth_date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-password">
                  Новый пароль (оставьте пустым, если не нужно менять)
                </label>
                <input
                  type="password"
                  id="edit-password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Введите новый пароль"
                />
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

export default UsersManager;