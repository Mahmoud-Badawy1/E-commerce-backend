# Product Variations Frontend Implementation Guide

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
    "colors": ["Red", "Blue", "Green"],
    "sizes": ["S", "M", "L", "XL"],
    "variations": [
      {
        "_id": "variation_id",
        "color": "Red",
        "size": "M",
        "sku": "PROD-001-RED-M",
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
```

#### 2. Check Variation Stock Availability
```http
GET /api/products/:productId/variations/check-stock?color=Red&size=M&quantity=2
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "color": "Red",
    "size": "M",
    "availableStock": 45,
    "requestedQuantity": 2,
    "inStock": true,
    "isActive": true,
    "price": 27
  }
}
```

---

### **Seller Endpoints (Requires Authentication as Seller)**

#### 3. Add Single Variation
```http
POST /api/products/:productId/variations
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "color": "Red",
  "size": "M",
  "sku": "PROD-001-RED-M",  // Optional - auto-generated if not provided
  "price": 29.99,            // Optional - uses product price if not provided
  "discountPercentage": 10,  // Optional
  "quantity": 50,
  "lowStockThreshold": 5,
  "image": "https://..."     // Optional - uses product cover image if not provided
}
```

#### 4. Bulk Add Variations (Creates all combinations)
```http
POST /api/products/:productId/variations/bulk
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "colors": ["Red", "Blue", "Green"],
  "sizes": ["S", "M", "L", "XL"],
  "defaultPrice": 29.99,        // Optional
  "defaultQuantity": 20,        // Optional - defaults to 0
  "defaultLowStockThreshold": 5 // Optional - defaults to 5
}
```

This creates all combinations (e.g., Red-S, Red-M, Red-L, Red-XL, Blue-S, etc.)

#### 5. Update Variation
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

#### 6. Delete Variation
```http
DELETE /api/products/:productId/variations/:variationId
Authorization: Bearer <token>
```

#### 7. Adjust Variation Stock
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

#### 8. Get Low Stock Variations (Seller's Products)
```http
GET /api/products/variations/low-stock
Authorization: Bearer <token>
```

---

## Frontend Implementation Examples

### **1. Product Page with Variation Selection**

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductPage = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
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
        
        // Set default selections
        if (variationsResponse.data.data.colors.length > 0) {
          setSelectedColor(variationsResponse.data.data.colors[0]);
        }
        if (variationsResponse.data.data.sizes.length > 0) {
          setSelectedSize(variationsResponse.data.data.sizes[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    // Find selected variation when color or size changes
    if (selectedColor && selectedSize && variations) {
      const variation = variations.variations.find(
        v => v.color === selectedColor && v.size === selectedSize
      );
      setSelectedVariation(variation);
      
      // Check stock availability
      checkStock();
    }
  }, [selectedColor, selectedSize, variations]);

  const checkStock = async () => {
    if (!selectedColor || !selectedSize) return;
    
    try {
      const response = await axios.get(
        `/api/products/${productId}/variations/check-stock`,
        {
          params: {
            color: selectedColor,
            size: selectedSize,
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
        color: selectedColor,
        size: selectedSize,
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
          {selectedVariation?.priceAfterDiscount || product.priceAfterDiscount} EGP
          {selectedVariation?.discountPercentage > 0 && (
            <span className="original-price">
              {selectedVariation?.price || product.price} EGP
            </span>
          )}
        </p>

        {variations.hasVariations && (
          <>
            {/* Color Selection */}
            <div className="color-selection">
              <label>Color:</label>
              <div className="color-options">
                {variations.colors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="size-selection">
              <label>Size:</label>
              <div className="size-options">
                {variations.sizes.map(size => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

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

## Database Schema

The product variations are stored in the Product model:

```javascript
{
  hasVariations: Boolean,
  colors: [String],           // Available colors
  sizes: [String],            // Available sizes
  variations: [
    {
      color: String,
      size: String,
      sku: String,
      price: Number,
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
```

---

## Important Notes

1. **Stock Management**: Each variation has its own stock (`quantity`) and `reservedStock` (for pending orders)
2. **Pricing**: Variations can have their own prices or inherit from the main product
3. **Images**: Each variation can have its own image or use the product's cover image
4. **SKU**: Auto-generated as `{PRODUCT_SKU}-{COLOR}-{SIZE}` if not provided
5. **Low Stock**: Each variation has its own low stock threshold and tracking
6. **Active Status**: Variations can be deactivated without deleting them

---

## Workflow

1. **Seller creates a product** → Basic product with title, description, category, etc.
2. **Seller adds variations** → Uses bulk add to create all color-size combinations
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
