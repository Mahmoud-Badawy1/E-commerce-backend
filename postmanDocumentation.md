# Postman Documentation for E-Commerce API

This document provides comprehensive documentation for all Postman requests in the E-Commerce WebSite collection. It includes steps, required data, authentication, and CRUD operations for each endpoint.

## Setup Instructions

1. **Import Collection**: Import `E-Commerce WebSite.postman_collection.json` into Postman.
2. **Environment Variables**:
   - `mainHost`: Set to your API base URL (e.g., `http://localhost:3000` or `https://your-app.vercel.app`).
   - `JWT`: Auto-set after authentication (starts as empty).
3. **Authentication**: Most requests require Bearer token auth. Log in first to populate `{{JWT}}`.
4. **Roles**: Some endpoints require specific roles (admin, seller, customer). Ensure your user has the correct role.
5. **IDs**: Replace placeholder IDs (e.g., `6976b25cb6755bc2f0dbd367`) with actual MongoDB ObjectIds from your database.

## Authentication

### signUp
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/auth/signUp`
- **Auth**: None
- **Body** (JSON):
  ```json
  {
    "name": "Your Name",
    "email": "your-email@example.com",
    "phone": "01234567890",
    "password": "yourpassword",
    "passwordConfirmation": "yourpassword"
  }
  ```
- **Steps**:
  1. Fill in user details.
  2. Send request.
  3. JWT is auto-saved to environment.
- **Response**: User data + token.

### signUp-google
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/auth/signUp-google`
- **Auth**: None
- **Body** (JSON):
  ```json
  {
    "idToken": "google_id_token_here"
  }
  ```
- **Steps**:
  1. Obtain Google ID token.
  2. Send request.
  3. JWT is auto-saved.
- **Response**: User data + token.

### logIn
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/auth/logIn`
- **Auth**: None
- **Body** (JSON):
  ```json
  {
    "email": "your-email@example.com",
    "password": "yourpassword"
  }
  ```
- **Steps**:
  1. Provide credentials.
  2. Send request.
  3. JWT is auto-saved.
- **Response**: User data + token.

### Verify-2FA
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/auth/verify-2FA`
- **Auth**: None
- **Body** (JSON):
  ```json
  {
    "email": "your-email@example.com",
    "OTP": "123456"
  }
  ```
- **Steps**:
  1. Enter email and OTP from email.
  2. Send request.
  3. JWT is auto-saved.
- **Response**: User data + token.

### resend-2FA-Code
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/auth/resend-2FA`
- **Auth**: None
- **Body** (JSON):
  ```json
  {
    "email": "your-email@example.com"
  }
  ```
- **Steps**:
  1. Provide email.
  2. Send request.
- **Response**: Success message.

## Admin Dashboard (CRUD for Users)

### createUser
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/admin`
- **Auth**: Bearer (Admin role required)
- **Body** (JSON):
  ```json
  {
    "name": "New User",
    "email": "new@example.com",
    "phone": "01234567890", // optional
    "password": "password",
    "passwordConfirmation": "password",
    "role": "customer" // optional, default: customer
  }
  ```
- **Steps**:
  1. Ensure admin login.
  2. Fill user data.
  3. Send request.
- **Response**: Created user data.

### getAllUsers
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/admin?page=1&limit=10`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Optional: Add query params for pagination.
  2. Send request.
- **Response**: List of users.

### getSpecificUser
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/admin/{userId}`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Replace {userId} with actual ID.
  2. Send request.
- **Response**: User details.

### updateUser
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/admin/{userId}`
- **Auth**: Bearer (Admin)
- **Body**: Form-data (e.g., update name, email, etc.)
- **Steps**:
  1. Provide user ID.
  2. Add fields to update in form-data.
  3. Send request.
- **Response**: Updated user.

### changePassword
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/admin/changePassword`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "currentPassword": "oldpass",
    "newPassword": "newpass",
    "newPasswordConfirm": "newpass"
  }
  ```
- **Steps**:
  1. Provide user email and passwords.
  2. Send request.
- **Response**: Success message.

### deleteUser
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/admin/{userId}`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Provide user ID.
  2. Send request.
- **Response**: Success message.

## User Dashboard

### getMyData
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/users/getMyData`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Current user data.

### updateMyData
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/users/updateMyData`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "name": "Updated Name"
  }
  ```
- **Steps**:
  1. Provide fields to update.
  2. Send request.
- **Response**: Updated user.

### changeMyPassword
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/users/changeMyPassword`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "currentPassword": "oldpass",
    "newPassword": "newpass",
    "newPasswordConfirm": "newpass"
  }
  ```
- **Steps**:
  1. Provide passwords.
  2. Send request.
- **Response**: Success.

### deacticveMyUser
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/users/deactivateMyUser`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Success.

