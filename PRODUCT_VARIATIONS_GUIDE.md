# Product Variations Frontend Implementation Guide

## ⚠️ BREAKING CHANGES - New Dynamic Variation System

**Date:** February 2026

The variation system now supports **dynamic attributes** for all product types!

**What Changed:**
- Request/response format changed from `color, size` to `variationOptions: { key: value }`
- Frontend must handle dynamic attribute names (not hardcoded)
- Cart and order APIs now use `variationOptions` Map
- Each variation has mandatory price field

**Action Required:** Update your frontend to use the new dynamic structure shown below.

---

## Overview
Product variations allow products to have different combinations of colors and sizes, each with their own stock levels, prices, and availability. This guide will help you implement this feature in your frontend application.

---

## Backend API Endpoints

### **Public Endpoints (No Authentication Required)**

#### 1. Get Product Variations
```http
GET /api/products/:productId/variations
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "hasVariations": true,
    "variations": {
      "axes": ["Color", "Size"],
      "items": [
        {
          "_id": "variation_id",
          "sku": "PROD-001-RED-M",
          "options": {
            "Color": "Red",
            "Size": "M"
          },
          "price": 29.99,
          "discountPercentage": 10,
          "priceAfterDiscount": 27,
          "quantity": 50,
          "reservedStock": 5,
          "lowStockThreshold": 5,
          "isLowStock": false,
          "image": "https://...",
          "isActive": true
        }
      ]
    }
  }
}
```

#### 2. Check Variation Stock Availability

**Method 1: GET (Simple)**
```http
GET /api/products/:productId/variations/check-stock?variationOptions={"Color":"Red","Size":"M"}&quantity=2
```

**Method 2: POST (Recommended for complex options)**
```http
POST /api/products/:productId/variations/check-stock
Content-Type: application/json

{
  "variationOptions": {
    "Color": "Red",
    "Size": "M"
  },
  "quantity": 2
}
```

**Example for Phone:**
```http
POST /api/products/:productId/variations/check-stock

{
  "variationOptions": {
    "Color": "Black",
    "Storage": "256GB",
    "RAM": "12GB"
  },
  "quantity": 1
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "options": {
      "Color": "Red",
      "Size": "M"
    },
    "availableStock": 45,
    "requestedQuantity": 2,
    "inStock": true,
    "isActive": true,
    "price": 27,
    "priceAfterDiscount": 24.30
  }
}
```

#### 3. Get Available Options (Smart Filtering - Amazon Style)

**Purpose:** Progressive attribute selection. Show only available options based on what user already selected.

```http
POST /api/products/:productId/variations/available-options
Content-Type: application/json

{
  "selectedOptions": {
    "Color": "Red"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "availableOptions": {
      "Size": ["S", "M", "L", "XL"]
    },
    "matchingVariations": [
      {
        "_id": "65f8b001",
        "options": {
          "Color": "Red",
          "Size": "S"
        },
        "price": 255,
        "priceAfterDiscount": 217,
        "quantity": 20,
        "isLowStock": false
      },
      {
        "_id": "65f8b002",
        "options": {
          "Color": "Red",
          "Size": "M"
        },
        "price": 255,
        "priceAfterDiscount": 217,
        "quantity": 50,
        "isLowStock": false
      }
      // ... more Red variations
    ]
  }
}
```

**Use Cases:**
- User selects Color → Show available Sizes for that Color
- User selects Color + Storage → Show available RAM options
- Works with any number of attributes

---

### **Seller Endpoints (Requires Authentication as Seller)**

#### 4. Create Product with Variations (Single Step)
```http
POST /api/products/seller
Authorization: Bearer <token>
```

**Request Body (Product + Dynamic Variations):**
```json
{
  "title": "Premium Cotton T-Shirt",
  "slug": "premium-cotton-tshirt",
  "sku": "TSHIRT-001",
  "description": "High-quality cotton t-shirt",
  "imageCover": "https://...",
  "category": "category_id",
  "status": "published",
  "variationData": {
    "axes": ["Color", "Size"],
    "items": [
      {
        "options": { "Color": "Red", "Size": "S" },
        "price": 255,
        "discountPercentage": 15,
        "quantity": 20
      },
      {
        "options": { "Color": "Red", "Size": "M" },
        "price": 255,
        "quantity": 20
      },
      {
        "options": { "Color": "Blue", "Size": "S" },
        "price": 255,
        "quantity": 20
      }
      // ... more combinations
    ]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Product created with 12 variations",
  "data": {
    "product": { /* full product object */ },
    "addedVariations": [
      "Color: Red, Size: S",
      "Color: Red, Size: M",
      "Color: Blue, Size: S"
      // ...
    ]
  }
}
```

