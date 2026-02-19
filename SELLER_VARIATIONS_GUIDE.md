# Product Variations - Seller Guide

## Overview
As a seller, you can create products with multiple variations (colors, sizes), manage their stock individually, and track inventory for each variation.

---

## 🏪 Seller Endpoints

### 1. Create Product (Basic)

**Endpoint:**
```http
POST /api/products/seller
Authorization: Bearer {seller_token}
```

**Request Body:**
```json
{
  "title": "Premium Cotton T-Shirt",
  "slug": "premium-cotton-tshirt",
  "sku": "TSHIRT-001",
  "description": "High-quality 100% cotton t-shirt with modern fit. Breathable and comfortable for all-day wear.",
  "price": 299.99,
  "discountPercentage": 15,
  "quantity": 0,
  "imageCover": "https://cloudinary.com/.../tshirt-cover.jpg",
  "images": [
    "https://cloudinary.com/.../tshirt-1.jpg",
    "https://cloudinary.com/.../tshirt-2.jpg"
  ],
  "category": "65f7c0000000000000000003",
  "status": "published"
}
```

**Response:**
```json
{
  "data": {
    "_id": "65f8a1234567890abcdef123",
    "title": "Premium Cotton T-Shirt",
    "slug": "premium-cotton-tshirt",
    "sku": "TSHIRT-001",
    "description": "High-quality 100% cotton t-shirt...",
    "price": 299.99,
    "discountPercentage": 15,
    "priceAfterDiscount": 255,
    "quantity": 0,
    "imageCover": "https://cloudinary.com/.../tshirt-cover.jpg",
    "category": "65f7c0000000000000000003",
    "seller": "65f7b0000000000000000002",
    "hasVariations": false,
    "colors": [],
    "sizes": [],
    "variations": [],
    "status": "published",
    "createdAt": "2026-02-19T10:00:00.000Z"
  }
}
```

---

### 2. Bulk Add Variations (Creates All Combinations)

**Endpoint:**
```http
POST /api/products/:productId/variations/bulk
Authorization: Bearer {seller_token}
```

**Request Body:**
```json
{
  "colors": ["Red", "Blue", "Black", "White"],
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "defaultQuantity": 20,
  "defaultLowStockThreshold": 5
}
```

**Example Request:**
```bash
POST /api/products/65f8a1234567890abcdef123/variations/bulk
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "colors": ["Red", "Blue", "Black", "White"],
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "defaultQuantity": 20,
  "defaultLowStockThreshold": 5
}
```

**Response:**
```json
{
  "status": "success",
  "message": "20 variations added successfully",
  "data": {
    "added": [
      "Red - S", "Red - M", "Red - L", "Red - XL", "Red - XXL",
      "Blue - S", "Blue - M", "Blue - L", "Blue - XL", "Blue - XXL",
      "Black - S", "Black - M", "Black - L", "Black - XL", "Black - XXL",
      "White - S", "White - M", "White - L", "White - XL", "White - XXL"
    ],
    "skipped": [],
    "product": {
      "_id": "65f8a1234567890abcdef123",
      "title": "Premium Cotton T-Shirt",
      "hasVariations": true,
      "colors": ["Red", "Blue", "Black", "White"],
      "sizes": ["S", "M", "L", "XL", "XXL"],
      "variations": [
        {
          "_id": "65f8b9876543210fedcba001",
          "color": "Red",
          "size": "M",
          "sku": "TSHIRT-001-RED-M",
          "price": 299.99,
          "discountPercentage": 15,
          "priceAfterDiscount": 255,
          "quantity": 20,
          "reservedStock": 0,
          "lowStockThreshold": 5,
          "isLowStock": false,
          "image": "https://cloudinary.com/.../tshirt-cover.jpg",
          "isActive": true
        }
        // ... 19 more variations
      ]
    }
  }
}
```

**What Happened:**
- ✅ Created 4 colors × 5 sizes = 20 variations
- ✅ Each variation has 20 items in stock
- ✅ Auto-generated SKUs (e.g., TSHIRT-001-RED-M)
- ✅ Each variation uses product's cover image by default
- ✅ Product's `hasVariations` flag set to `true`

---

### 3. Add Single Variation

**Endpoint:**
```http
POST /api/products/:productId/variations
Authorization: Bearer {seller_token}
```