## Affiliate Dashboard

### registerAsAffiliate
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/affiliates/register`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "userId": "user_object_id"
  }
  ```
- **Steps**:
  1. Provide user ID.
  2. Send request.
- **Response**: Affiliate data.

### getAffiliateDashboard
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/affiliates/dashboard`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Dashboard stats.

### getAffiliateCommissions
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/affiliates/commissions`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Commission list.

### trackReferralClick
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/affiliates/track-click/{referralCode}`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Provide referral code in URL.
  2. Send request.
- **Response**: Success.

### requestCommissionPayout
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/affiliates/request-payout`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "paymentMethod": "paypal",
    "accountEmail": "email@example.com"
  }
  ```
- **Steps**:
  1. Provide payout details.
  2. Send request.
- **Response**: Payout request.

### getAffiliateOrders
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/affiliates/orders`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Orders via affiliate.

## Accountant Dashboard

### getAllCommissionRequests
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/accountants/commission-requests`
- **Auth**: Bearer (Accountant)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Commission requests.

### reviewCommissionRequest(Approve/Reject)
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/accountants/commission-requests/{requestId}/review`
- **Auth**: Bearer (Accountant)
- **Body** (JSON):
  ```json
  {
    "action": "approved",
    "notes": "Approved"
  }
  ```
- **Steps**:
  1. Provide request ID and action.
  2. Send request.
- **Response**: Updated request.

### markRequestAsPaid
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/accountants/commission-requests/{requestId}/pay`
- **Auth**: Bearer (Accountant)
- **Body**: None
- **Steps**:
  1. Provide request ID.
  2. Send request.
- **Response**: Marked as paid.

### getAffiliateCommissionReport
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/accountants/affiliate-commissions`
- **Auth**: Bearer (Accountant)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Report.

### getPaidOrdersReport
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/accountants/paid-orders`
- **Auth**: Bearer (Accountant)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Paid orders report.

## Forget Password

### forgetPassword
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/forgetPassword/sendResetCode`
- **Auth**: None
- **Body** (JSON):
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Steps**:
  1. Provide email.
  2. Send request.
- **Response**: Reset code sent.

### verifyResetCode
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/forgetPassword/verifyResetCode`
- **Auth**: None
- **Body** (JSON):
  ```json
  {
    "resetCode": "123456"
  }
  ```
- **Steps**:
  1. Provide reset code.
  2. Send request.
- **Response**: Verification success.

### resetPassword
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/forgetPassword/resetPassword`
- **Auth**: None
- **Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "newPassword": "newpass",
    "confirmNewPassword": "newpass"
  }
  ```
- **Steps**:
  1. Provide email and new password.
  2. Send request.
  3. JWT auto-saved.
- **Response**: Success + token.

## Categories (CRUD)

### createCategory
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/categories`
- **Auth**: Bearer (Admin)
- **Body**: Form-data
  - name: "Category Name" (required)
  - image: File (optional)
- **Steps**:
  1. Provide name and image.
  2. Send request.
- **Response**: Created category.

### getAllCategories
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/categories?page=1&limit=10`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Optional pagination.
  2. Send request.
- **Response**: Categories list.

### getSpecificCategory
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/categories/{categoryId}`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Provide category ID.
  2. Send request.
- **Response**: Category details.

### updateCategory
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/categories/{categoryId}`
- **Auth**: Bearer (Admin)
- **Body**: Form-data (e.g., new image)
- **Steps**:
  1. Provide ID and updates.
  2. Send request.
- **Response**: Updated category.

### deleteCategory
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/categories/{categoryId}`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Provide ID.
  2. Send request.
- **Response**: Success.

## Products (CRUD)

### createProduct
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/products`
- **Auth**: Bearer (Seller/Admin)
- **Body**: Form-data
  - title: "Product Title" (required)
  - description: "Product description" (required)
  - quantity: 10 (required)
  - price: 100.0 (required)
  - sku: "SKU123" (required, unique)
  - category: "category_id" (required)
  - imageCover: File (required)
  - colors: ["red", "blue"] (optional)
  - sizes: ["S", "M", "L"] (optional)
  - images: File (optional, multiple)
  - discountPercentage: 10 (optional, default 0)
  - priceAfterDiscount: 90 (optional, default 0)
- **Steps**:
  1. Fill product details.
  2. Send request.
- **Response**: Created product.

### getAllProducts
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/products?keyword=search&sort=-ratingsAverage`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Optional filters.
  2. Send request.
- **Response**: Products list.

### getSpecificProduct
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/products/{productId}`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Provide product ID.
  2. Send request.
- **Response**: Product details.

### updateProduct
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/products/{productId}`
- **Auth**: Bearer (Seller/Admin)
- **Body**: Form-data
- **Steps**:
  1. Provide updates.
  2. Send request.
