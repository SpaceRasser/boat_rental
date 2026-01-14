import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';
import ClientProfile from './ClientProfile';
import OwnerProfile from './OwnerProfile';
import AdminProfile from './AdminProfile';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    fetchUser(userId);
  }, [navigate]);

  const fetchUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/get_current.php?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleLabel = (role) => {
    const labels = {
      'client': 'Клиент',
      'owner': 'Арендодатель',
      'admin': 'Администратор'
    };
    return labels[role] || role;
  };

  const renderProfileContent = () => {
    switch (user.role) {
      case 'client':
        return <ClientProfile user={user} onUpdate={fetchUser} />;
      case 'owner':
        return <OwnerProfile user={user} onUpdate={fetchUser} />;
      case 'admin':
        return <AdminProfile user={user} onUpdate={fetchUser} />;
      default:
        return <div>Неизвестная роль</div>;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-content">
          <h1>Профиль</h1>
          <button className="logout-button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>

      <div className="profile-content">
        {renderProfileContent()}
      </div>

      <div className="profile-footer">
        <div className="profile-info">
          <p className="profile-name">{user.name}</p>
          <p className="profile-role">{getRoleLabel(user.role)}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