**Request Body:**
```json
{
  "color": "Green",
  "size": "L",
  "sku": "TSHIRT-001-GREEN-L",
  "price": 329.99,
  "discountPercentage": 10,
  "quantity": 15,
  "lowStockThreshold": 3,
  "image": "https://cloudinary.com/.../tshirt-green.jpg"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Variation added successfully",
  "data": {
    "_id": "65f8a1234567890abcdef123",
    "title": "Premium Cotton T-Shirt",
    "hasVariations": true,
    "colors": ["Red", "Blue", "Black", "White", "Green"],
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "variations": [
      {
        "_id": "65f8b9876543210fedcba999",
        "color": "Green",
        "size": "L",
        "sku": "TSHIRT-001-GREEN-L",
        "price": 329.99,
        "discountPercentage": 10,
        "priceAfterDiscount": 297,
        "quantity": 15,
        "reservedStock": 0,
        "lowStockThreshold": 3,
        "isLowStock": false,
        "image": "https://cloudinary.com/.../tshirt-green.jpg",
        "isActive": true
      }
      // ... existing variations
    ]
  }
}
```

---

### 4. Get All Product Variations

**Endpoint:**
```http
GET /api/products/:productId/variations
Authorization: Bearer {seller_token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "hasVariations": true,
    "colors": ["Red", "Blue", "Black", "White"],
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "variations": [
      {
        "_id": "65f8b9876543210fedcba001",
        "color": "Red",
        "size": "M",
        "sku": "TSHIRT-001-RED-M",
        "price": 299.99,
        "discountPercentage": 15,
        "priceAfterDiscount": 255,
        "quantity": 50,
        "reservedStock": 5,
        "lowStockThreshold": 10,
        "isLowStock": false,
        "image": "https://cloudinary.com/.../tshirt-red.jpg",
        "isActive": true
      }
      // ... more variations
    ]
  }
}
```

---

### 5. Update Variation

**Endpoint:**
```http
PUT /api/products/:productId/variations/:variationId
Authorization: Bearer {seller_token}
```

**Request Body:**
```json
{
  "price": 349.99,
  "discountPercentage": 20,
  "quantity": 75,
  "lowStockThreshold": 8,
  "image": "https://cloudinary.com/.../tshirt-red-new.jpg",
  "isActive": true
}
```

**Example Request:**
```bash
PUT /api/products/65f8a1234567890abcdef123/variations/65f8b9876543210fedcba001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "price": 349.99,
  "discountPercentage": 20,
  "quantity": 75,
  "lowStockThreshold": 8
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Variation updated successfully",
  "data": {
    "_id": "65f8a1234567890abcdef123",
    "variations": [
      {
        "_id": "65f8b9876543210fedcba001",
        "color": "Red",
        "size": "M",
        "sku": "TSHIRT-001-RED-M",
        "price": 349.99,
        "discountPercentage": 20,
        "priceAfterDiscount": 280,
        "quantity": 75,
        "reservedStock": 5,
        "lowStockThreshold": 8,
        "isLowStock": false,
        "isActive": true
      }
    ]
  }
}
```

---

### 6. Adjust Variation Stock

**Endpoint:**
```http
PUT /api/products/:productId/variations/:variationId/adjust-stock
Authorization: Bearer {seller_token}
```

**Request Body:**
```json
{
  "quantity": 100,
  "type": "adjustment",
  "notes": "Restocked from warehouse - Batch #2024-002"
}
```

**Example Request:**
```bash
PUT /api/products/65f8a1234567890abcdef123/variations/65f8b9876543210fedcba001/adjust-stock
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "quantity": 100,
  "type": "purchase",
  "notes": "New stock arrival from supplier"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Variation stock adjusted successfully",
  "data": {
    "variation": {
      "id": "65f8b9876543210fedcba001",
      "color": "Red",
      "size": "M",
      "oldQuantity": 50,
      "newQuantity": 100,
      "availableStock": 95
    }
  }
}
```

**Stock Types:**
- `purchase` - Stock received from supplier
- `sale` - Stock sold to customer
- `return` - Customer returned items
- `adjustment` - Manual adjustment
- `reserved` - Reserved for order
- `released` - Released from reservation

---

### 7. Delete Variation

**Endpoint:**
```http
DELETE /api/products/:productId/variations/:variationId
Authorization: Bearer {seller_token}
```

**Example Request:**
```bash
DELETE /api/products/65f8a1234567890abcdef123/variations/65f8b9876543210fedcba001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "status": "success",
  "message": "Variation deleted successfully",
  "data": null
}
```

⚠️ **Warning:** Cannot delete if variation has:
- Reserved stock > 0
- Pending orders

---

