import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';
import './Profile.css';

const OwnerProfile = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [showAddService, setShowAddService] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: ''
  });
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    if (activeTab === 'services') {
      fetchServices();
    }
  }, [activeTab]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/boats/get.php`);
      const data = await response.json();
      if (data.success) {
        setServices(data.data.boats || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/boats/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serviceForm.name,
          description: serviceForm.description,
          price: serviceForm.price
          // owner_id временно не отправляем, чтобы избежать FK-ошибок.
          // Связь услуги с конкретным арендодателем можно будет
          // донастроить через отдельную таблицу или поле позже.
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Услуга добавлена!');
        setShowAddService(false);
        setServiceForm({ name: '', description: '', price: '' });
        fetchServices();
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка добавления услуги');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        id: user.id_user,
        name: formData.name,
        email: formData.email
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${API_BASE_URL}/users/update_simple.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Профиль обновлен!');
        setShowEditForm(false);
        onUpdate();
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка обновления профиля');
    }
  };

  return (
    <div className="role-profile">
      <div className="profile-tabs">
        <button 
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          🚤 Мои услуги
        </button>
        <button 
          className={activeTab === 'schedule' ? 'active' : ''}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Расписание
        </button>
        <button 
          className={activeTab === 'account' ? 'active' : ''}
          onClick={() => setActiveTab('account')}
        >
          ⚙️ Аккаунт
        </button>
      </div>

      <div className="profile-tab-content">
        {activeTab === 'services' && (
          <div className="services-section">
            <div className="section-header">
              <h2>Мои услуги</h2>
              <button 
                className="add-button"
                onClick={() => setShowAddService(true)}
              >
                + Добавить услугу
              </button>
            </div>

            {showAddService && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h3>Добавить услугу</h3>
                    <button onClick={() => setShowAddService(false)}>✕</button>
                  </div>
                  <form onSubmit={handleAddService}>
                    <div className="form-group">
                      <label>Название</label>
                      <input
                        type="text"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Описание</label>
                      <textarea
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                        rows="4"
                      />
                    </div>
                    <div className="form-group">
                      <label>Цена (руб/день)</label>
                      <input
                        type="number"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-buttons">
                      <button type="submit" className="save-button">Сохранить</button>
                      <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => setShowAddService(false)}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="services-grid">
              {services.map(service => (
                <div key={service.id_boat} className="service-card">
                  <h3>{service.name || 'Лодка #' + service.id_boat}</h3>
                  <p>{service.description || 'Описание отсутствует'}</p>
                  <div className="service-info">
                    <span>💰 {service.price || '0'} руб/день</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <h2>Расписание</h2>
            <p>Здесь будет отображаться расписание ваших услуг</p>
            <div className="coming-soon">
              <p>Функционал расписания в разработке</p>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="account-section">
            <h2>Настройки аккаунта</h2>
            {!showEditForm ? (
              <div className="account-info">
                <p><strong>Имя:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <button 
                  className="edit-button"
                  onClick={() => setShowEditForm(true)}
                >
                  Редактировать
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="edit-form">
                <div className="form-group">
                  <label>Имя</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Новый пароль (оставьте пустым, если не нужно менять)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="save-button">Сохранить</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowEditForm(false)}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerProfile;
