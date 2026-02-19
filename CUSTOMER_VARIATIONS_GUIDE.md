# Product Variations - Customer Guide

## Overview
As a customer, you can now shop for products with different variations (colors, sizes) and check their availability before purchasing.

---

## 🛍️ Customer Endpoints

### 1. Browse Product with Variations

**Endpoint:**
```http
GET /api/products/:productId
```

**Example Request:**
```bash
GET /api/products/65f8a1234567890abcdef123
```

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "_id": "65f8a1234567890abcdef123",
    "title": "Premium Cotton T-Shirt",
    "description": "High-quality 100% cotton t-shirt with modern fit",
    "price": 299.99,
    "discountPercentage": 15,
    "priceAfterDiscount": 255,
    "imageCover": "https://cloudinary.com/.../tshirt-cover.jpg",
    "images": [
      "https://cloudinary.com/.../tshirt-1.jpg",
      "https://cloudinary.com/.../tshirt-2.jpg"
    ],
    "category": {
      "name": "Men's Clothing"
    },
    "hasVariations": true,
    "colors": ["Red", "Blue", "Black", "White"],
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "ratingsAverage": 4.5,
    "ratingsQuantity": 128,
    "status": "published"
  }
}
```

---

### 2. Get All Available Variations

**Endpoint:**
```http
GET /api/products/:productId/variations
```

**Example Request:**
```bash
GET /api/products/65f8a1234567890abcdef123/variations
```

**Response Example:**
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
      },
      {
        "_id": "65f8b9876543210fedcba002",
        "color": "Red",
        "size": "L",
        "sku": "TSHIRT-001-RED-L",
        "price": 299.99,
        "discountPercentage": 15,
        "priceAfterDiscount": 255,
        "quantity": 75,
        "reservedStock": 3,
        "lowStockThreshold": 10,
        "isLowStock": false,
        "image": "https://cloudinary.com/.../tshirt-red.jpg",
        "isActive": true
      },
      {
        "_id": "65f8b9876543210fedcba003",
        "color": "Blue",
        "size": "M",
        "sku": "TSHIRT-001-BLUE-M",
        "price": 299.99,
        "discountPercentage": 15,
        "priceAfterDiscount": 255,
        "quantity": 3,
        "reservedStock": 0,
        "lowStockThreshold": 10,
        "isLowStock": true,
        "image": "https://cloudinary.com/.../tshirt-blue.jpg",
        "isActive": true
      },
      {
        "_id": "65f8b9876543210fedcba004",
        "color": "Black",
        "size": "XL",
        "sku": "TSHIRT-001-BLACK-XL",
        "price": 299.99,
        "discountPercentage": 15,
        "priceAfterDiscount": 255,
        "quantity": 0,
        "reservedStock": 0,
        "lowStockThreshold": 10,
        "isLowStock": true,
        "image": "https://cloudinary.com/.../tshirt-black.jpg",
        "isActive": true
      }
    ]
  }
}
```

**Available Stock Calculation:**
- Red M: 50 - 5 = 45 available
- Red L: 75 - 3 = 72 available
- Blue M: 3 - 0 = 3 available (Low stock!)
- Black XL: 0 - 0 = 0 available (Out of stock!)

---

### 3. Check Stock for Specific Variation

**Endpoint:**
```http
GET /api/products/:productId/variations/check-stock?color={color}&size={size}&quantity={quantity}
```

**Example Request:**
```bash
GET /api/products/65f8a1234567890abcdef123/variations/check-stock?color=Red&size=M&quantity=2
```