### 8. Get Low Stock Variations (Dashboard Alert)

**Endpoint:**
```http
GET /api/products/variations/low-stock
Authorization: Bearer {seller_token}
```

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "data": [
    {
      "productId": "65f8a1234567890abcdef123",
      "productTitle": "Premium Cotton T-Shirt",
      "productSku": "TSHIRT-001",
      "variationId": "65f8b9876543210fedcba003",
      "color": "Blue",
      "size": "M",
      "sku": "TSHIRT-001-BLUE-M",
      "quantity": 3,
      "reservedStock": 0,
      "availableStock": 3,
      "lowStockThreshold": 10
    },
    {
      "productId": "65f8a1234567890abcdef123",
      "productTitle": "Premium Cotton T-Shirt",
      "productSku": "TSHIRT-001",
      "variationId": "65f8b9876543210fedcba007",
      "color": "Black",
      "size": "XL",
      "sku": "TSHIRT-001-BLACK-XL",
      "quantity": 2,
      "reservedStock": 1,
      "availableStock": 1,
      "lowStockThreshold": 5
    },
    {
      "productId": "65f8a9999999999999999999",
      "productTitle": "Vintage Jeans",
      "productSku": "JEANS-002",
      "variationId": "65f8b8888888888888888881",
      "color": "Dark Blue",
      "size": "32",
      "sku": "JEANS-002-DARK-BLUE-32",
      "quantity": 4,
      "reservedStock": 2,
      "availableStock": 2,
      "lowStockThreshold": 5
    }
  ]
}
```

---

### 9. Get Seller Orders

**Endpoint:**
```http
GET /api/orders/seller
Authorization: Bearer {seller_token}
```

**Response:**
```json
{
  "status": "success",
  "results": 15,
  "paginationResult": {
    "currentPage": 1,
    "limit": 10,
    "numberOfPages": 2
  },
  "data": [
    {
      "_id": "65f8d1111111111111111111",
      "customer": {
        "name": "Ahmed Mohamed",
        "email": "ahmed@example.com"
      },
      "items": [
        {
          "product": "65f8a1234567890abcdef123",
          "quantity": 2,
          "color": "Red",
          "size": "M",
          "price": 255,
          "variationId": "65f8b9876543210fedcba001"
        }
      ],
      "totalOrderPrice": 631,
      "paymentMethod": "cash on delivery",
      "isPaid": false,
      "status": "pending",
      "createdAt": "2026-02-19T11:00:00.000Z"
    }
  ]
}
```

---

### 10. Get Seller Order Details

**Endpoint:**
```http
GET /api/orders/seller/:orderId
Authorization: Bearer {seller_token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "65f8d1111111111111111111",
    "customer": {
      "_id": "65f7a0000000000000000001",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "phone": "+20123456789"
    },
    "items": [
      {
        "_id": "65f8d2222222222222222222",
        "product": {
          "_id": "65f8a1234567890abcdef123",
          "title": "Premium Cotton T-Shirt",
          "imageCover": "https://cloudinary.com/.../tshirt-cover.jpg"
        },
        "quantity": 2,
        "color": "Red",
        "size": "M",
        "price": 255,
        "variationId": "65f8b9876543210fedcba001",
        "seller": "65f7b0000000000000000002"
      }
    ],
    "cartPrice": 510,
    "taxes": 71,
    "shipping": 50,
    "totalOrderPrice": 631,
    "sellerCartPrice": 510,
    "sellerTaxes": 71,
    "sellerTotal": 581,
    "paymentMethod": "cash on delivery",
    "isPaid": false,
    "status": "pending",
    "deliveryStatus": "unassigned",
    "createdAt": "2026-02-19T11:00:00.000Z"
  }
}
```

---

### 11. Update Seller Order Status

**Endpoint:**
```http
PUT /api/orders/seller/:orderId
Authorization: Bearer {seller_token}
```

**Request Body:**
```json
{
  "status": "completed",
  "isPaid": true
}
```

**Example Request:**
```bash
PUT /api/orders/seller/65f8d1111111111111111111
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "status": "completed"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Order updated successfully",
  "data": {
    "_id": "65f8d1111111111111111111",
    "status": "completed",
    "deliveredAt": "2026-02-19T15:30:00.000Z"
  }
}
```

**What Happens When Status = "completed" or "delivered":**
1. ✅ Reserved stock is **consumed**
2. ✅ Variation quantity is decreased
3. ✅ Product sold count is increased
4. ✅ Stock history is recorded

**Order Status Options:**
- `pending` - Order placed, awaiting processing
- `Approved` - Order confirmed by seller
- `shipping` - Order is being delivered
- `completed` - Order completed successfully
- `delivered` - Order delivered to customer
- `cancelled` - Order cancelled
- `returned` - Order returned by customer
- `damaged` - Order damaged during delivery

---

### 12. Get Seller Products

**Endpoint:**
```http
GET /api/products/seller
Authorization: Bearer {seller_token}
```

**Query Parameters:**
- `category` - Filter by category ID
- `status` - Filter by status (draft/published)
- `page` - Page number
- `limit` - Items per page

**Example Request:**
```bash
GET /api/products/seller?category=65f7c0000000000000000003&status=published&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "results": 2,
  "paginationResult": {
    "currentPage": 1,
    "limit": 20,
    "numberOfPages": 1
  },
  "data": [
    {
      "_id": "65f8a1234567890abcdef123",
      "title": "Premium Cotton T-Shirt",
      "sku": "TSHIRT-001",
      "price": 299.99,
      "priceAfterDiscount": 255,
      "imageCover": "https://cloudinary.com/.../tshirt-cover.jpg",
      "hasVariations": true,
      "variations": [
        {
          "_id": "65f8b9876543210fedcba001",
          "color": "Red",
          "size": "M",
          "quantity": 50,
          "reservedStock": 5,
          "isLowStock": false
        }
        // ... more variations
      ],
      "status": "published",
      "sold": 245,
      "createdAt": "2026-02-19T10:00:00.000Z"
    }
  ]
}
```

---

### 13. Get Inventory Dashboard

**Endpoint:**
```http
GET /api/inventory/dashboard/overview
Authorization: Bearer {seller_token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalProducts": 15,
    "totalStock": 2450,
    "totalReservedStock": 125,
    "totalAvailableStock": 2325,
    "lowStockProducts": 3,
    "outOfStockProducts": 1,
    "totalValue": 612500,
    "topProducts": [
      {
        "productId": "65f8a1234567890abcdef123",
        "title": "Premium Cotton T-Shirt",
        "totalStock": 400,
        "availableStock": 380,
        "reservedStock": 20,
        "totalVariations": 20
      }
    ]
  }
}
```

---

## 🎯 Seller Workflow Examples

### Scenario 1: Add New Product with Variations

#### Step 1: Create Base Product
```bash
POST /api/products/seller
Authorization: Bearer {token}