- **Response**: Updated product.

### deleteProduct
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/products/{productId}`
- **Auth**: Bearer (Seller/Admin)
- **Body**: None
- **Steps**:
  1. Provide ID.
  2. Send request.
- **Response**: Success.

## Coupons (CRUD)

### createCoupon
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/coupons`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "code": "DISCOUNT10",
    "discount": 10,
    "expire": "2025-12-31"
  }
  ```
- **Steps**:
  1. Provide coupon details (all required).
  2. Send request.
- **Response**: Created coupon.

### getAllCoupons
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/coupons?page=1&limit=10`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Coupons list.

### getSpecificCoupon
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/coupons/{couponId}`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Provide ID.
  2. Send request.
- **Response**: Coupon details.

### updateCoupon
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/coupons/{couponId}`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "discount": 15
  }
  ```
- **Steps**:
  1. Provide updates.
  2. Send request.
- **Response**: Updated coupon.

### deleteCoupon
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/coupons/{couponId}`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Provide ID.
  2. Send request.
- **Response**: Success.

## Addresses

### createAddress
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/addresses`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "alias": "home",
    "phone": "01234567890", // optional
    "details": "123 Street",
    "country": "Egypt",
    "city": "Cairo",
    "postalCode": "12345" // optional
  }
  ```
- **Steps**:
  1. Provide address details.
  2. Send request.
- **Response**: Created address.

### getAllAddresses
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/addresses?page=1&limit=10`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Addresses list.

### deleteAddress
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/addresses/{addressId}`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Provide ID.
  2. Send request.
- **Response**: Success.

## Wishlists

### createWishlist
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/wishlists`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "productId": "product_object_id"
  }
  ```
- **Steps**:
  1. Provide product ID.
  2. Send request.
- **Response**: Added to wishlist.

### getAllWishlists
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/wishlists?page=1&limit=10`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Wishlist items.

### deleteWishlist
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/wishlists/{productId}`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Provide product ID.
  2. Send request.
- **Response**: Removed from wishlist.

## Reviews

### createReview
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/reviews`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "title": "Great product", // optional
    "rating": 5,
    "product": "product_id"
  }
  ```
- **Steps**:
  1. Provide review details.
  2. Send request.
- **Response**: Created review.

### getAllReviews
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/reviews?page=1&limit=10`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Reviews list.

### getSpecificReview
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/reviews/{reviewId}`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Provide ID.
  2. Send request.
- **Response**: Review details.

### updateReview
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/reviews/{reviewId}`
- **Auth**: Bearer (Owner)
- **Body** (JSON):
  ```json
  {
    "rating": 4
  }
  ```
- **Steps**:
  1. Provide updates.
  2. Send request.
- **Response**: Updated review.

### deleteReview
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/reviews/{reviewId}`
- **Auth**: Bearer (Owner/Admin)
- **Body**: None
- **Steps**:
  1. Provide ID.
  2. Send request.
- **Response**: Success.

## Product Reviews

### getListOfSubReviewsForSpecificProduct
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/products/{productId}/reviews?page=1&limit=10`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Provide product ID.
  2. Send request.
- **Response**: Product reviews.

### createReviewForSpecificProduct
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/products/{productId}/reviews`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "title": "Good",
    "rating": 4.5
  }
  ```
- **Steps**:
  1. Provide product ID and review.
  2. Send request.
- **Response**: Created review.

## Carts

### getAllProductsInCart
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/carts`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Cart contents + ID.

### addProductsToCart
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/carts`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "productId": "product_id",
    "quantity": 2,
    "color": "red",
    "size": "M"
  }
  ```
- **Steps**:
  1. Provide product details.
  2. Send request.
- **Response**: Updated cart.

### updateQuantityInCart
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/carts/{itemId}`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "quantity": 3
  }
  ```
- **Steps**:
  1. Provide cart item ID and quantity.
  2. Send request.
- **Response**: Updated cart.

### applyCouponInCart
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/carts/applyCoupon`
- **Auth**: Bearer
- **Body** (JSON):
  ```json
  {
    "code": "DISCOUNT10"
  }
  ```
- **Steps**:
  1. Provide coupon code.
  2. Send request.
- **Response**: Cart with discount.

### deleteProductsInCart
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/carts/{itemId}`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Provide item ID.
  2. Send request.
- **Response**: Updated cart.

### clearCartContent
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/carts`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Empty cart.

## Orders

### createCashOrder
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/orders/{cartId}`
- **Auth**: Bearer
- **Body**: None (uses cart data)
- **Steps**:
  1. Get cart ID from getAllProductsInCart.
  2. Replace {cartId} in URL.
  3. Send request.
- **Response**: Created order.

