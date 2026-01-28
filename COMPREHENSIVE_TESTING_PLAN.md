# E-Commerce Application - Comprehensive Testing Plan

## Overview
This document provides a comprehensive manual testing plan for the E-Commerce application, simulating real user flows for **Customer**, **Seller**, and **Admin** roles. The primary focus is to identify and resolve the cart error with productId `694beb0c61e114531f55d552` and ensure all features work correctly.

---

## Prerequisites

### Environment Setup
- **Base URL**: Set in Postman environment as `{{mainHost}}`
- **JWT Token**: Automatically stored in environment variable `{{JWT}}` after login/signup
- **Test Data Requirements**:
  - Valid product IDs (from existing products)
  - Valid category IDs
  - Valid coupon codes
  - Multiple user accounts with different roles

### Required Environment Variables
```
mainHost: <your-api-base-url>
JWT: <auto-populated-on-login>
```

---

## Test Execution Order

### Phase 1: Initial Setup & Data Verification
Before testing user flows, verify that the system has required test data.

---

## 🛍️ CUSTOMER FLOW TESTING

### Test Suite 1: Customer Registration & Authentication

#### Test 1.1: Customer Sign Up
**Endpoint**: `POST /api/v1/auth/signUp`

**Test Steps**:
1. Create a new customer account
2. Use unique email (e.g., `customer1@test.com`)

**Request Body**:
```json
{
    "name": "Test Customer",
    "email": "customer1@test.com",
    "phone": "01234567890",
    "password": "Test123456",
    "passwordConfirmation": "Test123456"
}
```

**Expected Results**:
- ✅ Status: 201 Created
- ✅ Response contains JWT token
- ✅ JWT token automatically saved to environment
- ✅ User role should be 'customer' by default

**Verification**:
- Token is saved in `{{JWT}}` environment variable
- Copy the user ID from response for later use

---

#### Test 1.2: Customer Login
**Endpoint**: `POST /api/v1/auth/logIn`

