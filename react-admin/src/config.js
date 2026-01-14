// Конфигурация API URL
// В Docker используем имя сервиса, локально - localhost
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost/boat_rental/api';

export default API_BASE_URL;