#### 4. Add Single Variation
```http
POST /api/products/:productId/variations
Authorization: Bearer <token>
```

**Request Body (Dynamic Attributes):**
```json
{
  "options": {
    "Color": "Red",
    "Size": "M"
  },
  "price": 29.99,            // Required - no inheritance from product
  "discountPercentage": 10,  // Optional
  "quantity": 50,
  "lowStockThreshold": 5,
  "image": "https://..."     // Optional - uses product cover image if not provided
}
```

**Example for Electronics:**
```json
{
  "options": {
    "Storage": "512GB",
    "Color": "Midnight"
  },
  "price": 1299,
  "quantity": 25
}
```

#### 5. Bulk Add Variations (**DEPRECATED**)

**⚠️ Old Endpoint:** This is being phased out. Use single-step product creation (endpoint #3) instead.

#### 6. Update Variation
```http
PUT /api/products/:productId/variations/:variationId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "price": 34.99,
  "discountPercentage": 15,
  "quantity": 100,
  "lowStockThreshold": 10,
  "image": "https://...",
  "isActive": false
}
```

#### 7. Delete Variation
```http
DELETE /api/products/:productId/variations/:variationId
Authorization: Bearer <token>
```

#### 8. Adjust Variation Stock
```http
PUT /api/products/:productId/variations/:variationId/adjust-stock
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 75,
  "type": "adjustment",  // Optional: purchase, sale, return, adjustment, reserved, released
  "notes": "Restocked from supplier"
}
```

#### 9. Get Low Stock Variations (Seller's Products)
```http
GET /api/products/variations/low-stock
Authorization: Bearer <token>
```

---

## Frontend Implementation Examples

### **1. Product Page with Dynamic Variation Selection**

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductPage = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({}); // Dynamic options object
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);

  useEffect(() => {
    // Fetch product details
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data.data);
        
        // Fetch variations
        const variationsResponse = await axios.get(`/api/products/${productId}/variations`);
        setVariations(variationsResponse.data.data);
        
        // Set default selections for first axis if available
        if (variationsResponse.data.data.variations?.axes?.length > 0) {
          const firstAxisName = variationsResponse.data.data.variations.axes[0];
          const firstItem = variationsResponse.data.data.variations.items[0];
          if (firstItem) {
            // Initialize with first variation's options
            const initialOptions = {};
            firstItem.options.forEach((value, key) => {
              initialOptions[key] = value;
            });
            setSelectedOptions(initialOptions);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    // Find selected variation when options change
    if (Object.keys(selectedOptions).length > 0 && variations) {
      const variation = variations.variations.items.find(item => {
        // Compare all options
        for (const [key, value] of Object.entries(selectedOptions)) {
          if (item.options.get(key) !== value) {
            return false;
          }
        }
        return true;
      });
      setSelectedVariation(variation);
      
      // Check stock availability
      if (variation) {
        checkStock();
      }
    }
  }, [selectedOptions, variations]);

  const checkStock = async () => {
    if (Object.keys(selectedOptions).length === 0) return;
    
    try {
      const response = await axios.get(
        `/api/products/${productId}/variations/check-stock`,
        {
          params: {
            variationOptions: JSON.stringify(selectedOptions),
            quantity: 1
          }
        }
      );
      setStockInfo(response.data.data);
    } catch (error) {
      console.error('Error checking stock:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariation || !stockInfo?.inStock) {
      alert('This variation is out of stock');
      return;
    }

    try {
      await axios.post('/api/cart', {
        productId: product._id,
        quantity: 1,
        variationOptions: selectedOptions,
        variationId: selectedVariation._id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  if (!product || !variations) return <div>Loading...</div>;

  return (
    <div className="product-page">
      <div className="product-images">
        <img 
          src={selectedVariation?.image || product.imageCover} 
          alt={product.title} 
        />
      </div>

      <div className="product-info">
        <h1>{product.title}</h1>
        <p className="price">
          {selectedVariation?.priceAfterDiscount || selectedVariation?.price} EGP
          {selectedVariation?.discountPercentage > 0 && (
            <span className="original-price">
              {selectedVariation?.price} EGP
            </span>
          )}
        </p>

        {variations.hasVariations && variations.variations?.axes && (
          <>
            {/* Dynamic Attribute Selection */}
            {variations.variations.axes.map(axisName => {
              // Get unique values for this axis from all variations
              const uniqueValues = [
                ...new Set(
                  variations.variations.items
                    .map(item => item.options.get(axisName))
                    .filter(Boolean)
                )
              ];

              return (
                <div key={axisName} className="attribute-selection">
                  <label>{axisName}:</label>
                  <div className="attribute-options">
                    {uniqueValues.map(value => (
                      <button
                        key={value}
                        className={`attribute-btn ${
                          selectedOptions[axisName] === value ? 'active' : ''
                        }`}
                        onClick={() => 
                          setSelectedOptions(prev => ({
                            ...prev,
                            [axisName]: value
                          }))
                        }
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Stock Information */}
            {stockInfo && (
              <div className="stock-info">
                {stockInfo.inStock ? (
                  <p className="in-stock">
                    ✓ In Stock ({stockInfo.availableStock} available)
                  </p>
                ) : (
                  <p className="out-of-stock">✗ Out of Stock</p>
                )}
              </div>
            )}
          </>
        )}

        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={!stockInfo?.inStock}
        >
          {stockInfo?.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductPage;
```

---

### **2. Seller Dashboard - Add Variations**

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const AddVariations = ({ productId }) => {
  const [bulkMode, setBulkMode] = useState(true);
  const [colors, setColors] = useState('');
  const [sizes, setSizes] = useState('');
  const [defaultQuantity, setDefaultQuantity] = useState(20);
  const [loading, setLoading] = useState(false);

  const handleBulkAdd = async () => {
    setLoading(true);
    try {
      const colorsArray = colors.split(',').map(c => c.trim());
      const sizesArray = sizes.split(',').map(s => s.trim());

      const response = await axios.post(
        `/api/products/${productId}/variations/bulk`,
        {
          colors: colorsArray,
          sizes: sizesArray,
          defaultQuantity: parseInt(defaultQuantity),
          defaultLowStockThreshold: 5
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      alert(`Success! ${response.data.data.added.length} variations added`);
      setColors('');
      setSizes('');
    } catch (error) {
      console.error('Error adding variations:', error);
      alert('Failed to add variations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-variations">
      <h2>Add Product Variations</h2>

      <div className="form-group">
        <label>Colors (comma-separated):</label>
        <input
          type="text"
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          placeholder="Red, Blue, Green, Black, White"
        />
      </div>

      <div className="form-group">
        <label>Sizes (comma-separated):</label>
        <input
          type="text"
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
          placeholder="S, M, L, XL, XXL"
        />
      </div>

      <div className="form-group">
        <label>Default Quantity per Variation:</label>
        <input
          type="number"
          value={defaultQuantity}
          onChange={(e) => setDefaultQuantity(e.target.value)}
          min="0"
        />
      </div>

      <button 
        onClick={handleBulkAdd} 
        disabled={loading || !colors || !sizes}
      >
        {loading ? 'Adding...' : 'Add All Variations'}
      </button>

      <p className="info">
        This will create {colors.split(',').length} × {sizes.split(',').length} = 
        {colors.split(',').length * sizes.split(',').length} variations
      </p>
    </div>
  );
};

export default AddVariations;
```

---

### **3. Seller Dashboard - Manage Variations**

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageVariations = ({ productId }) => {
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVariations();
  }, [productId]);

  const fetchVariations = async () => {
    try {
      const response = await axios.get(`/api/products/${productId}/variations`);
      setVariations(response.data.data.variations);
    } catch (error) {
      console.error('Error fetching variations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (variationId, newQuantity) => {
    try {
      await axios.put(
        `/api/products/${productId}/variations/${variationId}/adjust-stock`,
        {
          quantity: parseInt(newQuantity),
          type: 'adjustment',
          notes: 'Stock updated from dashboard'
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Stock updated successfully');
      fetchVariations();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const handleUpdatePrice = async (variationId, newPrice) => {
    try {
      await axios.put(
        `/api/products/${productId}/variations/${variationId}`,
        {
          price: parseFloat(newPrice)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Price updated successfully');
      fetchVariations();
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price');
    }
  };

  const handleDelete = async (variationId) => {
    if (!confirm('Are you sure you want to delete this variation?')) return;

    try {
      await axios.delete(
        `/api/products/${productId}/variations/${variationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Variation deleted successfully');
      fetchVariations();
    } catch (error) {
      console.error('Error deleting variation:', error);
      alert('Failed to delete variation');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="manage-variations">
      <h2>Manage Variations</h2>
      
      <table className="variations-table">
        <thead>
          <tr>
            <th>Color</th>
            <th>Size</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Available</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {variations.map(variation => {
            const availableStock = variation.quantity - variation.reservedStock;
            return (
              <tr key={variation._id} className={variation.isLowStock ? 'low-stock' : ''}>
                <td>{variation.color}</td>
                <td>{variation.size}</td>
                <td>{variation.sku}</td>
                <td>
                  <input
                    type="number"
                    defaultValue={variation.price}
                    onBlur={(e) => {
                      if (e.target.value !== variation.price.toString()) {
                        handleUpdatePrice(variation._id, e.target.value);
                      }
                    }}
                    step="0.01"
                    style={{ width: '80px' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={variation.quantity}
                    onBlur={(e) => {
                      if (e.target.value !== variation.quantity.toString()) {
                        handleUpdateStock(variation._id, e.target.value);
                      }
                    }}
                    style={{ width: '60px' }}
                  />
                </td>
                <td>
                  <span className={availableStock <= variation.lowStockThreshold ? 'warning' : ''}>
                    {availableStock}
                  </span>
                </td>
                <td>
                  <span className={variation.isActive ? 'active' : 'inactive'}>
                    {variation.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleDelete(variation._id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ManageVariations;
```

---

### **4. Low Stock Alerts**

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LowStockAlerts = () => {
  const [lowStockVariations, setLowStockVariations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const response = await axios.get('/api/products/variations/low-stock', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLowStockVariations(response.data.data);
    } catch (error) {
      console.error('Error fetching low stock:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="low-stock-alerts">
      <h2>⚠️ Low Stock Alerts ({lowStockVariations.length})</h2>
      
      {lowStockVariations.length === 0 ? (
        <p>No low stock variations</p>
      ) : (
        <div className="alert-list">
          {lowStockVariations.map(item => (
            <div key={`${item.productId}-${item.variationId}`} className="alert-item">
              <h3>{item.productTitle}</h3>
              <p>
                <strong>{item.color} - {item.size}</strong> | 
                SKU: {item.sku}
              </p>
              <p className="stock-warning">
                Available: {item.availableStock} / Threshold: {item.lowStockThreshold}
              </p>
              <a href={`/seller/products/${item.productId}/variations`}>
                Manage Stock →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;
```

---

### **5. Smart Filtering Product Page (Amazon-Style UX) 🚀**

**Progressive attribute selection - show only available options as user selects.**

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SmartFilterProductPage = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [axes, setAxes] = useState([]); // ["Color", "Size"]
  const [selectedOptions, setSelectedOptions] = useState({}); // { Color: "Red" }
  const [availableOptions, setAvailableOptions] = useState({}); // Smart filtered options
  const [matchingVariations, setMatchingVariations] = useState([]);
  const [finalVariation, setFinalVariation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductWithVariations();
  }, [productId]);

  const fetchProductWithVariations = async () => {
    try {
      const response = await axios.get(`/api/products/${productId}/variations`);
      const data = response.data.data;
      
      setProduct(response.data.data.product);
      
      if (data.variations?.axes) {
        setAxes(data.variations.axes);
        
        // Initialize availableOptions with all unique values for first axis
        const firstAxis = data.variations.axes[0];
        const availableFirstAxisValues = data.variations.availableOptionsByAxis[firstAxis];
        
        setAvailableOptions({
          [firstAxis]: availableFirstAxisValues
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  // Fetch available options when user selects an attribute
  useEffect(() => {
    if (Object.keys(selectedOptions).length > 0) {
      fetchAvailableOptions();
    }
  }, [selectedOptions]);

  const fetchAvailableOptions = async () => {
    try {
      const response = await axios.post(
        `/api/products/${productId}/variations/available-options`,
        { selectedOptions }
      );
      
      const data = response.data.data;
      setAvailableOptions(data.availableOptions);
      setMatchingVariations(data.matchingVariations);
      
      // If all attributes selected, set final variation
      if (Object.keys(selectedOptions).length === axes.length) {
        setFinalVariation(data.matchingVariations[0] || null);
      } else {
        setFinalVariation(null);
      }
    } catch (error) {
      console.error('Error fetching available options:', error);
    }
  };

  const handleSelectOption = (axisName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [axisName]: value
    }));
  };

  const handleAddToCart = async () => {
    if (!finalVariation) {
      alert('Please select all options');
      return;
    }

    try {
      await axios.post('/api/cart', {
        productId: product._id,
        quantity: 1,
        variationOptions: selectedOptions,
        variationId: finalVariation._id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="smart-filter-product-page">
      <div className="product-image">
        <img 
          src={finalVariation?.image || product.imageCover} 
          alt={product.title} 
        />
      </div>

      <div className="product-details">
        <h1>{product.title}</h1>
        
        {/* Display price */}
        {finalVariation ? (
          <div className="price">
            <span className="current-price">
              {finalVariation.priceAfterDiscount || finalVariation.price} EGP
            </span>
            {finalVariation.discountPercentage > 0 && (
              <span className="original-price">
                {finalVariation.price} EGP
              </span>
            )}
          </div>
        ) : (
          <p className="select-prompt">Select options to see price</p>
        )}

        {/* Progressive attribute selection */}
        <div className="attribute-selection">
          {axes.map((axisName, index) => {
            const isSelected = selectedOptions[axisName] !== undefined;
            const isPreviousSelected = index === 0 || selectedOptions[axes[index - 1]] !== undefined;
            const options = availableOptions[axisName] || [];

            return (
              <div 
                key={axisName} 
                className={`attribute-group ${!isPreviousSelected ? 'disabled' : ''}`}
              >
                <label>
                  {axisName}: 
                  {isSelected && <strong> {selectedOptions[axisName]}</strong>}
                </label>
                
                {isPreviousSelected && (
                  <div className="options-grid">
                    {options.map(value => (
                      <button
                        key={value}
                        className={`option-btn ${
                          selectedOptions[axisName] === value ? 'selected' : ''
                        }`}
                        onClick={() => handleSelectOption(axisName, value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                )}
                
                {!isPreviousSelected && (
                  <p className="help-text">
                    Select {axes[index - 1]} first
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Stock status */}
        {finalVariation && (
          <div className="stock-status">
            {finalVariation.quantity > 0 ? (
              <p className="in-stock">
                ✓ In Stock ({finalVariation.quantity} available)
                {finalVariation.isLowStock && <span className="low-stock-badge">Low Stock!</span>}
              </p>
            ) : (
              <p className="out-of-stock">✗ Out of Stock</p>
            )}
          </div>
        )}

        {/* Matching variations preview (when not all selected) */}
        {!finalVariation && matchingVariations.length > 0 && (
          <div className="matching-preview">
            <p>{matchingVariations.length} options available</p>
            <div className="price-range">
              Price range: {Math.min(...matchingVariations.map(v => v.priceAfterDiscount || v.price))} - 
              {Math.max(...matchingVariations.map(v => v.priceAfterDiscount || v.price))} EGP
            </div>
          </div>
        )}

        {/* Add to cart button */}
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={!finalVariation || finalVariation.quantity === 0}
        >
          {finalVariation 
            ? (finalVariation.quantity > 0 ? 'Add to Cart' : 'Out of Stock')
            : 'Select All Options'
          }
        </button>
      </div>
    </div>
  );
};

export default SmartFilterProductPage;
```

**How It Works:**

1. **Initial Load**: Shows all available values for first attribute (e.g., all Colors)
2. **User Selects Color**: Calls `available-options` API → Shows only Sizes available in that Color
3. **User Selects Size**: Shows final variation with exact price, stock, image
4. **Progressive Disclosure**: Next attribute options appear only after previous selection

**Benefits:**
✅ No overwhelming dropdowns with 50+ combinations
✅ Always shows only available options (no "Out of Stock" selections)
✅ Works with any number of attributes (2, 3, 4+)
✅ Shows price range before final selection
✅ Clear visual feedback on selection progress

---

## Database Schema

The product variations are stored in the Product model with a dynamic structure:

```javascript
{
  hasVariations: Boolean,
  
  variations: {
    // Dynamic axes - can be any attributes (Color, Size, Storage, Material, etc.)
    axes: [String],  // Example: ["Color", "Storage"] or ["Material", "Finish"]
    
    // Variation items
    items: [
      {
        sku: String,
        
        // Dynamic options as Map (key-value pairs)
        options: Map<String, String>,  // Example: { "Color": "Red", "Size": "M" }
        
        price: Number,              // Required - no inheritance from product
        discountPercentage: Number,
        priceAfterDiscount: Number,
        quantity: Number,
        reservedStock: Number,
        lowStockThreshold: Number,
        isLowStock: Boolean,
        image: String,
        isActive: Boolean
      }
    ]
  }
}
```

**Examples of Different Product Types:**

```javascript
// Clothing Product
{
  "variations": {
    "axes": ["Color", "Size"],
    "items": [
      {
        "options": { "Color": "Red", "Size": "M" },
        "price": 29.99
      }
    ]
  }
}

// Electronics Product
{
  "variations": {
    "axes": ["Storage", "Color"],
    "items": [
      {
        "options": { "Storage": "256GB", "Color": "Black" },
        "price": 999
      }
    ]
  }
}

// Furniture Product
{
  "variations": {
    "axes": ["Material", "Finish", "Size"],
    "items": [
      {
        "options": { "Material": "Oak", "Finish": "Natural", "Size": "Large" },
        "price": 599
      }
    ]
  }
}
```

---

## Important Notes

1. **Stock Management**: Each variation has its own stock (`quantity`) and `reservedStock` (for pending orders)
2. **Pricing**: Each variation MUST have its own price (no inheritance from product) - prevents double-discount issues
3. **Dynamic Attributes**: Use any attribute names - not limited to color/size (Storage, RAM, Material, Finish, etc.)
4. **Images**: Each variation can have its own image or use the product's cover image
5. **SKU**: Auto-generated from all option values if not provided (e.g., `PROD-001-RED-M` or `PHONE-BLACK-256GB`)
6. **Low Stock**: Each variation has its own low stock threshold and tracking
7. **Active Status**: Variations can be deactivated without deleting them
8. **Map Storage**: Options are stored as MongoDB Map for efficient querying

---

## Workflow

### Option 1: Single Step (⚡ Faster - Recommended)
1. **Seller creates product WITH variations** → Product + all variations in one API call
2. **Seller manages stock** → Updates quantity for each variation as needed
3. **Customer browses** → Sees product and selects color/size
4. **System checks stock** → Verifies availability for selected variation
5. **Customer adds to cart** → Cart stores variation details
6. **Order placed** → Stock is reserved for the specific variation
7. **Order fulfilled** → Reserved stock is consumed from the variation

### Option 2: Two Steps (More Flexible)
1. **Seller creates a product** → Basic product with title, description, category, etc.
2. **Seller adds variations** → Uses bulk add or single add to create variations
3. **Seller manages stock** → Updates quantity for each variation
4. **Customer browses** → Sees product and selects color/size
5. **System checks stock** → Verifies availability for selected variation
6. **Customer adds to cart** → Cart stores variation details
7. **Order placed** → Stock is reserved for the specific variation
8. **Order fulfilled** → Reserved stock is consumed from the variation

---

## CSS Styling Example

```css
/* Product page variations */
.color-options, .size-options {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.color-btn, .size-btn {
  padding: 10px 20px;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.color-btn.active, .size-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.in-stock {
  color: green;
  font-weight: bold;
}

.out-of-stock {
  color: red;
  font-weight: bold;
}

/* Seller dashboard */
.variations-table {
  width: 100%;
  border-collapse: collapse;
}

.variations-table th,
.variations-table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.variations-table tr.low-stock {
  background-color: #fff3cd;
}

.alert-item {
  border: 1px solid #f5c6cb;
  background: #f8d7da;
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
}

.stock-warning {
  color: #721c24;
  font-weight: bold;
}
```

---

## Testing Checklist

- [ ] Create product with variations
- [ ] Bulk add variations for all color-size combinations
- [ ] Update individual variation stock
- [ ] Update individual variation price
- [ ] Check stock availability before adding to cart
- [ ] Add to cart with specific variation
- [ ] Display correct price for selected variation
- [ ] Show correct image for selected variation
- [ ] Handle out-of-stock variations
- [ ] View low stock alerts
- [ ] Delete variation
- [ ] Deactivate variation

---

Need help with a specific implementation? Let me know! 🚀