{
  "title": "Classic Polo Shirt",
  "slug": "classic-polo-shirt",
  "sku": "POLO-001",
  "description": "Comfortable cotton polo shirt perfect for casual wear",
  "price": 399.99,
  "discountPercentage": 10,
  "quantity": 0,
  "imageCover": "https://cloudinary.com/.../polo-cover.jpg",
  "category": "65f7c0000000000000000003",
  "status": "published"
}
```

#### Step 2: Add Variations (Bulk)
```bash
POST /api/products/65f8a1234567890abcdef456/variations/bulk
Authorization: Bearer {token}

{
  "colors": ["Navy", "White", "Gray", "Black"],
  "sizes": ["S", "M", "L", "XL"],
  "defaultQuantity": 25
}
```
*Creates 16 variations (4 colors × 4 sizes)*

#### Step 3: Upload Variant-Specific Images
```bash
PUT /api/products/65f8a1234567890abcdef456/variations/65f8b1111111111111111111
Authorization: Bearer {token}

{
  "image": "https://cloudinary.com/.../polo-navy.jpg"
}
```

#### Step 4: Adjust Stock for Best-Sellers
```bash
PUT /api/products/65f8a1234567890abcdef456/variations/65f8b1111111111111111111/adjust-stock
Authorization: Bearer {token}

{
  "quantity": 50,
  "type": "purchase",
  "notes": "Doubled stock for Navy-M (best seller)"
}
```

---

### Scenario 2: Manage Low Stock Alert

#### Step 1: Check Low Stock Items
```bash
GET /api/products/variations/low-stock
Authorization: Bearer {token}
```

**Response shows:**
- Blue-M: 3 available (threshold: 10)
- Black-XL: 1 available (threshold: 5)

#### Step 2: Restock Items
```bash
PUT /api/products/65f8a1234567890abcdef123/variations/65f8b9876543210fedcba003/adjust-stock
Authorization: Bearer {token}