**Response Example (In Stock):**
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
    "price": 255
  }
}
```

**Response Example (Out of Stock):**
```bash
GET /api/products/65f8a1234567890abcdef123/variations/check-stock?color=Black&size=XL&quantity=1
```

```json
{
  "status": "success",
  "data": {
    "color": "Black",
    "size": "XL",
    "availableStock": 0,
    "requestedQuantity": 1,
    "inStock": false,
    "isActive": true,
    "price": 255
  }
}
```

---

### 4. Add Product Variation to Cart

**Endpoint:**
```http
POST /api/cart
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "productId": "65f8a1234567890abcdef123",
  "color": "Red",
  "size": "M",
  "variationId": "65f8b9876543210fedcba001"
}
```

**Success Response:**
```json
{
  "status": "success",
  "results": 1,
  "message": "Product added to cart",
  "data": {
    "_id": "65f8c1111111111111111111",
    "user": "65f7a0000000000000000001",
    "cartItems": [
      {
        "_id": "65f8c2222222222222222222",
        "product": "65f8a1234567890abcdef123",
        "quantity": 1,
        "color": "Red",
        "size": "M",
        "price": 255,
        "variationId": "65f8b9876543210fedcba001"
      }
    ],
    "totalPrice": 255,
    "createdAt": "2026-02-19T10:30:00.000Z",
    "updatedAt": "2026-02-19T10:30:00.000Z"
  }
}
```

**Error Response (Out of Stock):**
```json
{
  "status": "fail",
  "message": "Variation Red - M is out of stock"
}
```

**Error Response (Insufficient Stock):**
```json
{
  "status": "fail",
  "message": "Only 3 items available in stock"
}
```

---

### 5. Get Cart Items

**Endpoint:**
```http
GET /api/cart
Authorization: Bearer {token}
```

**Response Example:**
```json
{
  "status": "success",
  "results": 3,
  "data": {
    "_id": "65f8c1111111111111111111",
    "user": "65f7a0000000000000000001",
    "cartItems": [
      {
        "_id": "65f8c2222222222222222222",
        "product": "65f8a1234567890abcdef123",
        "quantity": 2,
        "color": "Red",
        "size": "M",
        "price": 255,
        "variationId": "65f8b9876543210fedcba001"
      },
      {
        "_id": "65f8c3333333333333333333",
        "product": "65f8a1234567890abcdef123",
        "quantity": 1,
        "color": "Blue",
        "size": "L",
        "price": 255,
        "variationId": "65f8b9876543210fedcba005"
      },
      {
        "_id": "65f8c4444444444444444444",
        "product": "65f8a9999999999999999999",
        "quantity": 1,
        "color": "White",
        "size": "S",
        "price": 399,
        "variationId": "65f8b8888888888888888888"
      }
    ],
    "totalPrice": 910,
    "createdAt": "2026-02-19T10:30:00.000Z",
    "updatedAt": "2026-02-19T10:45:00.000Z"
  }
}
```

---

### 6. Update Cart Item Quantity

**Endpoint:**
```http
PUT /api/cart/:cartItemId
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Example Request:**
```bash
PUT /api/cart/65f8c2222222222222222222
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "quantity": 3
}
```

**Response:**
```json
{
  "status": "success",
  "results": 3,
  "message": "Product quantity updated",
  "data": {
    "_id": "65f8c1111111111111111111",
    "user": "65f7a0000000000000000001",
    "cartItems": [
      {
        "_id": "65f8c2222222222222222222",
        "product": "65f8a1234567890abcdef123",
        "quantity": 3,
        "color": "Red",
        "size": "M",
        "price": 255,
        "variationId": "65f8b9876543210fedcba001"
      }
    ],
    "totalPrice": 765
  }
}
```

---

### 7. Remove Item from Cart

**Endpoint:**
```http
DELETE /api/cart/:cartItemId
Authorization: Bearer {token}
```

**Example Request:**
```bash
DELETE /api/cart/65f8c2222222222222222222
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "status": "success",
  "message": "Product removed from cart",
  "data": {
    "_id": "65f8c1111111111111111111",
    "cartItems": [],
    "totalPrice": 0
  }
}
```

---

### 8. Create Cash Order (COD)

**Endpoint:**
```http
POST /api/orders/:cartId
Authorization: Bearer {token}
```

**Example Request:**
```bash
POST /api/orders/65f8c1111111111111111111
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Order complete",
  "data": {
    "_id": "65f8d1111111111111111111",
    "customer": "65f7a0000000000000000001",
    "items": [
      {
        "product": "65f8a1234567890abcdef123",
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
    "paymentMethod": "cash on delivery",
    "isPaid": false,
    "status": "pending",
    "deliveryStatus": "unassigned",
    "createdAt": "2026-02-19T11:00:00.000Z"
  }
}
```

