import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';
import './Profile.css';

const ClientProfile = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    birth_date: user.birth_date || '',
    password: ''
  });

  useEffect(() => {
    if (activeTab === 'services') {
      fetchServices();
    } else if (activeTab === 'bookings') {
      fetchBookings();
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

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/booking/get.php`);
      const data = await response.json();
      if (data.success) {
        const userBookings = (data.data.bookings || []).filter(
          booking => booking.user_id == user.id_user
        );
        setBookings(userBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        id: user.id_user,
        name: formData.name,
        email: formData.email,
        birth_date: formData.birth_date
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

  const handleCreateBooking = async (boatId) => {
    // Находим лодку в списке услуг
    const boat = services.find(service => service.id_boat == boatId);
    
    if (!boat) {
      alert('Ошибка: Лодка не найдена');
      return;
    }

    // Проверяем наличие owner_id у лодки
    if (!boat.owner_id) {
      alert('Ошибка: У этой лодки не указан владелец. Невозможно создать бронирование.');
      return;
    }

    const bookingDate = prompt('Введите дату бронирования (YYYY-MM-DD):');
    const startTime = prompt('Введите время начала (HH:MM):');
    const endTime = prompt('Введите время окончания (HH:MM):');
    
    if (!bookingDate || !startTime || !endTime) return;

    try {
      const response = await fetch(`${API_BASE_URL}/booking/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id_user,
          owner_id: boat.owner_id,
          boat_id: boat.id_boat,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          price: boat.price || null
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Бронирование создано!');
        fetchBookings();
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка создания бронирования: ' + error.message);
    }
  };

  const handlePayment = async (booking) => {
    setPaymentsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/paymants/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id_user,
          booking_id: booking.id_booking,
          amount: booking.price || 0,
          payment_method: 'online-placeholder',
          status: 'pending',
          payment_date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Платеж отправлен в тестовый шлюз. Ожидайте подтверждения.');
      } else {
        alert('Ошибка оплаты: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка оплаты: ' + error.message);
    } finally {
      setPaymentsLoading(false);
    }
  };

  return (
    <div className="role-profile">
      <div className="profile-tabs">
        <button 
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          🚤 Услуги
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Мои бронирования
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
            <h2>Доступные услуги</h2>
            <div className="services-grid">
              {services
                .filter(service => service.owner_id) // Показываем только лодки с владельцем
                .map(service => (
                <div key={service.id_boat} className="service-card">
                  <h3>{service.name || 'Лодка #' + service.id_boat}</h3>
                  <p>{service.description || 'Описание отсутствует'}</p>
                  <div className="service-info">
                    <span>💰 {service.price || '0'} руб/день</span>
                  </div>
                  <button 
                    className="book-button"
                    onClick={() => handleCreateBooking(service.id_boat)}
                  >
                    Забронировать
                  </button>
                </div>
              ))}
              {services.filter(service => service.owner_id).length === 0 && (
                <p>Нет доступных услуг для бронирования</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Мои бронирования</h2>
            {bookings.length === 0 ? (
              <p>У вас нет бронирований</p>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.id_booking} className="booking-card">
                    <h3>Бронирование #{booking.id_booking}</h3>
                    <p>Лодка: {booking.boat_name || '—'}</p>
                    <p>Дата: {booking.booking_date}</p>
                    <p>Время: {booking.start_time} – {booking.end_time}</p>
                    <p>Цена: {booking.price ? `${booking.price} ₽` : '—'}</p>
                    <p>Статус: {booking.status || 'Активно'}</p>
                    <button
                      className="book-button"
                      onClick={() => handlePayment(booking)}
                      disabled={paymentsLoading}
                    >
                      {paymentsLoading ? 'Оплата...' : 'Оплатить'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="account-section">
            <h2>Настройки аккаунта</h2>
            {!showEditForm ? (
              <div className="account-info">
                <p><strong>Имя:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Дата рождения:</strong> {user.birth_date || 'Не указана'}</p>
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
                  <label>Дата рождения</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
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

export default ClientProfile;