{
  "quantity": 30,
  "type": "purchase",
  "notes": "Restocked Blue-M from Supplier A"
}
```

---

### Scenario 3: Handle Order Fulfillment

#### Step 1: Get New Orders
```bash
GET /api/orders/seller?status=pending
Authorization: Bearer {token}
```

#### Step 2: View Order Details
```bash
GET /api/orders/seller/65f8d1111111111111111111
Authorization: Bearer {token}
```

**See:** Customer ordered 2x Red-M (variationId: 65f8b9876543210fedcba001)

#### Step 3: Complete Order
```bash
PUT /api/orders/seller/65f8d1111111111111111111
Authorization: Bearer {token}

{
  "status": "completed",
  "isPaid": true
}
```

**Result:**
- Red-M quantity: 50 → 48
- Red-M reservedStock: 5 → 3
- Product sold: 245 → 247

---

### Scenario 4: Seasonal Product Management

#### Step 1: Add New Color for Summer
```bash
POST /api/products/65f8a1234567890abcdef123/variations
Authorization: Bearer {token}

{
  "color": "Lime Green",
  "size": "M",
  "quantity": 50,
  "image": "https://cloudinary.com/.../tshirt-lime.jpg"
}
```

#### Step 2: Disable Winter Colors
```bash
PUT /api/products/65f8a1234567890abcdef123/variations/65f8b9876543210fedcba020
Authorization: Bearer {token}

{
  "isActive": false
}
```
*Dark Blue variation is hidden from customers*

#### Step 3: Re-enable for Winter
```bash
PUT /api/products/65f8a1234567890abcdef123/variations/65f8b9876543210fedcba020
Authorization: Bearer {token}

{
  "isActive": true
}
```

---

## 📊 Seller Dashboard Displays

### Products Management Table
```
Product Title       | SKU         | Variations | Total Stock | Available | Low Stock | Actions
--------------------|-------------|------------|-------------|-----------|-----------|----------
Premium T-Shirt     | TSHIRT-001  | 20         | 450         | 430       | ⚠️ 3      | [Edit] [View]
Classic Polo        | POLO-001    | 16         | 380         | 360       | -         | [Edit] [View]
Vintage Jeans       | JEANS-002   | 12         | 240         | 235       | ⚠️ 2      | [Edit] [View]
```

### Variations Management Table (Per Product)
```
Color   | Size | SKU              | Price | Stock | Reserved | Available | Status  | Actions
--------|------|------------------|-------|-------|----------|-----------|---------|-------------
Red     | S    | TSHIRT-001-RED-S | 255   | 25    | 2        | 23        | Active  | [Edit] [Stock]
Red     | M    | TSHIRT-001-RED-M | 255   | 50    | 5        | 45        | Active  | [Edit] [Stock]
Blue    | M    | TSHIRT-001-BLU-M | 255   | 3     | 0        | 3         | ⚠️ Low  | [Edit] [Stock]
Black   | XL   | TSHIRT-001-BLK-XL| 255   | 0     | 0        | 0         | ❌ Out  | [Edit] [Stock]
```

### Low Stock Alerts Dashboard
```
🔴 Low Stock Alerts (5)

Product              | Variation    | Available | Threshold | Action
---------------------|--------------|-----------|-----------|------------------
Premium T-Shirt      | Blue - M     | 3         | 10        | [Restock Now]
Premium T-Shirt      | Black - XL   | 0         | 5         | [Restock Now]
Vintage Jeans        | Dark Blue-32 | 2         | 5         | [Restock Now]
```

### Order Details View
```
Order #65f8d1111111111111111111
Status: Pending | Payment: COD | Date: Feb 19, 2026

Customer: Ahmed Mohamed
Email: ahmed@example.com
Phone: +20123456789

Items:
1. Premium Cotton T-Shirt
   Color: Red, Size: M
   Qty: 2 × 255 EGP = 510 EGP
   SKU: TSHIRT-001-RED-M
   [View Product]

Subtotal: 510 EGP
Taxes: 71 EGP
Shipping: 50 EGP
Total: 631 EGP

Reserved Stock:
- TSHIRT-001-RED-M: 2 units reserved