### checkOutSession
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/orders/checkout-session/{cartId}`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Provide cart ID.
  2. Send request (for payment integration).
- **Response**: Checkout session.

### getAllOrders
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/orders?page=1&limit=10`
- **Auth**: Bearer
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: User's orders.

### updateOrderStatus
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/orders/{orderId}`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "isPaid": true,
    "status": "delivered"
  }
  ```
- **Steps**:
  1. Provide order ID and updates.
  2. Send request.
- **Response**: Updated order.

### deleteOrder
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/orders/{orderId}`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Provide order ID.
  2. Send request.
- **Response**: Success.

## Settings

### addSetting
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/settings`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "key": "taxes",
    "value": 14
  }
  ```
- **Steps**:
  1. Provide key-value (both required).
  2. Send request.
- **Response**: Created setting.

### getSettings
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/settings?page=1&limit=10`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Settings list.

### updateSettings
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/settings/{settingId}`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "value": 15
  }
  ```
- **Steps**:
  1. Provide ID and new value.
  2. Send request.
- **Response**: Updated setting.

## Seller Entity

### Profile

#### getProfile
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/sellers/profile`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Seller profile.

#### addProfile
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/sellers/create-profile`
- **Auth**: Bearer (Seller)
- **Body** (JSON):
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "seller@example.com",
    "phone": "01234567890", // optional
    "country": "Egypt", // optional
    "gender": "male", // optional
    "dateOfBirth": "1990-01-01T00:00:00.000Z", // optional
    "address": "123 Street" // optional
  }
  ```
- **Steps**:
  1. Provide profile details.
  2. Send request.
- **Response**: Created profile.

#### updateProfile
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/sellers/profile`
- **Auth**: Bearer (Seller)
- **Body** (JSON):
  ```json
  {
    "firstName": "Jane"
  }
  ```
- **Steps**:
  1. Provide updates.
  2. Send request.
- **Response**: Updated profile.

#### updateContact
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/sellers/contact-details`
- **Auth**: Bearer (Seller)
- **Body** (JSON):
  ```json
  {
    "phone": "09876543210",
    "country": "USA",
    "address": "456 Ave"
  }
  ```
- **Steps**:
  1. Provide contact updates.
  2. Send request.
- **Response**: Updated contact.

#### updatePassword
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/sellers/password`
- **Auth**: Bearer (Seller)
- **Body** (JSON):
  ```json
  {
    "currentPassword": "oldpass",
    "newPassword": "newpass",
    "newPasswordConfirm": "newpass"
  }
  ```
- **Steps**:
  1. Provide passwords.
  2. Send request.
- **Response**: Success.

### Orders

#### getSellerOrders
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/orders/seller`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Seller's orders.

#### getSellerOrder
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/orders/seller/{orderId}`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Provide order ID.
  2. Send request.
- **Response**: Order details.

### Products

#### getAll
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/products/seller`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Seller's products.

#### getOne
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/products/seller/{productId}`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Provide product ID.
  2. Send request.
- **Response**: Product details.

#### add
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/products/seller`
- **Auth**: Bearer (Seller)
- **Body** (JSON):
  ```json
  {
    "title": "New Product",
    "description": "Description",
    "quantity": 10,
    "price": 100,
    "sku": "SKU123",
    "category": "category_id",
    "imageCover": "image.jpg",
    "colors": ["red"], // optional
    "sizes": ["L", "M"], // optional
    "images": ["img1.jpg"] // optional
  }
  ```
- **Steps**:
  1. Provide product details.
  2. Send request.
- **Response**: Created product.

#### update
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/products/seller/{productId}`
- **Auth**: Bearer (Seller)
- **Body** (JSON):
  ```json
  {
    "title": "Updated Title"
  }
  ```
- **Steps**:
  1. Provide updates.
  2. Send request.
- **Response**: Updated product.

#### delete
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/products/seller/{productId}`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Provide ID.
  2. Send request.
- **Response**: Success.

### deactivateSeller
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/sellers/deactivate`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Deactivated.

## Stats and Analytics

### Public Endpoints (No Auth Required)

#### getActiveAds
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/public/ads`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: List of active ads.

#### getActiveBanners
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/public/banners`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: List of active banners.

#### getFeaturedProducts
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/public/featured-products`
- **Auth**: None
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: 9 featured products.

#### getBestSellers
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/public/best-sellers?limit=10`
- **Auth**: None
- **Body**: None
- **Query Params**:
  - `limit`: Number of products (optional, default 10)
- **Steps**:
  1. Send request with optional limit.
- **Response**: Best-selling products.

### Seller Stats (Seller Role Required)

#### getPopularProducts
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/seller/popular-products?limit=10`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Query Params**:
  - `limit`: Number of products (optional, default 10)
- **Steps**:
  1. Send request.
- **Response**: Seller's most popular products by sold count.

#### getSalesAnalytics
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/seller/sales-analytics?period=month`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Query Params**:
  - `period`: "day", "month", or "year" (optional, default "month")