**What Happens:**
1. ✅ Order is created with status "pending"
2. ✅ Stock is **reserved** (not consumed yet)
   - Red-M variation: `reservedStock` increases by 2
   - Available stock decreases by 2
3. ✅ Cart is deleted
4. ✅ Stock will be consumed when order status changes to "delivered"

---

### 9. Create Online Payment Order (Checkout)

**Endpoint:**
```http
GET /api/orders/checkout-session/:cartId
Authorization: Bearer {token}
```

**Example Request:**
```bash
GET /api/orders/checkout-session/65f8c1111111111111111111
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "status": "success",
  "session": {
    "iframe_id": "123456",
    "token": "paymob_payment_token_here",
    "payment_url": "https://portal.paymob.com/iframe/123456?payment_token=..."
  }
}
```

**What Happens After Payment:**
1. ✅ Order is created with status "Approved"
2. ✅ `isPaid` is set to `true`
3. ✅ Stock is **immediately consumed** (not reserved)
   - Red-M variation: `quantity` decreases by 2
   - Sold count increases by 2
4. ✅ Cart is deleted

---

### 10. Get My Orders

**Endpoint:**
```http
GET /api/orders
Authorization: Bearer {token}
```

**Response Example:**
```json
{
  "status": "success",
  "results": 2,
  "paginationResult": {
    "currentPage": 1,
    "limit": 10,
    "numberOfPages": 1
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
          "product": {
            "title": "Premium Cotton T-Shirt",
            "imageCover": "https://cloudinary.com/.../tshirt.jpg"
          },
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
      "deliveryStatus": "unassigned",
      "createdAt": "2026-02-19T11:00:00.000Z"
    },
    {
      "_id": "65f8d2222222222222222222",
      "customer": {
        "name": "Ahmed Mohamed",
        "email": "ahmed@example.com"
      },
      "items": [
        {
          "product": {
            "title": "Premium Cotton T-Shirt",
            "imageCover": "https://cloudinary.com/.../tshirt.jpg"
          },
          "quantity": 1,
          "color": "Blue",
          "size": "L",
          "price": 255,
          "variationId": "65f8b9876543210fedcba005"
        }
      ],
      "totalOrderPrice": 381,
      "paymentMethod": "Paymob",
      "isPaid": true,
      "paidAt": "2026-02-18T14:30:00.000Z",
      "status": "Approved",
      "deliveryStatus": "unassigned",
      "createdAt": "2026-02-18T14:30:00.000Z"
    }
  ]
}
```

---

## 🎯 Customer Shopping Flow Example

### Scenario: Buy a Red T-Shirt in Size M

#### Step 1: Browse Products
```bash
GET /api/products?category=men-clothing
```

#### Step 2: View Product Details
```bash
GET /api/products/65f8a1234567890abcdef123
```
*See: Product has variations with colors and sizes*

#### Step 3: Get All Variations
```bash
GET /api/products/65f8a1234567890abcdef123/variations
```
*See: Red-M has 45 available, Blue-M has 3 available, Black-XL is out of stock*

#### Step 4: Check Specific Variation Stock
```bash
GET /api/products/65f8a1234567890abcdef123/variations/check-stock?color=Red&size=M&quantity=2
```
*Response: `inStock: true, availableStock: 45`*

#### Step 5: Add to Cart
```bash
POST /api/cart
Authorization: Bearer {token}

{
  "productId": "65f8a1234567890abcdef123",
  "color": "Red",
  "size": "M",
  "variationId": "65f8b9876543210fedcba001"
}
```
*Response: Item added to cart*

#### Step 6: View Cart
```bash
GET /api/cart
Authorization: Bearer {token}
```
*Response: Cart has 1 item (Red-M)*

#### Step 7: Checkout (Cash on Delivery)
```bash
POST /api/orders/65f8c1111111111111111111
Authorization: Bearer {token}
```
*Response: Order created with status "pending", stock reserved*

#### Step 8: Track Order
```bash
GET /api/orders
Authorization: Bearer {token}
```
*Response: Order status "pending" → "shipping" → "delivered"*