[Approve Order] [Cancel Order]
```

---

## 💡 Best Practices for Sellers

### 1. Product Setup
✅ **DO:**
- Create base product first with SKU
- Use bulk add for common color-size combinations
- Set realistic low stock thresholds (5-10 items)
- Upload high-quality images for each color
- Write clear, descriptive product titles

❌ **DON'T:**
- Set quantity on main product when using variations
- Create duplicate variations
- Use special characters in color/size names
- Leave variations inactive unintentionally

### 2. Inventory Management
✅ **DO:**
- Check low stock alerts daily
- Record stock type and notes for every adjustment
- Keep popular variations well-stocked
- Monitor reserved stock for pending orders
- Plan for seasonal demand changes

❌ **DON'T:**
- Manually adjust quantity without using adjust-stock endpoint
- Ignore low stock warnings
- Delete variations with pending orders
- Forget to update stock after receiving shipments

### 3. Order Processing
✅ **DO:**
- Process pending orders within 24 hours
- Verify variation details before fulfillment
- Update order status promptly
- Communicate with customers about delays
- Mark orders as completed when shipped

❌ **DON'T:**
- Cancel orders without releasing reserved stock
- Change order status without updating stock
- Ignore order notifications
- Process orders with insufficient stock

### 4. Pricing Strategy
✅ **DO:**
- Use consistent pricing across sizes when appropriate
- Apply discounts strategically
- Update prices during sales
- Consider competitor pricing
- Test different price points

❌ **DON'T:**
- Price variations wildly different
- Forget to update discount percentages
- Change prices too frequently
- Use misleading discount percentages

---

## 📈 Inventory Tracking

### Stock States

**Total Stock**
```
Total Physical Items = quantity field
```

**Reserved Stock**
```
Items Reserved for Pending Orders = reservedStock field
```

**Available Stock**
```
Items Available for New Orders = quantity - reservedStock
```

**Example:**
```json
{
  "color": "Red",
  "size": "M",
  "quantity": 100,        // 100 physical items in warehouse
  "reservedStock": 15,    // 15 items reserved for 5 pending orders
  "availableStock": 85    // 85 items available for new customers
}
```

### Stock History

Every stock change is recorded:
```json
{
  "stockHistory": [
    {
      "type": "purchase",
      "quantity": 100,
      "changedBy": "65f7b0000000000000000002",
      "changedAt": "2026-02-15T10:00:00.000Z",
      "notes": "Initial stock from Supplier A"
    },
    {
      "type": "reserved",
      "quantity": 5,
      "orderId": "65f8d1111111111111111111",
      "changedAt": "2026-02-19T11:00:00.000Z",
      "notes": "Stock reserved for cash order"
    },
    {
      "type": "sale",
      "quantity": 5,
      "orderId": "65f8d1111111111111111111",
      "changedAt": "2026-02-20T15:30:00.000Z",
      "notes": "Stock consumed by seller - order completed"
    }
  ]
}
```

---

## ⚠️ Important Notes

1. **Variation SKUs Must Be Unique**: System auto-generates as `{PRODUCT_SKU}-{COLOR}-{SIZE}`

2. **Stock Reservations**: Stock is reserved on order creation, consumed on delivery/completion

3. **Cannot Delete with Pending Orders**: Variations with reserved stock can't be deleted

4. **Price Inheritance**: If variation price is not set, it uses the main product price

5. **Image Fallback**: If variation image is not set, it uses the product cover image

6. **Bulk Operations**: Bulk add creates all combinations - be careful with large numbers

7. **Stock History**: All stock changes are logged for audit purposes

8. **Order Cancellation**: Always releases reserved stock back to variations

---

## 🔧 Common Operations

### Restock a Variation
```bash
PUT /api/products/{productId}/variations/{variationId}/adjust-stock

{
  "quantity": 100,
  "type": "purchase",
  "notes": "Restock from Supplier XYZ - Invoice #INV-2024-001"
}
```

### Mark Variation Inactive (Seasonal)
```bash
PUT /api/products/{productId}/variations/{variationId}

{
  "isActive": false
}
```

### Update Variation Price
```bash
PUT /api/products/{productId}/variations/{variationId}

{
  "price": 399.99,
  "discountPercentage": 25
}
```

### Add New Color Option
```bash
POST /api/products/{productId}/variations

{
  "color": "Mint Green",
  "size": "M",
  "quantity": 30
}
```

---

## 📞 Support & Troubleshooting

### Variation Not Showing to Customers?
- Check `isActive` is `true`
- Verify `quantity > 0`
- Ensure product `status` is `"published"`

### Reserved Stock Not Releasing?
- Order must be marked as `"cancelled"` by admin or seller
- Check order status in database

### Bulk Add Failed?
- Check color/size arrays are not empty
- Verify product exists and belongs to you
- Ensure no duplicate variations exist

### Stock Count Mismatch?
- Review `stockHistory` for audit trail
- Check for pending orders (`reservedStock`)
- Verify all orders were properly completed

---

Happy Selling! 🏪
