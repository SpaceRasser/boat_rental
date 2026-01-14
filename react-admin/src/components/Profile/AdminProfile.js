import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';
import './Profile.css';

const AdminProfile = ({ user, onUpdate }) => {
  const [stats, setStats] = useState({
    users: 0,
    boats: 0,
    bookings: 0,
    orders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, boatsRes, bookingsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/get.php`),
        fetch(`${API_BASE_URL}/boats/get.php`),
        fetch(`${API_BASE_URL}/booking/get.php`),
        fetch(`${API_BASE_URL}/orders/get.php`)
      ]);

      const usersData = await usersRes.json();
      const boatsData = await boatsRes.json();
      const bookingsData = await bookingsRes.json();
      const ordersData = await ordersRes.json();

      setStats({
        users: usersData.success ? (usersData.data.pagination?.total || usersData.data.users?.length || 0) : 0,
        boats: boatsData.success ? (boatsData.data.boats?.length || 0) : 0,
        bookings: bookingsData.success ? (bookingsData.data.bookings?.length || 0) : 0,
        orders: ordersData.success ? (ordersData.data.orders?.length || 0) : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка статистики...</div>;
  }

  return (
    <div className="role-profile">
      <div className="admin-dashboard">
        <h2>Статистика системы</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Пользователи</h3>
              <p className="stat-number">{stats.users}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚤</div>
            <div className="stat-content">
              <h3>Лодки</h3>
              <p className="stat-number">{stats.boats}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Бронирования</h3>
              <p className="stat-number">{stats.bookings}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>Заказы</h3>
              <p className="stat-number">{stats.orders}</p>
            </div>
          </div>
        </div>

        <div className="admin-info">
          <h3>Административная панель</h3>
          <p>Вы можете управлять всеми аспектами системы через главное меню.</p>
          <div className="admin-links">
            <a href="/users">Управление пользователями</a>
            <a href="/boats">Управление лодками</a>
            <a href="/bookings">Управление бронированиями</a>
            <a href="/orders">Управление заказами</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
