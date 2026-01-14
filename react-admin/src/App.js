import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import UsersManager from './components/Users/UsersManager';
import BoatManager from './components/Boat/BoatManager';
import ProductsManager from './components/Products/ProductsManager';
import OrdersManager from './components/Orders/OrdersManager';
import BookingsManager from './components/Bookings/BookingsManager';
import OwnersManager from './components/Owners/OwnersManager';
import PaymantsManager from './components/Payments/PaymantsManager';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import './App.css';

// Компонент защищенного маршрута
const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Компонент меню
const NavigationMenu = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  
  const menuItems = [
    { path: '/', icon: '📊', label: 'Главная', roles: ['admin'] },
    { path: '/users', icon: '👥', label: 'Пользователи', roles: ['admin'] },
    { path: '/boats', icon: '🚤', label: 'Лодки', roles: ['admin'] },
    { path: '/products', icon: '🎒', label: 'Товары', roles: ['admin'] },
    { path: '/orders', icon: '📋', label: 'Заказы', roles: ['admin'] },
    { path: '/bookings', icon: '📅', label: 'Брони', roles: ['admin'] },
    { path: '/owners', icon: '🏢', label: 'Арендодатели', roles: ['admin'] },
    { path: '/payments', icon: '💰', label: 'Оплаты', roles: ['admin'] },
    { path: '/profile', icon: '👤', label: 'Профиль', roles: ['client', 'owner', 'admin'] },
  ].filter(item => !item.roles || item.roles.includes(user.role));

  return (
    <nav className="main-nav">
      <div className="container">
        <div className="nav-logo">
          <h2>🚤 Лодочная CRM</h2>
          <p>Административная панель</p>
        </div>
        
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="nav-user">
          <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
          <div className="user-info">
            <p className="user-name">{user.name || 'Пользователь'}</p>
            <p className="user-role">{user.role === 'admin' ? 'Admin' : user.role === 'owner' ? 'Арендодатель' : 'Клиент'}</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Компонент заголовка
const AppHeader = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const titles = {
      '/': 'Панель управления',
      '/users': 'Управление пользователями',
      '/boats': 'Каталог лодок',
      '/products': 'Товары и оборудование',
      '/orders': 'Заказы аренды',
      '/bookings': 'Бронирования',
      '/owners': 'Арендодатели',
      '/payments': 'Финансовые операции',
    };
    
    return titles[location.pathname] || 'Панель управления';
  };

  return (
    <header className="app-header">
      <div className="container">
        <h1>{getPageTitle()}</h1>
        <div className="header-actions">
          <button className="header-btn">
            <span className="btn-icon">🔔</span>
            <span className="btn-badge">3</span>
          </button>
          <button className="header-btn">
            <span className="btn-icon">⚙️</span>
          </button>
        </div>
      </div>
    </header>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="app">
              <NavigationMenu />
              <main className="app-main">
                <AppHeader />
                <div className="app-content">
                  <div className="container">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/users" element={<UsersManager />} />
                      <Route path="/boats" element={<BoatManager />} />
                      <Route path="/products" element={<ProductsManager />} />
                      <Route path="/orders" element={<OrdersManager />} />
                      <Route path="/bookings" element={<BookingsManager />} />
                      <Route path="/owners" element={<OwnersManager />} />
                      <Route path="/payments" element={<PaymantsManager />} />
                    </Routes>
                  </div>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;