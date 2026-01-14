import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    boats: 0,
    products: 0,
    orders: 0,
    bookings: 0,
    owners: 0,
    payments: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загружаем статистику
  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      // Здесь будем получать реальную статистику
      // Пока используем тестовые данные
      setTimeout(() => {
        setStats({
          users: 156,
          boats: 24,
          products: 89,
          orders: 342,
          bookings: 128,
          owners: 12,
          payments: 567
        });
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const fetchRecentActivity = async () => {
    // Тестовые данные недавней активности
    setRecentActivity([
      { id: 1, type: 'order', user: 'Иван Петров', action: 'создал заказ', time: '10 минут назад', icon: '📋' },
      { id: 2, type: 'payment', user: 'Мария Сидорова', action: 'оплатила бронь', amount: '5,200 ₽', time: '25 минут назад', icon: '💰' },
      { id: 3, type: 'booking', user: 'Алексей Иванов', action: 'забронировал лодку', time: '1 час назад', icon: '📅' },
      { id: 4, type: 'user', user: 'Новый клиент', action: 'зарегистрировался', time: '2 часа назад', icon: '👤' },
      { id: 5, type: 'boat', user: 'Администратор', action: 'добавил новую лодку', time: '3 часа назад', icon: '🚤' },
    ]);
  };

  // Карточки разделов
  const sections = [
    {
      id: 'users',
      title: 'Пользователи',
      icon: '👥',
      count: stats.users,
      description: 'Управление клиентами системы',
      color: '#4A6FFF',
      link: '/users'
    },
    {
      id: 'boats',
      title: 'Лодки',
      icon: '🚤',
      count: stats.boats,
      description: 'Каталог лодок и катеров',
      color: '#00C897',
      link: '/boats'
    },
    {
      id: 'products',
      title: 'Товары',
      icon: '🎒',
      count: stats.products,
      description: 'Дополнительное оборудование',
      color: '#FF9A3D',
      link: '/products'
    },
    {
      id: 'orders',
      title: 'Заказы',
      icon: '📋',
      count: stats.orders,
      description: 'Заказы аренды лодок',
      color: '#FF6B6B',
      link: '/orders'
    },
    {
      id: 'bookings',
      title: 'Бронирования',
      icon: '📅',
      count: stats.bookings,
      description: 'Календарь бронирований',
      color: '#9B5DE5',
      link: '/bookings'
    },
    {
      id: 'owners',
      title: 'Арендодатели',
      icon: '🏢',
      count: stats.owners,
      description: 'Владельцы лодок',
      color: '#00B4D8',
      link: '/owners'
    },
    {
      id: 'payments',
      title: 'Оплаты',
      icon: '💰',
      count: stats.payments,
      description: 'Финансовые операции',
      color: '#2ECC71',
      link: '/payments'
    }
  ];

  return (
    <div className="dashboard">
      {/* Заголовок */}
      <div className="dashboard-header">
        <h1>
          <span className="dashboard-icon">📊</span>
          Панель управления
        </h1>
        <p className="dashboard-subtitle">Обзор системы аренды лодок</p>
      </div>

      {/* Статистика */}
      <div className="stats-summary">
        <div className="stat-card total">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3>Общая статистика</h3>
            <div className="stat-numbers">
              <span className="stat-total">{stats.users + stats.boats + stats.products + stats.orders}</span>
              <span className="stat-label">активных записей</span>
            </div>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Доход за месяц</h3>
            <div className="stat-numbers">
              <span className="stat-total">256,430 ₽</span>
              <span className="stat-label">+12% за прошлый месяц</span>
            </div>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Активные брони</h3>
            <div className="stat-numbers">
              <span className="stat-total">18</span>
              <span className="stat-label">на этой неделе</span>
            </div>
          </div>
        </div>
      </div>

      {/* Основные разделы */}
      <div className="sections-container">
        <h2 className="sections-title">
          <span className="title-icon">⚡</span>
          Быстрый доступ
        </h2>
        
        <div className="sections-grid">
          {sections.map((section) => (
            <Link 
              to={section.link} 
              key={section.id}
              className="section-card"
              style={{ '--card-color': section.color }}
            >
              <div className="section-header">
                <div 
                  className="section-icon"
                  style={{ backgroundColor: section.color + '20' }}
                >
                  {section.icon}
                </div>
                <div className="section-count">
                  {loading ? (
                    <div className="loading-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
                  ) : (
                    section.count.toLocaleString('ru-RU')
                  )}
                </div>
              </div>
              
              <div className="section-content">
                <h3 className="section-title">{section.title}</h3>
                <p className="section-description">{section.description}</p>
              </div>
              
              <div className="section-footer">
                <span className="section-link">
                  Перейти →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Недавняя активность */}
      <div className="recent-activity">
        <h2 className="activity-title">
          <span className="title-icon">🔄</span>
          Недавняя активность
        </h2>
        
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <div className="activity-text">
                  <strong>{activity.user}</strong> {activity.action}
                  {activity.amount && <span className="activity-amount"> на {activity.amount}</span>}
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="view-all-btn">
          Показать всю активность →
        </button>
      </div>

      {/* Быстрые действия */}
      <div className="quick-actions">
        <h2 className="actions-title">
          <span className="title-icon">🚀</span>
          Быстрые действия
        </h2>
        
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">➕</span>
            <span className="action-text">Создать заказ</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span className="action-text">Создать отчет</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">📧</span>
            <span className="action-text">Отправить уведомления</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">🔄</span>
            <span className="action-text">Обновить данные</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;