**Request Body**:
```json
{
    "email": "customer1@test.com",
    "password": "Test123456"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ JWT token received and saved
- ✅ Can access protected customer routes

---

#### Test 1.3: Two-Factor Authentication (if enabled)
**Endpoint**: `POST /api/v1/auth/verify-2FA`

**Request Body**:
```json
{
    "email": "customer1@test.com",
    "OTP": "<received-otp-code>"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ JWT token received after successful verification

---

### Test Suite 2: Customer Profile Management

#### Test 2.1: Get Customer Profile
**Endpoint**: `GET /api/v1/users/getMyData`

**Headers**: 
- Authorization: Bearer `{{JWT}}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns current customer data
- ✅ Email, name, phone match signup data

---

#### Test 2.2: Update Customer Profile
**Endpoint**: `PUT /api/v1/users/updateMyData`

**Request Body**:
```json
{
    "name": "Updated Customer Name"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Name updated successfully
- ✅ Other fields unchanged

---

#### Test 2.3: Change Customer Password
**Endpoint**: `PUT /api/v1/users/updateMyPassword`

**Request Body**:
```json
{
    "currentPassword": "Test123456",
    "newPassword": "NewTest123456",
    "newPasswordConfirm": "NewTest123456"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ New JWT token received
- ✅ Old token invalidated
- ✅ Can login with new password

---

### Test Suite 3: Product Discovery

#### Test 3.1: Browse All Products
**Endpoint**: `GET /api/v1/products`

**Query Parameters** (test individually):
- No filters (get all products)
- `?page=1&limit=10` (pagination)
- `?keyword=shirt` (search)
- `?sort=-price` (sort by price descending)
- `?price[gte]=100&price[lte]=500` (price range)

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns array of products
- ✅ Pagination works correctly
- ✅ Filters apply correctly
- ✅ Each product has valid `_id` field

**Critical Check**:
- ❗ **Verify all product IDs are valid MongoDB ObjectIds (24 hex characters)**
- ❗ Note down several valid product IDs for cart testing

---

#### Test 3.2: Get Specific Product Details
**Endpoint**: `GET /api/v1/products/{productId}`

**Example**: `GET /api/v1/products/679868cc96698d640e58133c`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns complete product details
- ✅ Product has price, quantity, title, description
- ✅ Product ID matches request

**Critical Check**:
- ❗ **Verify product exists and has stock (quantity > 0)**
- ❗ This product ID will be used for cart testing

---

#### Test 3.3: Get Product Reviews
**Endpoint**: `GET /api/v1/products/{productId}/reviews`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns reviews for specific product
- ✅ May be empty array if no reviews

---

### Test Suite 4: Categories & Browsing

#### Test 4.1: Get All Categories
**Endpoint**: `GET /api/v1/categories`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns list of categories
- ✅ Each category has valid ID and name

---

#### Test 4.2: Get Specific Category
**Endpoint**: `GET /api/v1/categories/{categoryId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns category details

---

### Test Suite 5: Wishlist Management

#### Test 5.1: Add Product to Wishlist
**Endpoint**: `POST /api/v1/wishlists`

**Request Body**:
```json
{
    "productId": "<valid-product-id-from-test-3.1>"
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Product added to wishlist
- ✅ No duplicates allowed

---

#### Test 5.2: Get All Wishlist Items
**Endpoint**: `GET /api/v1/wishlists`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns wishlist items
- ✅ Contains product added in Test 5.1

---

#### Test 5.3: Remove Product from Wishlist
**Endpoint**: `DELETE /api/v1/wishlists/{productId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Product removed from wishlist

---

### Test Suite 6: Shopping Cart - CRITICAL TESTING AREA 🔴

> **Note**: This is where the error with productId `694beb0c61e114531f55d552` was found. Pay special attention to all cart operations.

#### Test 6.1: Get Empty Cart
**Endpoint**: `GET /api/v1/carts`

**Headers**: 
- Authorization: Bearer `{{JWT}}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns empty cart or existing cart
- ✅ Cart structure is valid

---

#### Test 6.2: Add Product to Cart - CRITICAL TEST
**Endpoint**: `POST /api/v1/carts`

**Test Case A: Valid Product ID**
```json
{
    "productId": "<valid-product-id-from-test-3.1>"
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Product added to cart
- ✅ Default quantity set to 1
- ✅ Total price calculated correctly

**Test Case B: Invalid/Malformed Product ID** 
```json
{
    "productId": "694beb0c61e114531f55d552"
}
```

**Debug Steps**:
1. Check if this ID exists in products collection
2. Verify ID format (should be 24 hex characters)
3. Check if product is active/available
4. Check if product has sufficient quantity
5. Review server error logs for detailed error message

**Potential Issues to Check**:
- ❗ Product doesn't exist in database
- ❗ Product is out of stock (quantity = 0)
- ❗ Product is inactive/deleted
- ❗ Invalid ObjectId format
- ❗ Category reference is broken
- ❗ Seller reference is broken

**Error Scenarios to Test**:
```json
// Test with non-existent ID
{
    "productId": "000000000000000000000000"
}

// Test with invalid format
{
    "productId": "invalid-id-format"
}

// Test with empty string
{
    "productId": ""
}

// Test without productId field
{
    "color": "red"
}
```

---

#### Test 6.3: Add Multiple Products to Cart
**Endpoint**: `POST /api/v1/carts`

**Steps**:
1. Add first product (from Test 6.2A)
2. Add second different product
3. Add third different product

**Expected Results**:
- ✅ All products added successfully
- ✅ Cart contains all items
- ✅ Total price updated correctly
- ✅ Each item has correct quantity

---

#### Test 6.4: Update Quantity in Cart
**Endpoint**: `PUT /api/v1/carts/{cartItemId}`

**Request Body**:
```json
{
    "quantity": 3
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Quantity updated to 3
- ✅ Item total price recalculated
- ✅ Cart total price updated

**Edge Cases to Test**:
```json
// Test with quantity = 0 (should remove item or reject)
{ "quantity": 0 }

// Test with negative quantity (should reject)
{ "quantity": -1 }

// Test with quantity > available stock (should reject)
{ "quantity": 999999 }
```

---

#### Test 6.5: Apply Coupon to Cart
**Endpoint**: `PUT /api/v1/carts/applyCoupon`

**Prerequisites**: Create a valid coupon first (see Admin Flow)

**Request Body**:
```json
{
    "code": "EOMDNR_9"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Discount applied
- ✅ Total price reduced by discount percentage
- ✅ Coupon code stored in cart

**Edge Cases**:
- Invalid coupon code
- Expired coupon
- Already used coupon

---

#### Test 6.6: Remove Single Product from Cart
**Endpoint**: `DELETE /api/v1/carts/{cartItemId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Item removed from cart
- ✅ Cart total recalculated
- ✅ Other items unaffected

---

#### Test 6.7: Clear Entire Cart
**Endpoint**: `DELETE /api/v1/carts`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ All items removed
- ✅ Cart is empty
- ✅ Total price = 0

---

### Test Suite 7: Address Management

#### Test 7.1: Add Shipping Address
**Endpoint**: `POST /api/v1/addresses`

**Request Body**:
```json
{
    "alias": "Home",
    "phone": "01223314105",
    "details": "123 Main Street, Apt 4",
    "country": "Egypt",
    "city": "Cairo",
    "postalCode": "12345"
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Address saved successfully
- ✅ Address ID returned

---

#### Test 7.2: Get All Addresses
**Endpoint**: `GET /api/v1/addresses`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns all user addresses
- ✅ Contains address from Test 7.1

---

#### Test 7.3: Delete Address
**Endpoint**: `DELETE /api/v1/addresses/{addressId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Address removed successfully

---

### Test Suite 8: Order Placement - End-to-End

#### Pre-Order Setup:
1. Clear cart (Test 6.7)
2. Add 2-3 products to cart (Test 6.2)
3. Add shipping address (Test 7.1)
4. Have valid cart with items

---

#### Test 8.1: Create Cash Order
**Endpoint**: `POST /api/v1/orders/{cartId}`

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Order created successfully
- ✅ Order ID returned
- ✅ Cart is cleared automatically
- ✅ Order status = "pending" or "processing"
- ✅ Payment method = "cash"

**Verification**:
- ✅ Products quantity reduced in inventory
- ✅ Order contains customer info
- ✅ Order contains shipping address
- ✅ Order total matches cart total

---

#### Test 8.2: Get Checkout Session (Online Payment)
**Endpoint**: `GET /api/v1/orders/checkout-session/{cartId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Stripe/Payment session URL returned
- ✅ Can redirect to payment page

---

#### Test 8.3: Get All Customer Orders
**Endpoint**: `GET /api/v1/orders`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns customer's orders only
- ✅ Contains order from Test 8.1
- ✅ Orders sorted by date (newest first)

---

#### Test 8.4: Get Specific Order Details
**Endpoint**: `GET /api/v1/orders/{orderId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns complete order details
- ✅ Contains all order items
- ✅ Contains shipping address
- ✅ Contains payment info

---

### Test Suite 9: Reviews & Ratings

#### Test 9.1: Create Product Review
**Endpoint**: `POST /api/v1/reviews`

**Request Body**:
```json
{
    "title": "Great product, highly recommended!",
    "rating": 4.5,
    "product": "<valid-product-id>"
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Review created
- ✅ Product rating average updated
- ✅ Product rating count incremented

**Note**: User might need to have purchased the product first (business logic dependent)

---

#### Test 9.2: Create Review via Nested Route
**Endpoint**: `POST /api/v1/products/{productId}/reviews`

**Request Body**:
```json
{
    "title": "Another great review",
    "rating": 5.0
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Review linked to product automatically

---

#### Test 9.3: Get All User Reviews
**Endpoint**: `GET /api/v1/reviews`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns all reviews by current user

---

#### Test 9.4: Update Own Review
**Endpoint**: `PUT /api/v1/reviews/{reviewId}`

**Request Body**:
```json
{
    "rating": 3.5,
    "title": "Updated review text"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Review updated
- ✅ Product rating recalculated

---

#### Test 9.5: Delete Own Review
**Endpoint**: `DELETE /api/v1/reviews/{reviewId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Review deleted
- ✅ Product rating recalculated

---

### Test Suite 10: Affiliate Program (Optional Customer Feature)

#### Test 10.1: Register as Affiliate
**Endpoint**: `POST /api/v1/affiliates/register`

**Request Body**:
```json
{
    "userId": "<customer-user-id>"
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Affiliate account created
- ✅ Unique referral code generated

---

#### Test 10.2: Get Affiliate Dashboard
**Endpoint**: `GET /api/v1/affiliates/dashboard`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns affiliate stats
- ✅ Shows referral code
- ✅ Shows clicks, conversions, commissions

---

#### Test 10.3: Track Referral Click
**Endpoint**: `POST /api/v1/affiliates/track-click/{referralCode}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Click tracked successfully

---

#### Test 10.4: Get Affiliate Commissions
**Endpoint**: `GET /api/v1/affiliates/commissions`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns commission history

---

#### Test 10.5: Request Commission Payout
**Endpoint**: `POST /api/v1/affiliates/request-payout`

**Request Body**:
```json
{
    "paymentMethod": "paypal",
    "accountEmail": "affiliate@example.com"
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Payout request created
- ✅ Status = "pending"

---

---

## 👔 SELLER FLOW TESTING

### Test Suite 11: Seller Registration & Setup

#### Test 11.1: Create Seller Account
**Endpoint**: `POST /api/v1/auth/signUp`

**Request Body**:
```json
{
    "name": "Test Seller",
    "email": "seller1@test.com",
    "phone": "01234567891",
    "password": "Seller123456",
    "passwordConfirmation": "Seller123456"
}
```

**Expected Results**:
- ✅ Status: 201 Created
- ✅ JWT token received

**Post-Step**: Admin needs to change user role to "seller" OR user can be created with seller role by admin

---

#### Test 11.2: Create Seller Profile
**Endpoint**: `POST /api/v1/sellers/create-profile`

**Request Body**:
```json
{
    "firstName": "John",
    "lastName": "Seller",
    "email": "seller1@test.com",
    "phone": "01234567891",
    "country": "Egypt",
    "gender": "male",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "address": "123 Business Street"
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Seller profile created
- ✅ Seller can now manage products

---

#### Test 11.3: Get Seller Profile
**Endpoint**: `GET /api/v1/sellers/profile`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns seller profile data
- ✅ Matches data from Test 11.2

---

#### Test 11.4: Update Seller Profile
**Endpoint**: `PUT /api/v1/sellers/profile`

**Request Body**:
```json
{
    "firstName": "Updated",
    "lastName": "Seller Name",
    "gender": "male"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Profile updated successfully

---

#### Test 11.5: Update Seller Contact Details
**Endpoint**: `PUT /api/v1/sellers/contact-details`

**Request Body**:
```json
{
    "phone": "01111111111",
    "country": "Egypt",
    "address": "456 New Business Avenue"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Contact details updated

---

#### Test 11.6: Update Seller Password
**Endpoint**: `PUT /api/v1/sellers/password`

**Request Body**:
```json
{
    "currentPassword": "Seller123456",
    "newPassword": "NewSeller123456",
    "newPasswordConfirm": "NewSeller123456"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Password updated successfully

---

### Test Suite 12: Seller Product Management

#### Test 12.1: Add New Product (Seller)
**Endpoint**: `POST /api/v1/products/seller`

**Request Body**:
```json
{
    "title": "Seller's Test Product",
    "description": "High quality product from our store",
    "quantity": 100,
    "price": 299.99,
    "category": "<valid-category-id>",
    "colors": ["black", "white"],
    "imageCover": "product-image.jpg",
    "images": ["image1.jpg", "image2.jpg"]
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Product created successfully
- ✅ Product linked to seller automatically
- ✅ Product is active and visible
- ✅ Product ID returned (save for later tests)

**Verification**:
- ✅ Product appears in seller's product list
- ✅ Product appears in public product listing
- ✅ Product has correct seller reference

---

#### Test 12.2: Get All Seller Products
**Endpoint**: `GET /api/v1/products/seller`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns only seller's products
- ✅ Contains product from Test 12.1
- ✅ Doesn't show other sellers' products

---

#### Test 12.3: Get Specific Seller Product
**Endpoint**: `GET /api/v1/products/seller/{productId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns product details
- ✅ Only works if product belongs to seller

---

#### Test 12.4: Update Seller Product
**Endpoint**: `PUT /api/v1/products/seller/{productId}`

**Request Body**:
```json
{
    "title": "Updated Product Title",
    "price": 249.99,
    "quantity": 150
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Product updated successfully
- ✅ Changes reflected immediately

---

#### Test 12.5: Delete Seller Product
**Endpoint**: `DELETE /api/v1/products/seller/{productId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Product deleted/deactivated
- ✅ Product no longer in seller's list
- ✅ Product no longer in public listings

---

### Test Suite 13: Seller Order Management

#### Prerequisites:
- Customer has placed an order with seller's product

---

#### Test 13.1: Get All Seller Orders
**Endpoint**: `GET /api/v1/orders/seller`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns orders containing seller's products
- ✅ Shows order details
- ✅ Shows customer information (as needed)

---

#### Test 13.2: Get Specific Seller Order
**Endpoint**: `GET /api/v1/orders/seller/{orderId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns order details
- ✅ Only accessible if order contains seller's products

---

#### Test 13.3: Update Order Status (if permitted)
**Endpoint**: `PUT /api/v1/orders/{orderId}`

**Request Body**:
```json
{
    "status": "shipped"
}
```

**Expected Results**:
- Depends on permission model
- May require admin role

---

---

## 👨‍💼 ADMIN FLOW TESTING

### Test Suite 14: Admin User Management

#### Test 14.1: Admin Login
**Endpoint**: `POST /api/v1/auth/logIn`

**Request Body**:
```json
{
    "email": "admin@test.com",
    "password": "Admin123456"
}
```

**Prerequisites**: Admin account must exist in database

**Expected Results**:
- ✅ Status: 200 OK
- ✅ JWT token received with admin role

---

#### Test 14.2: Create New User (Any Role)
**Endpoint**: `POST /api/v1/admin`

**Request Body**:
```json
{
    "name": "New User",
    "email": "newuser@test.com",
    "phone": "01234567892",
    "password": "User123456",
    "passwordConfirmation": "User123456",
    "role": "seller"
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ User created with specified role
- ✅ User can login

**Test Different Roles**:
- Create customer: `"role": "customer"`
- Create seller: `"role": "seller"`
- Create admin: `"role": "admin"`
- Create accountant: `"role": "accountant"`

---

#### Test 14.3: Get All Users
**Endpoint**: `GET /api/v1/admin`

**Query Parameters**:
- `?page=1&limit=10` (pagination)

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns all users in system
- ✅ Shows user roles
- ✅ Pagination works

---

#### Test 14.4: Get Specific User
**Endpoint**: `GET /api/v1/admin/{userId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns complete user details
- ✅ Shows role, status, activity

---

#### Test 14.5: Update User
**Endpoint**: `PUT /api/v1/admin/{userId}`

**Request Body** (form-data):
```
name: "Updated User Name"
role: "seller"
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ User updated successfully
- ✅ Can change role, name, status

---

#### Test 14.6: Change User Password (Admin)
**Endpoint**: `PUT /api/v1/admin/changePassword`

**Request Body**:
```json
{
    "email": "newuser@test.com",
    "currentPassword": "User123456",
    "newPassword": "NewUser123456",
    "newPasswordConfirm": "NewUser123456"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Password changed successfully

---

#### Test 14.7: Delete User
**Endpoint**: `DELETE /api/v1/admin/{userId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ User deleted/deactivated
- ✅ User cannot login

---

### Test Suite 15: Admin Category Management

#### Test 15.1: Create Category
**Endpoint**: `POST /api/v1/categories`

**Request Body** (form-data):
```
name: "Electronics"
image: <upload-image-file>
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Category created
- ✅ Image uploaded and URL returned
- ✅ Category ID returned

---

#### Test 15.2: Update Category
**Endpoint**: `PUT /api/v1/categories/{categoryId}`

**Request Body** (form-data):
```
name: "Updated Electronics"
image: <new-image-file>
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Category updated
- ✅ Old image replaced

---

#### Test 15.3: Delete Category
**Endpoint**: `DELETE /api/v1/categories/{categoryId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Category deleted
- ✅ Products in category handled correctly (either reassigned or deleted)

---

### Test Suite 16: Admin Product Management

#### Test 16.1: Create Product (Admin)
**Endpoint**: `POST /api/v1/products`

**Request Body** (form-data):
```
title: "Admin Test Product"
quantity: 50
sold: 0
price: 499.99
description: "Product created by admin"
category: <valid-category-id>
subCategory: <valid-subcategory-id>
imageCover: <upload-image>
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Product created
- ✅ Product visible to all users

---

#### Test 16.2: Update Product (Admin)
**Endpoint**: `PUT /api/v1/products/{productId}`

**Request Body** (form-data):
```
price: 599.99
discountPercentage: 10
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Product updated
- ✅ Can update any product (not just admin's)

---

#### Test 16.3: Delete Product (Admin)
**Endpoint**: `DELETE /api/v1/products/{productId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Product deleted
- ✅ Can delete any product

---

### Test Suite 17: Admin Coupon Management

#### Test 17.1: Create Coupon
**Endpoint**: `POST /api/v1/coupons`

**Request Body**:
```json
{
    "code": "SAVE20",
    "discount": 20,
    "expire": "12/31/2025"
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Coupon created
- ✅ Code is unique
- ✅ Expiry date parsed correctly

---

#### Test 17.2: Get All Coupons
**Endpoint**: `GET /api/v1/coupons`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns all coupons
- ✅ Shows active and expired coupons

---

#### Test 17.3: Get Specific Coupon
**Endpoint**: `GET /api/v1/coupons/{couponId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns coupon details

---

#### Test 17.4: Update Coupon
**Endpoint**: `PUT /api/v1/coupons/{couponId}`

**Request Body**:
```json
{
    "discount": 25
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Coupon updated
- ✅ New discount applied

---

#### Test 17.5: Delete Coupon
**Endpoint**: `DELETE /api/v1/coupons/{couponId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Coupon deleted
- ✅ Cannot be used anymore

---

### Test Suite 18: Admin Order Management

#### Test 18.1: Get All Orders (Admin)
**Endpoint**: `GET /api/v1/orders`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns ALL orders in system
- ✅ Shows orders from all customers
- ✅ Shows all statuses

---

#### Test 18.2: Update Order Status
**Endpoint**: `PUT /api/v1/orders/{orderId}`

**Request Body**:
```json
{
    "isPaid": true,
    "status": "delivered"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Order updated
- ✅ Status changed to "delivered"
- ✅ Payment status updated

**Test Different Statuses**:
- "pending"
- "processing"
- "shipped"
- "delivered"
- "cancelled"

---

#### Test 18.3: Delete Order (Admin)
**Endpoint**: `DELETE /api/v1/orders/{orderId}`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Order deleted
- ✅ Inventory may be restored (depends on logic)

---

### Test Suite 19: Admin Settings Management

#### Test 19.1: Add Site Setting
**Endpoint**: `POST /api/v1/settings`

**Request Body**:
```json
{
    "key": "shipping_fee",
    "value": 25
}
```

**Expected Results**:
- ✅ Status: 200/201 OK
- ✅ Setting created
- ✅ Key-value stored

**Test Different Settings**:
```json
{ "key": "taxes", "value": 14 }
{ "key": "free_shipping_threshold", "value": 500 }
{ "key": "max_cart_items", "value": 10 }
```

---

#### Test 19.2: Get All Settings
**Endpoint**: `GET /api/v1/settings`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns all settings
- ✅ Shows key-value pairs

---

#### Test 19.3: Update Setting
**Endpoint**: `PUT /api/v1/settings/{settingId}`

**Request Body**:
```json
{
    "value": 30
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Setting value updated

---

---

## 💰 ACCOUNTANT FLOW TESTING

### Test Suite 20: Commission Management

#### Test 20.1: Get All Commission Requests
**Endpoint**: `GET /api/v1/accountants/commission-requests`

**Prerequisites**: Login as accountant

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns all pending commission requests
- ✅ Shows affiliate details

---

#### Test 20.2: Review Commission Request (Approve)
**Endpoint**: `PUT /api/v1/accountants/commission-requests/{requestId}/review`

**Request Body**:
```json
{
    "action": "approved",
    "notes": "Approved by accountant - payment processed"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Request status changed to "approved"
- ✅ Notes saved

---

#### Test 20.3: Review Commission Request (Reject)
**Endpoint**: `PUT /api/v1/accountants/commission-requests/{requestId}/review`

**Request Body**:
```json
{
    "action": "rejected",
    "notes": "Insufficient commission balance"
}
```

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Request status changed to "rejected"

---

#### Test 20.4: Mark Request as Paid
**Endpoint**: `PUT /api/v1/accountants/commission-requests/{requestId}/pay`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Request marked as paid
- ✅ Payment date recorded

---

#### Test 20.5: Get Affiliate Commission Report
**Endpoint**: `GET /api/v1/accountants/affiliate-commissions`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns commission statistics
- ✅ Shows total commissions by affiliate

---

#### Test 20.6: Get Paid Orders Report
**Endpoint**: `GET /api/v1/accountants/paid-orders`

**Expected Results**:
- ✅ Status: 200 OK
- ✅ Returns all paid orders
- ✅ Shows payment details

---

---

## 🔍 CRITICAL CART BUG INVESTIGATION

### Debugging Steps for ProductId: `694beb0c61e114531f55d552`

#### Step 1: Verify Product Existence
**Action**: Check if product exists in database

**Manual Check via Postman**:
```
GET /api/v1/products/694beb0c61e114531f55d552
```

**Possible Outcomes**:
- ✅ Product found → Proceed to Step 2
- ❌ 404 Not Found → **Root Cause: Product doesn't exist**
- ❌ 400 Bad Request → **Root Cause: Invalid ObjectId format**

---

#### Step 2: Verify Product Status
**Check Product Response**:
```json
{
    "_id": "694beb0c61e114531f55d552",
    "title": "...",
    "quantity": ???,  // Check if > 0
    "active": ???,    // Check if true
    "isDeleted": ???, // Check if false
    ...
}
```

**Potential Issues**:
- Quantity = 0 (out of stock)
- active = false
- isDeleted = true
- Product is archived

---

#### Step 3: Test Cart Add with Debug
**Endpoint**: `POST /api/v1/carts`

**Request 1: Current Failing Product**
```json
{
    "productId": "694beb0c61e114531f55d552"
}
```

**Request 2: Known Working Product**
```json
{
    "productId": "<product-id-from-test-3.1>"
}
```

**Compare Responses**:
- Document exact error message
- Note HTTP status code
- Check server logs for stack trace

---

#### Step 4: Validate Product References
**Check Product Data Integrity**:

1. **Category Reference**:
   - Product.category should be valid ObjectId
   - Category should exist in categories collection

2. **Seller Reference** (if applicable):
   - Product.seller should be valid ObjectId
   - Seller should exist and be active

3. **SubCategory Reference**:
   - Product.subCategory should be valid
   - SubCategory should belong to product's category

---

#### Step 5: Test Edge Cases

**Test A: Product with Variants**
```json
{
    "productId": "694beb0c61e114531f55d552",
    "color": "red"
}
```

**Test B: Product Quantity Edge Case**
```json
{
    "productId": "694beb0c61e114531f55d552",
    "quantity": 1
}
```

---

#### Step 6: Server-Side Validation
**Check Backend Code**:

1. **Cart Controller**: Verify product validation logic
2. **Product Model**: Check schema validation rules
3. **Middleware**: Check authentication and authorization
4. **Database Queries**: Verify MongoDB queries

**Common Issues to Look For**:
```javascript
// Missing product check
if (!product) {
    throw new Error("Product not found");
}

// Stock validation
if (product.quantity < requestedQuantity) {
    throw new Error("Insufficient stock");
}

// Active status check
if (!product.active || product.isDeleted) {
    throw new Error("Product not available");
}
```

---

#### Step 7: Database Direct Query
**Connect to MongoDB** and run:

```javascript
// Find product
db.products.findOne({ _id: ObjectId("694beb0c61e114531f55d552") })

// Check if any cart has this product
db.carts.find({ "items.product": ObjectId("694beb0c61e114531f55d552") })

// Verify category exists
db.categories.findOne({ _id: /* product's category id */ })
```

---

### Expected Error Categories

#### 1. **404 Not Found**
- Product doesn't exist in database
- Product deleted but cart still references it

**Solution**: 
- Remove orphaned cart items
- Validate product exists before adding

---

#### 2. **400 Bad Request**
- Invalid ObjectId format
- Missing required fields
- Validation errors

**Solution**:
- Validate ObjectId format
- Check request body structure

---

#### 3. **409 Conflict**
- Product already in cart
- Quantity exceeds available stock

**Solution**:
- Update quantity instead of adding
- Validate stock availability

---

#### 4. **500 Internal Server Error**
- Database connection issue
- Broken reference (category, seller)
- Code logic error

**Solution**:
- Check server logs
- Verify database references
- Fix backend code

---

---

## 📊 TEST RESULT TRACKING

### Test Execution Checklist

Use this checklist to track testing progress:

#### Customer Flow
- [ ] Registration & Login (Tests 1.1-1.3)
- [ ] Profile Management (Tests 2.1-2.3)
- [ ] Product Discovery (Tests 3.1-3.3)
- [ ] Categories (Tests 4.1-4.2)
- [ ] Wishlist (Tests 5.1-5.3)
- [ ] Shopping Cart (Tests 6.1-6.7) ⚠️ **CRITICAL**
- [ ] Address Management (Tests 7.1-7.3)
- [ ] Order Placement (Tests 8.1-8.4)
- [ ] Reviews (Tests 9.1-9.5)
- [ ] Affiliate Program (Tests 10.1-10.5)

#### Seller Flow
- [ ] Seller Setup (Tests 11.1-11.6)
- [ ] Product Management (Tests 12.1-12.5)
- [ ] Order Management (Tests 13.1-13.3)

#### Admin Flow
- [ ] User Management (Tests 14.1-14.7)
- [ ] Category Management (Tests 15.1-15.3)
- [ ] Product Management (Tests 16.1-16.3)
- [ ] Coupon Management (Tests 17.1-17.5)
- [ ] Order Management (Tests 18.1-18.3)
- [ ] Settings Management (Tests 19.1-19.3)

#### Accountant Flow
- [ ] Commission Management (Tests 20.1-20.6)

#### Bug Investigation
- [ ] Cart Bug Debugging (All steps)

---

## 🐛 Bug Report Template

When you find issues, document them using this format:

### Bug Report: [Short Description]

**Bug ID**: BUG-XXX  
**Severity**: Critical / High / Medium / Low  
**Test Suite**: [Test Suite Number]  
**Test Case**: [Test Case Number]

**Description**:
[Detailed description of the issue]

**Steps to Reproduce**:
1. Login as [role]
2. Navigate to [endpoint]
3. Send request with [data]
4. Observe [issue]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Request Details**:
```
Method: POST
Endpoint: /api/v1/carts
Headers: {
    Authorization: Bearer <token>
}
Body: {
    "productId": "694beb0c61e114531f55d552"
}
```

**Response**:
```json
{
    "status": "error",
    "message": "..."
}
```

**Server Logs** (if available):
```
[Error stack trace]
```

**Screenshots**: [Attach if applicable]

**Environment**:
- Node.js Version: 
- Database: MongoDB
- Environment: Development/Production

**Suggested Fix**:
[Your analysis of potential solution]

---

## 📝 Testing Best Practices

### Before Testing
1. **Backup Database**: Create database snapshot
2. **Clean State**: Start with known data state
3. **Environment Variables**: Verify all env vars are set correctly
4. **Server Running**: Ensure backend is running without errors

### During Testing
1. **Sequential Testing**: Follow test order
2. **Save IDs**: Save returned IDs for subsequent tests
3. **Document Issues**: Note any unexpected behavior
4. **Check Logs**: Monitor server console for errors
5. **Verify Data**: Check database after critical operations

### After Testing
1. **Review Results**: Go through all test results
2. **Categorize Issues**: Group bugs by severity
3. **Clean Test Data**: Remove test data if needed
4. **Update Documentation**: Note any API changes discovered

---

## 🎯 Priority Testing Areas

Based on the cart error, prioritize these areas:

### 1. **CRITICAL - Shopping Cart** (Test Suite 6)
- All cart operations must work flawlessly
- Focus on product ID validation
- Test with various product states

### 2. **HIGH - Product Management** (Test Suites 3, 12, 16)
- Ensure product data integrity
- Verify product references
- Test product lifecycle

### 3. **HIGH - Order Flow** (Test Suite 8)
- Complete end-to-end order placement
- Verify cart-to-order transition
- Check inventory updates

### 4. **MEDIUM - User Management** (Test Suites 2, 11, 14)
- Verify role-based access
- Test authentication flow
- Check authorization rules

### 5. **LOW - Supporting Features**
- Reviews, wishlists, affiliates
- Test after core features work

---

## 🔧 Troubleshooting Common Issues

### Issue: JWT Token Not Saved
**Solution**: Check Postman test script in Auth endpoints

### Issue: "Unauthorized" on Protected Routes
**Solution**: Verify JWT token in Authorization header

### Issue: "Product Not Found"
**Solution**: Use GET /products to get valid product IDs

### Issue: "Insufficient Stock"
**Solution**: Check product quantity before adding to cart

### Issue: "Invalid ObjectId"
**Solution**: Ensure ID is 24-character hex string

### Issue: "Category Reference Error"
**Solution**: Verify category exists before creating product

---

## ✅ Success Criteria

Testing is complete when:

1. ✅ All customer workflows work end-to-end
2. ✅ Sellers can manage their products and orders
3. ✅ Admins can manage all aspects of the system
4. ✅ Cart operations work reliably
5. ✅ **Cart bug with productId resolved**
6. ✅ No critical or high severity bugs remaining
7. ✅ All edge cases handled gracefully
8. ✅ Error messages are clear and helpful

---

## 📞 Support & Escalation

If you encounter issues beyond testing scope:

1. **Database Issues**: Contact database administrator
2. **Payment Gateway**: Check Stripe/payment provider docs
3. **Authentication**: Review JWT implementation
4. **Performance**: Consider load testing
5. **Security**: Conduct security audit

---

## 📌 Notes

- Replace `<valid-product-id>` with actual product IDs from your database
- Replace `<valid-category-id>` with actual category IDs
- Update `{{mainHost}}` in Postman environment
- Some endpoints may require specific permissions
- Test data should be isolated from production

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-26  
**Prepared By**: AI Software Engineer  
**Purpose**: Comprehensive Manual Testing & Bug Investigation

---

## 🎬 Quick Start Guide

### For Immediate Cart Bug Testing:

1. **Setup**:
   - Import Postman collection
   - Set `{{mainHost}}` in environment
   - Login as customer to get JWT token

2. **Test Sequence**:
   ```
   1. GET /api/v1/products → Get valid product IDs
   2. POST /api/v1/carts with valid product → Should work
   3. POST /api/v1/carts with "694beb0c61e114531f55d552" → Test failing case
   4. GET /api/v1/products/694beb0c61e114531f55d552 → Check if exists
   5. Review error response and server logs
   ```

3. **Document Findings**:
   - What error message appears?
   - Does the product exist?
   - What's different about this product?

4. **Fix & Retest**:
   - Apply fix based on findings
   - Rerun all cart tests (6.1-6.7)
   - Verify fix doesn't break other features

---

**Good luck with testing! 🚀**