- **Steps**:
  1. Provide period filter.
  2. Send request.
- **Response**: Average sale value, average items per sale, total revenue, total items.

#### getCustomerGrowth
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/seller/customer-growth`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Customer growth stats over time.

#### getProvinceStats
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/seller/province-stats`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Geographic distribution of customers by province (city field).

#### getDashboardStats
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/seller/dashboard`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Total revenue, customers, transactions, products.

#### getSalesTarget
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/seller/sales-target`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Active sales target with current progress.

#### setSalesTarget
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/stats/seller/sales-target`
- **Auth**: Bearer (Seller)
- **Body** (JSON):
  ```json
  {
    "targetAmount": 500000,
    "period": "monthly" // or "yearly"
  }
  ```
- **Steps**:
  1. Provide target amount and period.
  2. Send request.
- **Response**: Created sales target (deactivates previous targets).

#### getSellerAd
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/seller/ad`
- **Auth**: Bearer (Seller)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Seller dashboard ad (sellerAd slot).

### Admin Stats (Admin Role Required)

#### getPopularProducts
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/admin/popular-products?limit=10&sellerId=xxx`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Query Params**:
  - `limit`: Number of products (optional, default 10)
  - `sellerId`: Filter by specific seller (optional)
- **Steps**:
  1. Send request with optional filters.
- **Response**: Popular products across all sellers or by specific seller.

#### getSalesAnalytics
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/admin/sales-analytics?period=month`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Query Params**:
  - `period`: "day", "month", or "year" (optional, default "month")
- **Steps**:
  1. Provide period filter.
  2. Send request.
- **Response**: App-wide sales analytics.

#### getCustomerGrowth
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/admin/customer-growth`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: App-wide customer growth.

#### getProvinceStats
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/admin/province-stats`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: App-wide province distribution.

#### getDashboardStats
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/admin/dashboard`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: App-wide total revenue, customers, transactions, products.

#### getAllSalesTargets
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/admin/all-sales-targets`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: All sellers' sales targets with progress.

#### getBestSellers
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/admin/best-sellers?limit=10`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Query Params**:
  - `limit`: Number of products (optional, default 10)
- **Steps**:
  1. Send request.
- **Response**: Best-selling products.

### Admin Featured Products

#### getFeaturedProducts
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/admin/featured-products`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: Current featured products.

#### setFeaturedProducts
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/stats/admin/featured-products`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "products": [
      "product_id_1",
      "product_id_2",
      "product_id_3",
      "product_id_4",
      "product_id_5",
      "product_id_6",
      "product_id_7",
      "product_id_8",
      "product_id_9"
    ]
  }
  ```
- **Steps**:
  1. Provide exactly 9 product IDs.
  2. Send request.
- **Response**: Updated featured products.

### Admin Ads Management

#### getAllAds
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/admin/ads`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: All ads.

#### createAd (Structured)
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/stats/admin/ads`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "slot": "ad1", // ad1-ad5, sellerAd
    "type": "structured",
    "background": "#4CAF50",
    "headline": "Increase your sales",
    "description": "Unlock the Proven Strategies",
    "ctaText": "Learn More",
    "ctaLink": "https://example.com",
    "isActive": true
  }
  ```
- **Steps**:
  1. Provide structured ad details.
  2. Send request.
- **Response**: Created ad.

#### createAd (HTML)
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/stats/admin/ads`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "slot": "sellerAd",
    "type": "html",
    "htmlContent": "<div style='...'>Custom HTML</div>",
    "isActive": true
  }
  ```
- **Steps**:
  1. Provide HTML ad content.
  2. Send request.
- **Response**: Created ad.

#### updateAd
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/stats/admin/ads/{adId}`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "headline": "Updated Headline",
    "isActive": false
  }
  ```
- **Steps**:
  1. Provide ad ID and updates.
  2. Send request.
- **Response**: Updated ad.

#### deleteAd
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/stats/admin/ads/{adId}`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Provide ad ID.
  2. Send request.
- **Response**: Success.

### Admin Banners Management

#### getAllBanners
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/stats/admin/banners`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Send request.
- **Response**: All banners.

#### createBanner (Structured)
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/stats/admin/banners`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "slot": "banner1", // banner1-banner3
    "type": "structured",
    "image": "banner1.jpg",
    "headline": "Summer Sale",
    "description": "Up to 50% off",
    "ctaText": "Shop Now",
    "ctaLink": "/sale",
    "isActive": true
  }
  ```
- **Steps**:
  1. Provide structured banner details.
  2. Send request.
- **Response**: Created banner.

#### createBanner (HTML)
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/stats/admin/banners`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "slot": "banner2",
    "type": "html",
    "htmlContent": "<div style='...'>Custom HTML</div>",
    "isActive": true
  }
  ```
- **Steps**:
  1. Provide HTML banner content.
  2. Send request.
- **Response**: Created banner.

#### updateBanner
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/stats/admin/banners/{bannerId}`
- **Auth**: Bearer (Admin)
- **Body** (JSON):
  ```json
  {
    "headline": "Updated Banner",
    "isActive": false
  }
  ```