---

## 📱 Display Examples for Frontend

### Product Card
```
Premium Cotton T-Shirt
⭐ 4.5 (128 reviews)
💰 255 EGP (was 299.99 EGP) -15%

Colors: 🔴 🔵 ⚫ ⚪
Sizes: S M L XL XXL

[Add to Cart]
```

### Variation Selector
```
Select Color:
[Red] [Blue] [Black] [White]
    ✓

Select Size:
[S] [M] [L] [XL] [XXL]
     ✓

✅ In Stock (45 available)
Price: 255 EGP

[Add to Cart]
```

### Out of Stock Warning
```
Select Color: Black
Select Size: XL

❌ Out of Stock

[Notify When Available]
```

### Low Stock Alert
```
Select Color: Blue
Select Size: M

⚠️ Only 3 left in stock!
Price: 255 EGP

[Add to Cart]
```

### Cart Item Display
```
🛒 Your Cart (3 items)

1. Premium Cotton T-Shirt
   Color: Red, Size: M
   Qty: 2 × 255 EGP = 510 EGP
   [Update] [Remove]

2. Premium Cotton T-Shirt
   Color: Blue, Size: L
   Qty: 1 × 255 EGP = 255 EGP
   [Update] [Remove]

Subtotal: 765 EGP
Taxes: 107 EGP
Shipping: 50 EGP
Total: 922 EGP

[Proceed to Checkout]
```

### Order Confirmation
```
✅ Order Placed Successfully!

Order #65f8d1111111111111111111
Status: Pending
Payment: Cash on Delivery

Items:
- Premium Cotton T-Shirt (Red, M) × 2

Total: 631 EGP

Expected Delivery: 3-5 business days

[Track Order]
```

---

## ⚠️ Important Notes for Customers

1. **Stock Availability**: Stock is checked in real-time. If someone else purchases the last item, you'll be notified.

2. **Reserved Stock**: When you place a cash order, stock is reserved for you until delivery.

3. **Price Consistency**: The price you see when adding to cart is the price you pay, even if it changes later.

4. **Variation Selection**: Both color AND size must be selected before adding to cart.

5. **Multiple Variations**: You can have multiple variations of the same product in your cart (e.g., Red-M and Blue-L).

6. **Order Tracking**: Your order shows which specific variation you ordered.

7. **Cancellation**: If you cancel an order, the reserved stock becomes available again.

---

## 🎨 Color & Size Standards

### Common Colors
- Red, Blue, Green, Yellow, Orange, Purple, Pink
- Black, White, Gray, Brown, Beige, Navy
- Custom colors: "Light Blue", "Dark Green", "Royal Blue"

### Common Sizes (Clothing)
- **Standard**: XS, S, M, L, XL, XXL, XXXL
- **Numeric**: 28, 30, 32, 34, 36, 38, 40, 42
- **Children**: 2Y, 4Y, 6Y, 8Y, 10Y, 12Y, 14Y

### Common Sizes (Shoes)
- **EU**: 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45
- **US**: 6, 7, 8, 9, 10, 11, 12

---

## 🔧 Error Handling

### Common Errors

**Variation Not Found**
```json
{
  "status": "fail",
  "message": "Variation Red - M not found"
}
```

**Variation Inactive**
```json
{
  "status": "fail",
  "message": "Variation Red - M is not available"
}
```

**Out of Stock**
```json
{
  "status": "fail",
  "message": "Variation Red - M is out of stock"
}
```

**Insufficient Stock**
```json
{
  "status": "fail",
  "message": "Only 3 items available in stock"
}
```

**Product Not Found**
```json
{
  "status": "fail",
  "message": "Product not found"
}
```

---

## 💡 Best Practices

1. **Always check stock** before showing "Add to Cart" button
2. **Disable out-of-stock variations** in the UI
3. **Show low stock warnings** when available stock ≤ 5
4. **Update cart dynamically** when quantities change
5. **Handle errors gracefully** with user-friendly messages
6. **Show variation details** in cart and order confirmation
7. **Display correct images** for selected variation

---

Happy Shopping! 🛍️
