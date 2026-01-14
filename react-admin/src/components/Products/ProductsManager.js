import React, { useState, useEffect } from 'react';
import './ProductsManager.css';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Данные формы
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Другое',
    price: '',
    price_discount: '',
    quantity: 0,
    available: true,
    image_url: ''
  });

  // Категории товаров
  const categories = [
    'Термосы',
    'Палатки', 
    'Удочки',
    'Спальные мешки',
    'Кемпинговая мебель',
    'Навигация',
    'Рыболовные снасти',
    'Одежда',
    'Обувь',
    'Другое'
  ];

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/boat_rental/api/products/get.php');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products || []);
      } else {
        showNotification('Ошибка загрузки товаров: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      showNotification('Ошибка подключения к серверу', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ========== УВЕДОМЛЕНИЯ ==========
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // ========== ДОБАВЛЕНИЕ ТОВАРА ==========
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name || !formData.price) {
      showNotification('Заполните название и цену', 'error');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      showNotification('Цена должна быть больше 0', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost/boat_rental/api/products/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Товар успешно добавлен!', 'success');
        setShowAddForm(false);
        resetForm();
        fetchProducts();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка добавления:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== РЕДАКТИРОВАНИЕ ТОВАРА ==========
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'Другое',
      price: product.price || '',
      price_discount: product.price_discount || '',
      quantity: product.quantity || 0,
      available: product.available === '1' || product.available === true,
      image_url: product.image_url || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      showNotification('Заполните название и цену', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost/boat_rental/api/products/update.php?id=${selectedProduct.id_product}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Товар успешно обновлен!', 'success');
        setShowEditForm(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка обновления:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== УДАЛЕНИЕ ТОВАРА ==========
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить товар? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost/boat_rental/api/products/delete.php?id=${id}`, {
        method: 'DELETE'
      });
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success) {
        showNotification('✅ Товар успешно удален!', 'success');
        fetchProducts();
      } else {
        showNotification('❌ Ошибка: ' + (data.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      showNotification('Ошибка сети', 'error');
    }
  };

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Другое',
      price: '',
      price_discount: '',
      quantity: 0,
      available: true,
      image_url: ''
    });
  };

  // Фильтрация товаров
  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Форматирование цены
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ₽';
  };

  // Статистика по категориям
  const categoryStats = {};
  products.forEach(item => {
    const category = item.category || 'Другое';
    categoryStats[category] = (categoryStats[category] || 0) + 1;
  });

  // ========== ИНТЕРФЕЙС ==========
  return (
    <div className="products-manager">
      {/* Уведомление */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Заголовок */}
      <div className="products-header">
        <h1>
          <span className="products-icon">🎒</span>
          Управление товарами
        </h1>
        <button 
          className="btn-add-product"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
        >
          <span className="btn-icon">+</span>
          Добавить товар
        </button>
      </div>

      {/* Статистика */}
      <div className="products-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Всего товаров</h3>
              <div className="stat-number">{products.length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>В наличии</h3>
              <div className="stat-number available">
                {products.filter(p => p.available === '1' || p.available === true).length}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <h3>Категорий</h3>
              <div className="stat-number">{Object.keys(categoryStats).length}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Средняя цена</h3>
              <div className="stat-number">
                {products.length > 0 
                  ? formatPrice(products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length)
                  : '0 ₽'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="products-filters">
        <div className="filter-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <label>Категория:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">Все категории</option>
              {Object.keys(categoryStats).map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({categoryStats[cat]})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Быстрые категории */}
        <div className="quick-categories">
          <button 
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Все
          </button>
          {categories.slice(0, 6).map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Список товаров */}
      <div className="products-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка товаров...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎒</div>
            <h3>Товаров не найдено</h3>
            <p>{search || selectedCategory !== 'all' ? 'Попробуйте изменить фильтры' : 'Добавьте первый товар'}</p>
            {!search && selectedCategory === 'all' && (
              <button 
                className="btn-add-first"
                onClick={() => setShowAddForm(true)}
              >
                Добавить товар
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((item) => (
              <div key={item.id_product} className="product-card">
                <div className="product-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <div className="product-image-placeholder">
                      <span className="placeholder-icon">📦</span>
                    </div>
                  )}
                  <div className="product-category">
                    {item.category || 'Другое'}
                  </div>
                  <div className={`product-status ${item.available === '1' || item.available === true ? 'available' : 'unavailable'}`}>
                    {item.available === '1' || item.available === true ? 'В наличии' : 'Нет в наличии'}
                  </div>
                </div>
                
                <div className="product-content">
                  <div className="product-header">
                    <h3 className="product-name">{item.name}</h3>
                    <span className="product-id">#{item.id_product}</span>
                  </div>
                  
                  {item.description && (
                    <p className="product-description">{item.description}</p>
                  )}
                  
                  <div className="product-details">
                    <div className="product-price">
                      <span className="price-current">{formatPrice(item.price)}</span>
                      {item.price_discount && (
                        <span className="price-discount">
                          {formatPrice(item.price_discount)}
                        </span>
                      )}
                    </div>
                    
                    <div className="product-meta">
                      <span className="meta-item">
                        <span className="meta-icon">📦</span>
                        {item.quantity} шт.
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        {item.created_at}
                      </span>
                    </div>
                    
                    {item.quantity <= 5 && item.quantity > 0 && (
                      <div className="low-stock-warning">
                        ⚠️ Осталось мало: {item.quantity} шт.
                      </div>
                    )}
                    
                    {item.quantity === 0 && (
                      <div className="out-of-stock">
                        ❌ Нет в наличии
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="product-actions">
                  <button 
                    className="btn-edit-product"
                    onClick={() => handleEditClick(item)}
                  >
                    ✏️ Изменить
                  </button>
                  <button 
                    className="btn-delete-product"
                    onClick={() => handleDeleteProduct(item.id_product)}
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ========== */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Добавить товар</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="product-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Название товара *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Например: Термос 1л"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Описание</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Описание товара, характеристики..."
                    rows="3"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Категория</label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="quantity">Количество</label>
                    <input
                      type="number"
                      id="quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Цена (₽) *</label>
                    <input
                      type="number"
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="1500.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price_discount">Цена со скидкой (₽)</label>
                    <input
                      type="number"
                      id="price_discount"
                      value={formData.price_discount}
                      onChange={(e) => setFormData({...formData, price_discount: e.target.value})}
                      placeholder="1200.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="image_url">Ссылка на фото</label>
                  <input
                    type="url"
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://example.com/product.jpg"
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    />
                    <span className="checkbox-text">Доступен для заказа</span>
                  </label>
                </div>
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
                  Сохранить товар
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ========== */}
      {showEditForm && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Редактировать товар</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="product-form">
              <div className="form-section">
                <h3>Основная информация</h3>
                
                <div className="form-group">
                  <label htmlFor="edit-name">Название товара *</label>
                  <input
                    type="text"
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-description">Описание</label>
                  <textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-category">Категория</label>
                    <select
                      id="edit-category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-quantity">Количество</label>
                    <input
                      type="number"
                      id="edit-quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-price">Цена (₽) *</label>
                    <input
                      type="number"
                      id="edit-price"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-price_discount">Цена со скидкой (₽)</label>
                    <input
                      type="number"
                      id="edit-price_discount"
                      value={formData.price_discount}
                      onChange={(e) => setFormData({...formData, price_discount: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-image_url">Ссылка на фото</label>
                  <input
                    type="url"
                    id="edit-image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    />
                    <span className="checkbox-text">Доступен для заказа</span>
                  </label>
                </div>
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

export default ProductsManager;