- **Steps**:
  1. Provide banner ID and updates.
  2. Send request.
- **Response**: Updated banner.

#### deleteBanner
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/stats/admin/banners/{bannerId}`
- **Auth**: Bearer (Admin)
- **Body**: None
- **Steps**:
  1. Provide banner ID.
  2. Send request.
- **Response**: Success.

## Customer Management

### createCustomer
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/customers`
- **Auth**: Bearer (Seller/Admin)
- **Body** (JSON):
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "customer@example.com",
    "phone": "01234567890",
    "streetAddress": "123 Main St",
    "country": "Egypt",
    "state": "Cairo",
    "notes": "VIP customer",
    "sellerId": "seller_id" // optional, admin only
  }
  ```
- **Steps**:
  1. Provide customer details.
  2. If email exists, links existing user to seller.
  3. If email doesn't exist, creates new user + links.
  4. Send request.
- **Response**: Created customer relationship.

### getAllCustomers
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/customers?page=1&limit=10`
- **Auth**: Bearer (Seller/Admin)
- **Query Params**:
  - `page`: Page number (optional)
  - `limit`: Items per page (optional)
  - `sellerId`: Filter by seller (admin only, optional)
- **Steps**:
  1. Send request.
- **Response**: Seller's customers (or all for admin).

### getSpecificCustomer
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/customers/{customerId}`
- **Auth**: Bearer (Seller/Admin)
- **Body**: None
- **Steps**:
  1. Provide customer ID.
  2. Send request.
- **Response**: Customer details.

### getCustomerDetails
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/customers/{customerId}/details`
- **Auth**: Bearer (Seller/Admin)
- **Body**: None
- **Steps**:
  1. Provide customer ID.
  2. Send request.
- **Response**: Customer with calculated stats (totalOrders, pendingCount, completedCount, abandonedCartCount, etc.).

### getCustomerTransactionHistory
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/customers/{customerId}/transactions?page=1&limit=10`
- **Auth**: Bearer (Seller/Admin)
- **Body**: None
- **Steps**:
  1. Provide customer ID.
  2. Send request.
- **Response**: Orders for this customer from this seller.

### updateCustomer
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/customers/{customerId}`
- **Auth**: Bearer (Admin only)
- **Body** (JSON):
  ```json
  {
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "09876543210",
    "streetAddress": "456 New St",
    "country": "USA",
    "state": "NY",
    "notes": "Updated notes"
  }
  ```
- **Steps**:
  1. Provide customer ID and updates.
  2. Send request.
- **Response**: Updated customer.

### deleteCustomer
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/customers/{customerId}`
- **Auth**: Bearer (Admin only)
- **Body**: None
- **Steps**:
  1. Provide customer ID.
  2. Send request.
- **Response**: Success (removes link, not the user account).

### Abandoned Carts

#### recordAbandonedCart
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/customers/{customerId}/abandoned-cart`
- **Auth**: Bearer (Seller/Admin)
- **Body** (JSON):
  ```json
  {
    "cartItems": [
      {
        "product": "product_id",
        "quantity": 2,
        "price": 100
      }
    ],
    "totalPrice": 200
  }
  ```
- **Steps**:
  1. Provide cart items and total.
  2. Send request.
- **Response**: Recorded abandoned cart.

#### getAbandonedCarts
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/customers/{customerId}/abandoned-carts`
- **Auth**: Bearer (Seller/Admin)
- **Body**: None
- **Steps**:
  1. Provide customer ID.
  2. Send request.
- **Response**: List of unrecovered abandoned carts.

#### recoverAbandonedCart
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/customers/abandoned-cart/{cartId}/recover`
- **Auth**: Bearer (Seller/Admin)
- **Body**: None
- **Steps**:
  1. Provide abandoned cart ID.
  2. Send request.
- **Response**: Marked as recovered.

## Avatar Upload

### uploadUserAvatar
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/user/avatar`
- **Auth**: Bearer (Login required)
- **Body**: Form-data with file field `avatar` (image file)
- **Steps**:
  1. Select image file for avatar field.
  2. Send request.
- **Response**: User data with updated avatar URL.

## Payment Methods

### createPaymentMethod
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/payment-methods`
- **Auth**: Bearer (Admin only)
- **Body** (JSON):
  ```json
  {
    "name": "Credit Card",
    "type": "card",
    "isActive": true,
    "processingFee": 2.5,
    "description": "Pay with credit/debit card"
  }
  ```
