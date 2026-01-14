import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../../config';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    birth_date: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!formData.name || !formData.email || !formData.password) {
      setError('Заполните все обязательные поля');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    // Для клиента дата рождения обязательна
    if (formData.role === 'client' && !formData.birth_date) {
      setError('Для клиента необходимо указать дату рождения');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          birth_date: formData.role === 'client' ? formData.birth_date : null
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Регистрация успешна! Теперь войдите в систему.');
        navigate('/login');
      } else {
        setError(data.error || 'Ошибка регистрации');
      }
    } catch (error) {
      setError('Ошибка подключения к серверу');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🚤 Регистрация</h1>
          <p>Создайте аккаунт для работы с системой</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Имя *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите ваше имя"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Минимум 6 символов"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль"
              required
            />
          </div>

          <div className="form-group">
            <label>Выберите роль *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={formData.role === 'client'}
                  onChange={handleChange}
                />
                <span className="radio-custom"></span>
                <div className="radio-content">
                  <strong>Клиент</strong>
                  <small>Просмотр услуг, бронирование, управление аккаунтом</small>
                </div>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={formData.role === 'owner'}
                  onChange={handleChange}
                />
                <span className="radio-custom"></span>
                <div className="radio-content">
                  <strong>Арендодатель</strong>
                  <small>Добавление услуг, расписание, управление аккаунтом</small>
                </div>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                />
                <span className="radio-custom"></span>
                <div className="radio-content">
                  <strong>Администратор</strong>
                  <small>Просмотр статистики, управление системой</small>
                </div>
              </label>
            </div>
          </div>

          {formData.role === 'client' && (
            <div className="form-group">
              <label htmlFor="birth_date">Дата рождения *</label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
              <small className="form-hint">Необходимо для расчета скидок</small>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
