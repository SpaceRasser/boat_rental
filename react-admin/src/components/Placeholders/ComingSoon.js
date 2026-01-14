import React from 'react';
import './ComingSoon.css';

const ComingSoon = ({ title, icon, description }) => {
  return (
    <div className="coming-soon-page">
      <div className="coming-soon-icon">{icon}</div>
      <h1 className="coming-soon-title">{title}</h1>
      <p className="coming-soon-description">{description}</p>
      
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '65%' }}></div>
        </div>
        <span className="progress-text">Разработка завершена на 65%</span>
      </div>
      
      <div className="features-list">
        <div className="feature">
          <span className="feature-check">✅</span>
          <span className="feature-text">Интерфейс пользователей готов</span>
        </div>
        <div className="feature">
          <span className="feature-check">✅</span>
          <span className="feature-text">API подключено</span>
        </div>
        <div className="feature">
          <span className="feature-in-progress">🔄</span>
          <span className="feature-text">CRUD операции для этого раздела</span>
        </div>
        <div className="feature">
          <span className="feature-pending">⏳</span>
          <span className="feature-text">Графики и отчеты</span>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;