- **Steps**:
  1. Fill payment method details.
  2. Send request.
- **Response**: Created payment method.

### getAllPaymentMethods
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/payment-methods`
- **Auth**: None
- **Body**: None
- **Steps**: Send request.
- **Response**: List of active payment methods.

### getPaymentMethod
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/payment-methods/{methodId}`
- **Auth**: None
- **Body**: None
- **Steps**: Replace {methodId} with actual ID.
- **Response**: Payment method details.

### updatePaymentMethod
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/payment-methods/{methodId}`
- **Auth**: Bearer (Admin only)
- **Body** (JSON): Fields to update
- **Steps**:
  1. Replace {methodId} with actual ID.
  2. Send updated fields.
- **Response**: Updated payment method.

### deletePaymentMethod
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/payment-methods/{methodId}`
- **Auth**: Bearer (Admin only)
- **Body**: None
- **Steps**: Replace {methodId} with actual ID.
- **Response**: Success message.

## Social Links

### createSocialLink
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/social-links`
- **Auth**: Bearer (Admin only)
- **Body** (JSON):
  ```json
  {
    "platform": "facebook",
    "url": "https://facebook.com/yourstore",
    "icon": "fab fa-facebook",
    "isActive": true
  }
  ```
- **Steps**:
  1. Fill social link details.
  2. Send request.
- **Response**: Created social link.

### getAllSocialLinks
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/social-links`
- **Auth**: None
- **Body**: None
- **Steps**: Send request.
- **Response**: List of active social links.

### getSocialLink
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/social-links/{linkId}`
- **Auth**: None
- **Body**: None
- **Steps**: Replace {linkId} with actual ID.
- **Response**: Social link details.

### updateSocialLink
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/social-links/{linkId}`
- **Auth**: Bearer (Admin only)
- **Body** (JSON): Fields to update
- **Steps**:
  1. Replace {linkId} with actual ID.
  2. Send updated fields.
- **Response**: Updated social link.

### deleteSocialLink
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/social-links/{linkId}`
- **Auth**: Bearer (Admin only)
- **Body**: None
- **Steps**: Replace {linkId} with actual ID.
- **Response**: Success message.

## Privacy Policy

### createPrivacyPolicy
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/privacy-policy`
- **Auth**: Bearer (Admin only)
- **Body** (JSON):
  ```json
  {
    "title": "Privacy Policy",
    "content": "Your privacy policy content here...",
    "version": "1.0"
  }
  ```
- **Steps**:
  1. Fill policy details.
  2. Send request.
- **Response**: Created privacy policy.

### getCurrentPrivacyPolicy
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/privacy-policy/current`
- **Auth**: None
- **Body**: None
- **Steps**: Send request.
- **Response**: Current active privacy policy.

### getAllPrivacyPolicies
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/privacy-policy`
- **Auth**: Bearer (Admin only)
- **Body**: None
- **Steps**: Send request.
- **Response**: List of all policy versions.

### updatePrivacyPolicy
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/privacy-policy/{policyId}`
- **Auth**: Bearer (Admin only)
- **Body** (JSON): Fields to update
- **Steps**:
  1. Replace {policyId} with actual ID.
  2. Send updated fields.
- **Response**: Updated privacy policy.

### deletePrivacyPolicy
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/privacy-policy/{policyId}`
- **Auth**: Bearer (Admin only)
- **Body**: None
- **Steps**: Replace {policyId} with actual ID.
- **Response**: Success message.

## Notifications

### getMyNotifications
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/notifications/my-notifications`
- **Auth**: Bearer (Login required)
- **Body**: None
- **Steps**: Send request.
- **Response**: List of user's notifications.

### markNotificationAsRead
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/notifications/{notificationId}/read`
- **Auth**: Bearer (Login required)
- **Body**: None
- **Steps**: Replace {notificationId} with actual ID.
- **Response**: Updated notification.

### updateNotificationPreferences
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/user/notification-preferences`
- **Auth**: Bearer (Login required)
- **Body** (JSON):
  ```json
  {
    "orderUpdates": true,
    "promotions": false,
    "newsletter": true
  }
  ```
- **Steps**:
  1. Fill preference settings.
  2. Send request.
- **Response**: Updated user preferences.

### createNotification
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/notifications`
- **Auth**: Bearer (Admin only)
- **Body** (JSON):
  ```json
  {
    "recipient": "user_id",
    "type": "order_update",
    "title": "Order Shipped",
    "message": "Your order has been shipped"
  }
  ```
- **Steps**:
  1. Fill notification details.
  2. Send request.
- **Response**: Created notification.

### getAllNotifications
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/notifications`
- **Auth**: Bearer (Admin only)
- **Body**: None
- **Steps**: Send request.
- **Response**: List of all notifications.

### deleteNotification
- **Method**: DELETE
- **URL**: `{{mainHost}}/api/v1/notifications/{notificationId}`
- **Auth**: Bearer (Admin only)
- **Body**: None
- **Steps**: Replace {notificationId} with actual ID.
- **Response**: Success message.

## Delivery System

### getNearbyOrders
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/orders/nearby?lat=LATITUDE&lng=LONGITUDE&maxDistance=5000`
- **Auth**: Bearer (Delivery role required)
- **Body**: None
- **Steps**:
  1. Replace LATITUDE and LONGITUDE with coordinates.
  2. Optionally adjust maxDistance (in meters).
  3. Send request.
- **Response**: List of nearby orders for delivery.

### updateDeliveryLocation
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/user/profile`
- **Auth**: Bearer (Login required)
- **Body** (JSON):
  ```json
  {
    "location": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    }
  }
  ```
- **Steps**:
  1. Fill coordinates array with [longitude, latitude].
  2. Send request.
- **Response**: Updated user profile.

## Seller Application System

### checkEligibility
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/seller-applications/eligibility`
- **Auth**: Bearer (Login required)
- **Body**: None
- **Steps**: Send request.
- **Response**: Eligibility status and existing applications.

### submitApplication
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/seller-applications/apply`
- **Auth**: Bearer (Login required)
- **Body** (JSON):
  ```json
  {
    "businessName": "My Store",
    "businessType": "individual",
    "businessAddress": "123 Business St",
    "businessPhone": "+1234567890",
    "taxId": "123-45-6789",
    "bankAccountNumber": "1234567890",
    "bankAccountName": "John Doe",
    "bankName": "Example Bank",
    "businessDescription": "Selling quality products..."
  }
  ```
- **Steps**:
  1. Fill all business details.
  2. Send request.
- **Response**: Submitted application.

### checkApplicationStatus
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/seller-applications/my-status`
- **Auth**: Bearer (Login required)
- **Body**: None
- **Steps**: Send request.
- **Response**: Current application status.

### getAllApplications
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/seller-applications/admin/applications?page=1&limit=10&status=pending`
- **Auth**: Bearer (Admin only)
- **Body**: None
- **Steps**:
  1. Optional: Add query params for pagination and filtering.
  2. Send request.
- **Response**: List of seller applications.

### getSpecificApplication
- **Method**: GET
- **URL**: `{{mainHost}}/api/v1/seller-applications/admin/applications/{applicationId}`
- **Auth**: Bearer (Admin only)
- **Body**: None
- **Steps**: Replace {applicationId} with actual ID.
- **Response**: Application details.

### approveApplication
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/seller-applications/admin/approve/{applicationId}`
- **Auth**: Bearer (Admin only)
- **Body** (JSON):
  ```json
  {
    "reviewNotes": "Application approved. Welcome to our platform!"
  }
  ```
- **Steps**:
  1. Replace {applicationId} with actual ID.
  2. Add review notes.
  3. Send request.
- **Response**: Approved application (creates seller profile automatically).

### declineApplication
- **Method**: PUT
- **URL**: `{{mainHost}}/api/v1/seller-applications/admin/decline/{applicationId}`
- **Auth**: Bearer (Admin only)
- **Body** (JSON):
  ```json
  {
    "reviewNotes": "Missing tax documentation. Please resubmit."
  }
  ```
- **Steps**:
  1. Replace {applicationId} with actual ID.
  2. Add review notes.
  3. Send request.
- **Response**: Declined application.

### uploadSellerProfileImage
- **Method**: POST
- **URL**: `{{mainHost}}/api/v1/seller/profile-image`
- **Auth**: Bearer (Seller role required)
- **Body**: Form-data with file field `image` (image file)
- **Steps**:
  1. Select image file for image field.
  2. Send request.
- **Response**: Seller data with updated profile image URL.

## Notes
- **Ordering Process**: Authenticate > Add to cart > Get cart ID > Create order.
- **Seller Operations**: Sellers can manage their products and view orders.
- **Admin Operations**: Full CRUD on users, categories, products, etc.
- **Affiliate/Seller Checks**: Use getAllOrders or seller-specific endpoints.
- **Data Requirements**: IDs are MongoDB ObjectIds. Obtain from GET requests. Fields marked as (optional) are not required. Slug fields are auto-generated from name/title using slugify. Check model files for exact schema.
- **Errors**: Check response for validation errors or permissions.
- **Stats System**: Province stats use the `city` field from user addresses. Sales targets automatically deactivate previous targets when setting new ones. Featured products require exactly 9 product IDs. Ads have 6 slots (ad1-ad5, sellerAd). Banners have 3 slots (banner1-banner3).