# Seller Endpoints Documentation

> **Authentication:** All endpoints require a Bearer token in the `Authorization` header.
> **Header:** `Authorization: Bearer <token>`

---

## Table of Contents

### Account & Profile (`/api/v1/sellers`)
1. [Create Seller Profile](#1-create-seller-profile)
2. [Get Seller Profile](#2-get-seller-profile)
3. [Update Seller Profile](#3-update-seller-profile)
4. [Upload Profile Image](#4-upload-profile-image)
5. [Remove Profile Image](#5-remove-profile-image)
6. [Update Contact Details](#6-update-contact-details)
7. [Change Password](#7-change-password)
8. [Deactivate Account](#8-deactivate-account)

### Dashboard & Stats (`/api/v1/stats`)
9. [Get Dashboard Stats](#9-get-dashboard-stats)
10. [Get Sales Analytics](#10-get-sales-analytics)
11. [Get Popular Products](#11-get-popular-products)
12. [Get Customer Growth](#12-get-customer-growth)
13. [Get Province Stats](#13-get-province-stats)
14. [Get Sales Target](#14-get-sales-target)
15. [Set Sales Target](#15-set-sales-target)
16. [Get Seller Ad](#16-get-seller-ad)

### Orders (`/api/v1/orders`)
17. [Get All Seller Orders](#17-get-all-seller-orders)
18. [Get Order Details](#18-get-order-details)
19. [Update Order Status](#19-update-order-status)
20. [Delete Order](#20-delete-order)
21. [Create Cash Order](#21-create-cash-order)

### Products (`/api/v1/products`)
22. [Get My Products](#22-get-my-products)
23. [Create Product](#23-create-product)
24. [Get Single Product](#24-get-single-product)
25. [Update Product](#25-update-product)
26. [Delete Product](#26-delete-product)
27. [Upload Product Images](#27-upload-product-images)
28. [Bulk Import Products](#28-bulk-import-products)

### Product Variations (`/api/v1/products/:productId/variations`)
29. [Add Variation](#29-add-variation)
30. [Bulk Add Variations](#30-bulk-add-variations)
31. [Generate Combinations](#31-generate-combinations)
32. [Update Variation](#32-update-variation)
33. [Delete Variation](#33-delete-variation)
34. [Adjust Variation Stock](#34-adjust-variation-stock)
35. [Get Low Stock Variations](#35-get-low-stock-variations)

### Inventory (`/api/v1/inventory`)
36. [Get Inventory Dashboard](#36-get-inventory-dashboard)
37. [Get Low Stock Alerts](#37-get-low-stock-alerts)
38. [Adjust Product Stock](#38-adjust-product-stock)
39. [Set Low Stock Threshold](#39-set-low-stock-threshold)
40. [Get Stock History](#40-get-stock-history)
41. [Update Product Price](#41-update-product-price)
42. [Get Price History](#42-get-price-history)
43. [Reserve Stock](#43-reserve-stock)
44. [Release Reserved Stock](#44-release-reserved-stock)

### Customers (`/api/v1/customers`)
45. [Get All Customers](#45-get-all-customers)
46. [Create Customer](#46-create-customer)
47. [Get Customer](#47-get-customer)
48. [Get Customer Details & Stats](#48-get-customer-details--stats)
49. [Get Customer Transactions](#49-get-customer-transactions)
50. [Get Customer Abandoned Carts](#50-get-customer-abandoned-carts)
51. [Record Abandoned Cart](#51-record-abandoned-cart)
52. [Recover Abandoned Cart](#52-recover-abandoned-cart)

### Cart (`/api/v1/cart`)
53. [Get Cart](#53-get-cart)
54. [Add to Cart](#54-add-to-cart)
55. [Update Cart Item Quantity](#55-update-cart-item-quantity)
56. [Update Cart Item Variation](#56-update-cart-item-variation)
57. [Remove Cart Item](#57-remove-cart-item)
58. [Clear Cart](#58-clear-cart)
59. [Apply Coupon](#59-apply-coupon)

### Wishlist (`/api/v1/wishlists`)
60. [Get Wishlist](#60-get-wishlist)
61. [Add to Wishlist](#61-add-to-wishlist)
62. [Remove from Wishlist](#62-remove-from-wishlist)

### Notifications (`/api/v1/notifications`)
63. [Get My Notifications](#63-get-my-notifications)
64. [Mark Notification as Read](#64-mark-notification-as-read)
65. [Mark All as Read](#65-mark-all-as-read)
66. [Delete Notification](#66-delete-notification)
67. [Get Notification Preferences](#67-get-notification-preferences)
68. [Update Notification Preferences](#68-update-notification-preferences)

---

## Account & Profile

---

## 1. Create Seller Profile

**POST** `/api/v1/sellers/create-profile`

Creates the seller profile. Called automatically when admin approves a seller application — but can also be called manually if needed.

### Request Body (`application/json`)

| Field         | Type     | Required    | Constraints                                    |
|---------------|----------|-------------|------------------------------------------------|
| `firstName`   | `string` | ✅ Yes      | Min: 2 chars, Max: 30 chars                    |
| `lastName`    | `string` | ✅ Yes      | Min: 2 chars, Max: 30 chars                    |
| `email`       | `string` | ✅ Yes      | Valid email format                             |
| `phone`       | `string` | ✅ Yes      | Valid EG / SA / US phone number                |
| `country`     | `string` | ✅ Yes      | Min: 2 chars                                   |
| `address`     | `string` | ✅ Yes      | Min: 3 chars                                   |
| `gender`      | `string` | ⬜ Optional | `"male"` \| `"female"` \| `"other"`            |
| `dateOfBirth` | `string` | ⬜ Optional | ISO 8601 (e.g. `"1995-06-15"`)                 |

### Example Request

```json
{
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "email": "ahmed@example.com",
  "phone": "01012345678",
  "country": "Egypt",
  "address": "123 Main Street, Cairo",
  "gender": "male",
  "dateOfBirth": "1995-06-15"
}
```

### Response `201 Created`

```json
{
  "message": "Seller profile created successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "country": "Egypt",
    "address": "123 Main Street, Cairo",
    "gender": "male",
    "dateOfBirth": "1995-06-15T00:00:00.000Z",
    "profileImage": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 2. Get Seller Profile

**GET** `/api/v1/sellers/profile`

Returns the authenticated seller's full profile.

### Response `200 OK`

```json
{
  "data": {
    "_id": "...",
    "userId": "...",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "country": "Egypt",
    "address": "123 Main Street, Cairo",
    "gender": "male",
    "dateOfBirth": "1995-06-15T00:00:00.000Z",
    "profileImage": "https://res.cloudinary.com/...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 3. Update Seller Profile

**PUT** `/api/v1/sellers/profile`

Updates personal profile fields. All fields are optional.

### Request Body (`application/json`)

| Field          | Type     | Required    | Constraints                                  |
|----------------|----------|-------------|----------------------------------------------|
| `firstName`    | `string` | ⬜ Optional | Min: 2 chars, Max: 30 chars                  |
| `lastName`     | `string` | ⬜ Optional | Min: 2 chars, Max: 30 chars                  |
| `gender`       | `string` | ⬜ Optional | `"male"` \| `"female"` \| `"other"`          |
| `dateOfBirth`  | `string` | ⬜ Optional | ISO 8601 (e.g. `"1995-06-15"`)               |
| `profileImage` | `string` | ⬜ Optional | URL string (use upload endpoint for files)   |

### Example Request

```json
{
  "firstName": "Mohamed",
  "gender": "male"
}
```

### Response `200 OK`

```json
{
  "data": { "_id": "...", "firstName": "Mohamed", ... }
}
```

---

## 4. Upload Profile Image

**POST** `/api/v1/sellers/profile-image/upload`

Uploads a profile image (multipart). Resized to 400×400px. Old image is deleted automatically.

### Request Body (`multipart/form-data`)

| Field          | Type   | Required | Description           |
|----------------|--------|----------|-----------------------|
| `profileImage` | `file` | ✅ Yes   | Image file to upload  |

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Profile image uploaded successfully",
  "data": {
    "profileImage": "https://res.cloudinary.com/...",
    "seller": { ... }
  }
}
```

---

## 5. Remove Profile Image

**DELETE** `/api/v1/sellers/profile-image/remove`

Deletes the seller's current profile image from Cloudinary and clears it from the database.

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Profile image removed successfully",
  "data": { "_id": "...", "profileImage": null, ... }
}
```

---

## 6. Update Contact Details

**PUT** `/api/v1/sellers/contact-details`

Updates contact fields only. All fields are optional.

### Request Body (`application/json`)

| Field     | Type     | Required    | Constraints                          |
|-----------|----------|-------------|--------------------------------------|
| `phone`   | `string` | ⬜ Optional | Valid EG / SA / US phone number      |
| `country` | `string` | ⬜ Optional | Min: 2 chars                         |
| `address` | `string` | ⬜ Optional | Min: 3 chars                         |

### Example Request

```json
{
  "phone": "01098765432",
  "country": "Saudi Arabia",
  "address": "456 King Road, Riyadh"
}
```

### Response `200 OK`

```json
{
  "data": { "_id": "...", "phone": "01098765432", ... }
}
```

---

## 7. Change Password

**PUT** `/api/v1/sellers/password`

Changes account password. Returns a **new JWT token** — old token is immediately invalidated.

### Request Body (`application/json`)

| Field                | Type     | Required | Constraints                       |
|----------------------|----------|----------|-----------------------------------|
| `currentPassword`    | `string` | ✅ Yes   | Must match the existing password  |
| `newPassword`        | `string` | ✅ Yes   | Min: 6 characters                 |
| `newPasswordConfirm` | `string` | ✅ Yes   | Must match `newPassword`          |

### Example Request

```json
{
  "currentPassword": "oldPass123",
  "newPassword": "newSecurePass456",
  "newPasswordConfirm": "newSecurePass456"
}
```

### Response `200 OK`

```json
{
  "message": "Password updated successfully",
  "token": "<new_jwt_token>"
}
```

---

## 8. Deactivate Account

**DELETE** `/api/v1/sellers/deactivate`

Sets `active: false` on the account. Not a permanent deletion.

### Response `200 OK`

```json
{
  "message": "Account deactivated successfully"
}
```

---

## Dashboard & Stats

---

## 9. Get Dashboard Stats

**GET** `/api/v1/stats/seller/dashboard`

Returns an overview of the seller's dashboard (total sales, orders, revenue, etc.).

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 10. Get Sales Analytics

**GET** `/api/v1/stats/seller/sales-analytics`

Returns sales over time (revenue, order count by period).

### Query Parameters

| Param    | Type     | Required    | Description                        |
|----------|----------|-------------|------------------------------------|
| `period` | `string` | ⬜ Optional | `"week"` \| `"month"` \| `"year"`  |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 11. Get Popular Products

**GET** `/api/v1/stats/seller/popular-products`

Returns the seller's best-performing products by sales.

### Response `200 OK`

```json
{
  "status": "success",
  "data": [ ... ]
}
```

---

## 12. Get Customer Growth

**GET** `/api/v1/stats/seller/customer-growth`

Returns customer acquisition data over time.

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 13. Get Province Stats

**GET** `/api/v1/stats/seller/province-stats`

Returns order and customer data grouped by province/city.

### Response `200 OK`

```json
{
  "status": "success",
  "data": [ ... ]
}
```

---

## 14. Get Sales Target

**GET** `/api/v1/stats/seller/sales-target`

Returns the seller's current sales target and progress.

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "target": 50000,
    "achieved": 31200,
    "percentage": 62.4
  }
}
```

---

## 15. Set Sales Target

**POST** `/api/v1/stats/seller/sales-target`

Sets or updates the seller's sales target.

### Request Body (`application/json`)

| Field    | Type     | Required | Description                       |
|----------|----------|----------|-----------------------------------|
| `target` | `number` | ✅ Yes   | Target revenue amount             |
| `period` | `string` | ⬜ Optional | Target period (e.g. `"monthly"`) |

### Example Request

```json
{
  "target": 50000,
  "period": "monthly"
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 16. Get Seller Ad

**GET** `/api/v1/stats/seller/ad`

Returns the ad associated with the seller's account.

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## Orders

---

## 17. Get All Seller Orders

**GET** `/api/v1/orders/seller`

Returns all orders that contain products belonging to this seller.

### Query Parameters (optional filters)

| Param    | Type     | Description                  |
|----------|----------|------------------------------|
| `page`   | `number` | Page number (default: 1)     |
| `limit`  | `number` | Items per page (default: 10) |
| `status` | `string` | Filter by order status       |

### Response `200 OK`

```json
{
  "status": "success",
  "results": 12,
  "data": [ ... ]
}
```

---

## 18. Get Order Details

**GET** `/api/v1/orders/seller/:id`

Returns full details of a single order by ID.

### URL Parameter

| Param | Type       | Required | Description |
|-------|------------|----------|-------------|
| `id`  | `ObjectId` | ✅ Yes   | Order ID    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 19. Update Order Status

**PUT** `/api/v1/orders/seller/:id`

Updates the status or payment info of an order.

### URL Parameter

| Param | Type       | Required | Description |
|-------|------------|----------|-------------|
| `id`  | `ObjectId` | ✅ Yes   | Order ID    |

### Request Body (`application/json`)

| Field           | Type      | Required    | Constraints                                                       |
|-----------------|-----------|-------------|-------------------------------------------------------------------|
| `status`        | `string`  | ⬜ Optional | `"pending"` \| `"Approved"` \| `"shipping"` \| `"completed"` \| `"delivered"` \| `"cancelled"` |
| `isPaid`        | `boolean` | ⬜ Optional | `true` or `false`                                                 |
| `paymentMethod` | `string`  | ⬜ Optional | `"cash on delivery"` \| `"online payment"` \| `"Paymob"`         |

### Example Request

```json
{
  "status": "shipping"
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 20. Delete Order

**DELETE** `/api/v1/orders/seller/:id`

Deletes an order belonging to this seller.

### URL Parameter

| Param | Type       | Required | Description |
|-------|------------|----------|-------------|
| `id`  | `ObjectId` | ✅ Yes   | Order ID    |

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Order deleted successfully"
}
```

---

## 21. Create Cash Order

**POST** `/api/v1/orders/:id`

Creates a cash-on-delivery order from a cart.

### URL Parameter

| Param | Type       | Required | Description |
|-------|------------|----------|-------------|
| `id`  | `ObjectId` | ✅ Yes   | Cart ID     |

### Response `201 Created`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## Products

---

## 22. Get My Products

**GET** `/api/v1/products/seller`

Returns all products belonging to the authenticated seller.

### Query Parameters (optional)

| Param    | Type     | Description                  |
|----------|----------|------------------------------|
| `page`   | `number` | Page number                  |
| `limit`  | `number` | Items per page               |
| `keyword`| `string` | Search by product title      |

### Response `200 OK`

```json
{
  "status": "success",
  "results": 5,
  "data": [ ... ]
}
```

---

## 23. Create Product

**POST** `/api/v1/products/seller`

Creates a new product for the seller. Accepts `multipart/form-data` to allow image upload at creation time.

### Request Body (`multipart/form-data`)

| Field                | Type       | Required    | Constraints                                    |
|----------------------|------------|-------------|------------------------------------------------|
| `title`              | `string`   | ✅ Yes      | Min: 3 chars                                   |
| `description`        | `string`   | ✅ Yes      | Max: 2000 chars                                |
| `quantity`           | `number`   | ✅ Yes      | Must be numeric                                |
| `price`              | `number`   | ✅ Yes      | Rounded up to nearest 5                        |
| `sku`                | `string`   | ✅ Yes      | Unique, letters/numbers/dash/underscore only   |
| `category`           | `ObjectId` | ✅ Yes      | Valid category ID                              |
| `priceAfterDiscount` | `number`   | ⬜ Optional | Must be less than `price`                      |
| `colors`             | `array`    | ⬜ Optional | Array of color strings                         |
| `sizes`              | `array`    | ⬜ Optional | Array of size strings                          |
| `images`             | `file[]`   | ⬜ Optional | Product image files                            |

### Example Request (JSON portion)

```json
{
  "title": "Classic T-Shirt",
  "description": "High quality cotton t-shirt.",
  "quantity": 100,
  "price": 250,
  "sku": "TSHIRT-BLK-001",
  "category": "64abc123...",
  "priceAfterDiscount": 200,
  "colors": ["Black", "White"],
  "sizes": ["S", "M", "L", "XL"]
}
```

### Response `201 Created`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 24. Get Single Product

**GET** `/api/v1/products/seller/:id`

Returns full details of one of the seller's products.

### URL Parameter

| Param | Type       | Required | Description |
|-------|------------|----------|-------------|
| `id`  | `ObjectId` | ✅ Yes   | Product ID  |

### Response `200 OK`

```json
{
  "data": { ... }
}
```

---

## 25. Update Product

**PUT** `/api/v1/products/seller/:id`

Updates a product. All fields are optional.

### URL Parameter

| Param | Type       | Required | Description |
|-------|------------|----------|-------------|
| `id`  | `ObjectId` | ✅ Yes   | Product ID  |

### Request Body (`application/json`)

| Field                | Type       | Required    | Constraints                        |
|----------------------|------------|-------------|------------------------------------|
| `title`              | `string`   | ⬜ Optional | Min: 3 chars                       |
| `description`        | `string`   | ⬜ Optional | Max: 2000 chars                    |
| `quantity`           | `number`   | ⬜ Optional | Numeric                            |
| `price`              | `number`   | ⬜ Optional | Rounded up to nearest 5            |
| `priceAfterDiscount` | `number`   | ⬜ Optional | Must be less than `price`          |
| `colors`             | `array`    | ⬜ Optional | Array of color strings             |
| `sizes`              | `array`    | ⬜ Optional | Array of size strings              |
| `category`           | `ObjectId` | ⬜ Optional | Valid category ID                  |

### Response `200 OK`

```json
{
  "data": { ... }
}
```

---

## 26. Delete Product

**DELETE** `/api/v1/products/seller/:id`

Permanently deletes one of the seller's products.

### URL Parameter

| Param | Type       | Required | Description |
|-------|------------|----------|-------------|
| `id`  | `ObjectId` | ✅ Yes   | Product ID  |

### Response `204 No Content`

---

## 27. Upload Product Images

**POST** `/api/v1/products/seller/:id/upload-images`

Uploads images for an existing product.

### URL Parameter

| Param | Type       | Required | Description |
|-------|------------|----------|-------------|
| `id`  | `ObjectId` | ✅ Yes   | Product ID  |

### Request Body (`multipart/form-data`)

| Field    | Type     | Required | Description                    |
|----------|----------|----------|--------------------------------|
| `images` | `file[]` | ✅ Yes   | One or more product image files |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 28. Bulk Import Products

**POST** `/api/v1/products/seller/bulk-import`

Imports multiple products at once via a JSON array.

### Request Body (`application/json`)

Array of product objects, each following the same rules as [Create Product](#23-create-product).

```json
[
  {
    "title": "Product A",
    "description": "...",
    "quantity": 50,
    "price": 100,
    "sku": "PROD-A-001",
    "category": "64abc..."
  },
  { ... }
]
```

### Response `201 Created`

```json
{
  "status": "success",
  "data": [ ... ]
}
```

---

## Product Variations

---

## 29. Add Variation

**POST** `/api/v1/products/:productId/variations`

Adds a single variation to a product (e.g., Color: Red, Size: M).

### URL Parameter

| Param       | Type       | Required | Description |
|-------------|------------|----------|-------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID  |

### Request Body (`application/json`)

| Field                | Type     | Required | Constraints                                                           |
|----------------------|----------|----------|-----------------------------------------------------------------------|
| `options`            | `object` | ✅ Yes   | Key-value pairs e.g. `{ "Color": "Red", "Size": "M" }`              |
| `sku`                | `string` | ⬜ Optional | 3–50 chars                                                         |
| `price`              | `number` | ⬜ Optional | Non-negative number                                                 |
| `discountPercentage` | `number` | ⬜ Optional | 0–100                                                               |
| `quantity`           | `number` | ⬜ Optional | Non-negative integer                                                |
| `lowStockThreshold`  | `number` | ⬜ Optional | Non-negative integer                                                |
| `image`              | `string` | ⬜ Optional | Image URL string                                                    |

### Example Request

```json
{
  "options": { "Color": "Red", "Size": "M" },
  "sku": "TSHIRT-RED-M",
  "price": 250,
  "quantity": 30,
  "lowStockThreshold": 5
}
```

### Response `201 Created`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 30. Bulk Add Variations

**POST** `/api/v1/products/:productId/variations/bulk`

Generates all color × size combinations as variations.

### URL Parameter

| Param       | Type       | Required | Description |
|-------------|------------|----------|-------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID  |

### Request Body (`application/json`)

| Field                     | Type       | Required | Constraints                      |
|---------------------------|------------|----------|----------------------------------|
| `colors`                  | `string[]` | ✅ Yes   | Non-empty array, each 2–30 chars |
| `sizes`                   | `string[]` | ✅ Yes   | Non-empty array, each 1–20 chars |
| `defaultPrice`            | `number`   | ⬜ Optional | Non-negative                  |
| `defaultQuantity`         | `number`   | ⬜ Optional | Non-negative integer          |
| `defaultLowStockThreshold`| `number`   | ⬜ Optional | Non-negative integer          |

### Example Request

```json
{
  "colors": ["Red", "Blue"],
  "sizes": ["S", "M", "L"],
  "defaultPrice": 250,
  "defaultQuantity": 20
}
```

### Response `201 Created`

```json
{
  "status": "success",
  "data": [ ... ]
}
```

---

## 31. Generate Combinations

**POST** `/api/v1/products/:productId/variations/generate-combinations`

Generates all possible combinations from provided axes (e.g., Color + Size + Material).

### URL Parameter

| Param       | Type       | Required | Description |
|-------------|------------|----------|-------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID  |

### Request Body (`application/json`)

| Field  | Type     | Required | Description                                              |
|--------|----------|----------|----------------------------------------------------------|
| `axes` | `object` | ✅ Yes   | Key: axis name, Value: array of options e.g. `{ "Color": ["Red","Blue"], "Size": ["S","M"] }` |

### Example Request

```json
{
  "axes": {
    "Color": ["Red", "Blue", "Black"],
    "Size": ["S", "M", "L"]
  }
}
```

### Response `201 Created`

```json
{
  "status": "success",
  "data": [ ... ]
}
```

---

## 32. Update Variation

**PUT** `/api/v1/products/:productId/variations/:variationId`

Updates an existing variation's price, quantity, or other fields.

### URL Parameters

| Param         | Type       | Required | Description    |
|---------------|------------|----------|----------------|
| `productId`   | `ObjectId` | ✅ Yes   | Product ID     |
| `variationId` | `ObjectId` | ✅ Yes   | Variation ID   |

### Request Body (`application/json`)

| Field                | Type      | Required    | Constraints              |
|----------------------|-----------|-------------|--------------------------|
| `price`              | `number`  | ⬜ Optional | Non-negative             |
| `discountPercentage` | `number`  | ⬜ Optional | 0–100                    |
| `quantity`           | `number`  | ⬜ Optional | Non-negative integer     |
| `lowStockThreshold`  | `number`  | ⬜ Optional | Non-negative integer     |
| `image`              | `string`  | ⬜ Optional | Image URL string         |
| `isActive`           | `boolean` | ⬜ Optional | `true` or `false`        |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 33. Delete Variation

**DELETE** `/api/v1/products/:productId/variations/:variationId`

Deletes a specific variation from a product.

### URL Parameters

| Param         | Type       | Required | Description  |
|---------------|------------|----------|--------------|
| `productId`   | `ObjectId` | ✅ Yes   | Product ID   |
| `variationId` | `ObjectId` | ✅ Yes   | Variation ID |

### Response `204 No Content`

---

## 34. Adjust Variation Stock

**PUT** `/api/v1/products/:productId/variations/:variationId/adjust-stock`

Manually adjusts the stock count for a specific variation.

### URL Parameters

| Param         | Type       | Required | Description  |
|---------------|------------|----------|--------------|
| `productId`   | `ObjectId` | ✅ Yes   | Product ID   |
| `variationId` | `ObjectId` | ✅ Yes   | Variation ID |

### Request Body (`application/json`)

| Field      | Type     | Required    | Constraints                                                                          |
|------------|----------|-------------|--------------------------------------------------------------------------------------|
| `quantity` | `number` | ✅ Yes      | Non-negative integer                                                                 |
| `type`     | `string` | ⬜ Optional | `"purchase"` \| `"sale"` \| `"return"` \| `"adjustment"` \| `"reserved"` \| `"released"` |
| `notes`    | `string` | ⬜ Optional | Max: 500 chars                                                                       |

### Example Request

```json
{
  "quantity": 50,
  "type": "purchase",
  "notes": "New stock arrived"
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 35. Get Low Stock Variations

**GET** `/api/v1/products/variations/low-stock`

Returns all variations that are at or below their low stock threshold.

### Response `200 OK`

```json
{
  "status": "success",
  "results": 3,
  "data": [ ... ]
}
```

---

## Inventory

---

## 36. Get Inventory Dashboard

**GET** `/api/v1/inventory/dashboard/overview`

Returns a full inventory overview: total products, total stock, low stock count, out-of-stock count.

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 37. Get Low Stock Alerts

**GET** `/api/v1/inventory/alerts/low-stock`

Returns all products that have fallen at or below their low stock threshold.

### Response `200 OK`

```json
{
  "status": "success",
  "results": 4,
  "data": [ ... ]
}
```

---

## 38. Adjust Product Stock

**POST** `/api/v1/inventory/:productId/adjust-stock`

Adds or subtracts stock quantity from a product.

### URL Parameter

| Param       | Type       | Required | Description |
|-------------|------------|----------|-------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID  |

### Request Body (`application/json`)

| Field      | Type     | Required | Constraints                    |
|------------|----------|----------|--------------------------------|
| `quantity` | `number` | ✅ Yes   | Positive integer (min: 1)      |
| `type`     | `string` | ✅ Yes   | `"add"` \| `"subtract"`        |
| `reason`   | `string` | ⬜ Optional | Reason for adjustment       |

### Example Request

```json
{
  "quantity": 20,
  "type": "add",
  "reason": "Restocked from supplier"
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 39. Set Low Stock Threshold

**PUT** `/api/v1/inventory/:productId/low-stock-threshold`

Sets the quantity at which a product is considered low stock.

### URL Parameter

| Param       | Type       | Required | Description |
|-------------|------------|----------|-------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID  |

### Request Body (`application/json`)

| Field       | Type     | Required | Constraints           |
|-------------|----------|----------|-----------------------|
| `threshold` | `number` | ✅ Yes   | Non-negative integer  |

### Example Request

```json
{
  "threshold": 10
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 40. Get Stock History

**GET** `/api/v1/inventory/:productId/stock-history`

Returns a log of all stock changes for a product.

### URL Parameter

| Param       | Type       | Required | Description |
|-------------|------------|----------|-------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID  |

### Response `200 OK`

```json
{
  "status": "success",
  "data": [ ... ]
}
```

---

## 41. Update Product Price

**PUT** `/api/v1/inventory/:productId/price`

Updates the price of a product and logs the change in price history.

### URL Parameter

| Param       | Type       | Required | Description |
|-------------|------------|----------|-------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID  |

### Request Body (`application/json`)

| Field                | Type     | Required    | Constraints              |
|----------------------|----------|-------------|--------------------------|
| `price`              | `number` | ✅ Yes      | Non-negative number      |
| `discountPercentage` | `number` | ⬜ Optional | 0–100                    |
| `reason`             | `string` | ⬜ Optional | Reason for price change  |

### Example Request

```json
{
  "price": 299,
  "discountPercentage": 10,
  "reason": "Seasonal sale"
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 42. Get Price History

**GET** `/api/v1/inventory/:productId/price-history`

Returns a log of all past price changes for a product.

### URL Parameter

| Param       | Type       | Required | Description |
|-------------|------------|----------|-------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID  |

### Response `200 OK`

```json
{
  "status": "success",
  "data": [ ... ]
}
```

---

## 43. Reserve Stock

**POST** `/api/v1/inventory/:productId/reserve`

Reserves a quantity of stock (e.g., when an order is placed).

### URL Parameter

| Param       | Type       | Required | Description |
|-------------|------------|----------|-------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID  |

### Request Body (`application/json`)

| Field      | Type     | Required | Constraints           |
|------------|----------|----------|-----------------------|
| `quantity` | `number` | ✅ Yes   | Positive integer (min: 1) |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 44. Release Reserved Stock

**POST** `/api/v1/inventory/:productId/release`

Releases previously reserved stock (e.g., when an order is cancelled).

### URL Parameter

| Param       | Type       | Required | Description |
|-------------|------------|----------|-------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID  |

### Request Body (`application/json`)

| Field      | Type     | Required | Constraints               |
|------------|----------|----------|---------------------------|
| `quantity` | `number` | ✅ Yes   | Positive integer (min: 1) |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## Customers

---

## 45. Get All Customers

**GET** `/api/v1/customers`

Returns all customers linked to the seller. Admin sees all customers; seller sees only their own.

### Query Parameters (optional)

| Param    | Type     | Description        |
|----------|----------|--------------------|
| `page`   | `number` | Page number        |
| `limit`  | `number` | Items per page     |

### Response `200 OK`

```json
{
  "status": "success",
  "results": 20,
  "data": [ ... ]
}
```

---

## 46. Create Customer

**POST** `/api/v1/customers`

Manually creates a customer and links them to the seller.

### Request Body (`application/json`)

| Field           | Type     | Required    | Constraints                           |
|-----------------|----------|-------------|---------------------------------------|
| `firstName`     | `string` | ✅ Yes      | Min: 2 chars, Max: 30 chars           |
| `lastName`      | `string` | ✅ Yes      | Min: 2 chars, Max: 30 chars           |
| `email`         | `string` | ✅ Yes      | Valid email format                    |
| `phone`         | `string` | ⬜ Optional | Valid EG / SA / US phone number       |
| `streetAddress` | `string` | ⬜ Optional | Min: 3 chars                          |
| `country`       | `string` | ⬜ Optional | Min: 2 chars                          |
| `state`         | `string` | ⬜ Optional | Min: 2 chars                          |
| `notes`         | `string` | ⬜ Optional | Free text                             |
| `sellerId`      | `ObjectId`| ⬜ Optional | Links to specific seller              |

### Example Request

```json
{
  "firstName": "Sara",
  "lastName": "Ahmed",
  "email": "sara@example.com",
  "phone": "01012345678"
}
```

### Response `201 Created`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 47. Get Customer

**GET** `/api/v1/customers/:id`

Returns basic info for a specific customer.

### URL Parameter

| Param | Type       | Required | Description  |
|-------|------------|----------|--------------|
| `id`  | `ObjectId` | ✅ Yes   | Customer ID  |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 48. Get Customer Details & Stats

**GET** `/api/v1/customers/:id/details`

Returns full customer profile including order history, total spent, and other stats.

### URL Parameter

| Param | Type       | Required | Description  |
|-------|------------|----------|--------------|
| `id`  | `ObjectId` | ✅ Yes   | Customer ID  |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 49. Get Customer Transactions

**GET** `/api/v1/customers/:id/transactions`

Returns the full transaction (order) history for a customer.

### URL Parameter

| Param | Type       | Required | Description  |
|-------|------------|----------|--------------|
| `id`  | `ObjectId` | ✅ Yes   | Customer ID  |

### Response `200 OK`

```json
{
  "status": "success",
  "data": [ ... ]
}
```

---

## 50. Get Customer Abandoned Carts

**GET** `/api/v1/customers/:id/abandoned-carts`

Returns all recorded abandoned carts for a customer.

### URL Parameter

| Param | Type       | Required | Description  |
|-------|------------|----------|--------------|
| `id`  | `ObjectId` | ✅ Yes   | Customer ID  |

### Response `200 OK`

```json
{
  "status": "success",
  "data": [ ... ]
}
```

---

## 51. Record Abandoned Cart

**POST** `/api/v1/customers/:id/abandoned-cart`

Logs an abandoned cart for a customer.

### URL Parameter

| Param | Type       | Required | Description  |
|-------|------------|----------|--------------|
| `id`  | `ObjectId` | ✅ Yes   | Customer ID  |

### Request Body (`application/json`)

| Field    | Type      | Required | Description               |
|----------|-----------|----------|---------------------------|
| `cartId` | `ObjectId`| ✅ Yes   | The abandoned cart ID     |

### Response `201 Created`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 52. Recover Abandoned Cart

**PUT** `/api/v1/customers/abandoned-cart/:cartId/recover`

Marks an abandoned cart as recovered (e.g., after sending a recovery email).

### URL Parameter

| Param    | Type       | Required | Description         |
|----------|------------|----------|---------------------|
| `cartId` | `ObjectId` | ✅ Yes   | Abandoned cart ID   |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## Cart

---

## 53. Get Cart

**GET** `/api/v1/cart`

Returns all items currently in the seller's cart.

### Response `200 OK`

```json
{
  "status": "success",
  "numOfCartItems": 2,
  "data": { ... }
}
```

---

## 54. Add to Cart

**POST** `/api/v1/cart`

Adds a product to the cart.

### Request Body (`application/json`)

| Field       | Type       | Required    | Description                    |
|-------------|------------|-------------|--------------------------------|
| `productId` | `ObjectId` | ✅ Yes      | Product to add                 |
| `variationId`| `ObjectId`| ⬜ Optional | Specific variation to add      |
| `quantity`  | `number`   | ⬜ Optional | Quantity (default: 1)          |

### Example Request

```json
{
  "productId": "64abc...",
  "quantity": 2
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "numOfCartItems": 3,
  "data": { ... }
}
```

---

## 55. Update Cart Item Quantity

**PUT** `/api/v1/cart/:id`

Updates the quantity of a specific cart item.

### URL Parameter

| Param | Type       | Required | Description        |
|-------|------------|----------|--------------------|
| `id`  | `ObjectId` | ✅ Yes   | Cart item ID       |

### Request Body (`application/json`)

| Field      | Type     | Required | Description     |
|------------|----------|----------|-----------------|
| `quantity` | `number` | ✅ Yes   | New quantity    |

### Response `200 OK`

```json
{
  "status": "success",
  "numOfCartItems": 3,
  "data": { ... }
}
```

---

## 56. Update Cart Item Variation

**PUT** `/api/v1/cart/:id/variation`

Changes the selected variation of a cart item.

### URL Parameter

| Param | Type       | Required | Description  |
|-------|------------|----------|--------------|
| `id`  | `ObjectId` | ✅ Yes   | Cart item ID |

### Request Body (`application/json`)

| Field         | Type       | Required | Description         |
|---------------|------------|----------|---------------------|
| `variationId` | `ObjectId` | ✅ Yes   | New variation ID    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 57. Remove Cart Item

**DELETE** `/api/v1/cart/:id`

Removes a specific item from the cart.

### URL Parameter

| Param | Type       | Required | Description  |
|-------|------------|----------|--------------|
| `id`  | `ObjectId` | ✅ Yes   | Cart item ID |

### Response `200 OK`

```json
{
  "status": "success",
  "numOfCartItems": 2,
  "data": { ... }
}
```

---

## 58. Clear Cart

**DELETE** `/api/v1/cart`

Removes all items from the cart.

### Response `204 No Content`

---

## 59. Apply Coupon

**PUT** `/api/v1/cart/applyCoupon`

Applies a coupon code to the cart for a discount.

### Request Body (`application/json`)

| Field    | Type     | Required | Description      |
|----------|----------|----------|------------------|
| `coupon` | `string` | ✅ Yes   | Coupon code      |

### Example Request

```json
{
  "coupon": "SAVE20"
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "numOfCartItems": 2,
  "totalCartPrice": 400,
  "totalPriceAfterDiscount": 320,
  "data": { ... }
}
```

---

## Wishlist

---

## 60. Get Wishlist

**GET** `/api/v1/wishlists`

Returns all products in the seller's wishlist (populated).

### Response `200 OK`

```json
{
  "status": "success",
  "results": 3,
  "data": [ ... ]
}
```

---

## 61. Add to Wishlist

**POST** `/api/v1/wishlists`

Adds a product to the wishlist.

### Request Body (`application/json`)

| Field       | Type       | Required | Description          |
|-------------|------------|----------|----------------------|
| `productId` | `ObjectId` | ✅ Yes   | Product ID to add    |

### Example Request

```json
{
  "productId": "64abc..."
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Product added successfully to your wishlist",
  "data": [ ... ]
}
```

---

## 62. Remove from Wishlist

**DELETE** `/api/v1/wishlists/:id`

Removes a product from the wishlist.

### URL Parameter

| Param | Type       | Required | Description   |
|-------|------------|----------|---------------|
| `id`  | `ObjectId` | ✅ Yes   | Product ID    |

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Product removed successfully from your wishlist",
  "data": [ ... ]
}
```

---

## Notifications

---

## 63. Get My Notifications

**GET** `/api/v1/notifications`

Returns all notifications for the authenticated seller.

### Response `200 OK`

```json
{
  "status": "success",
  "results": 5,
  "data": [ ... ]
}
```

---

## 64. Mark Notification as Read

**PUT** `/api/v1/notifications/:id`

Marks a single notification as read.

### URL Parameter

| Param | Type       | Required | Description       |
|-------|------------|----------|-------------------|
| `id`  | `ObjectId` | ✅ Yes   | Notification ID   |

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 65. Mark All as Read

**PUT** `/api/v1/notifications/mark-all-read`

Marks all of the seller's notifications as read at once.

### Response `200 OK`

```json
{
  "status": "success",
  "message": "All notifications marked as read"
}
```

---

## 66. Delete Notification

**DELETE** `/api/v1/notifications/:id`

Deletes a single notification.

### URL Parameter

| Param | Type       | Required | Description       |
|-------|------------|----------|-------------------|
| `id`  | `ObjectId` | ✅ Yes   | Notification ID   |

### Response `204 No Content`

---

## 67. Get Notification Preferences

**GET** `/api/v1/notifications/preferences`

Returns the seller's current notification preferences.

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## 68. Update Notification Preferences

**PUT** `/api/v1/notifications/preferences`

Updates which notifications the seller wants to receive.

### Request Body (`application/json`)

Preferences object (fields depend on available notification types — send only the ones you want to change).

### Example Request

```json
{
  "orderUpdates": true,
  "lowStockAlerts": true,
  "promotions": false
}
```

### Response `200 OK`

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## Error Responses

All endpoints follow the same error format:

```json
{
  "status": "fail",
  "message": "<error description>"
}
```

| HTTP Status | Meaning                                            |
|-------------|----------------------------------------------------|
| `400`       | Bad request — validation error or invalid input    |
| `401`       | Unauthorized — missing or invalid token            |
| `403`       | Forbidden — role not allowed for this endpoint     |
| `404`       | Not found — resource does not exist                |
| `500`       | Internal server error                              |


**POST** `/api/v1/sellers/create-profile`

Creates the seller profile after the user has registered and logged in. This must be called once to set up the seller's profile.

### Request Body (`application/json`)

| Field         | Type     | Required | Description                                      | Constraints                              |
|---------------|----------|----------|--------------------------------------------------|------------------------------------------|
| `firstName`   | `string` | ✅ Yes   | Seller's first name                              | Min: 2 chars, Max: 30 chars              |
| `lastName`    | `string` | ✅ Yes   | Seller's last name                               | Min: 2 chars, Max: 30 chars              |
| `email`       | `string` | ✅ Yes   | Seller's email address                           | Must be a valid email format             |
| `phone`       | `string` | ✅ Yes   | Seller's phone number                            | Valid Egyptian, Saudi, or US phone       |
| `country`     | `string` | ✅ Yes   | Seller's country                                 | Min: 2 chars                             |
| `address`     | `string` | ✅ Yes   | Seller's address                                 | Min: 3 chars                             |
| `gender`      | `string` | ⬜ Optional | Seller's gender                              | Enum: `"male"`, `"female"`, `"other"`    |
| `dateOfBirth` | `string` | ⬜ Optional | Seller's date of birth                       | ISO 8601 format (e.g. `"1995-06-15"`)   |

### Example Request

```json
{
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "email": "ahmed@example.com",
  "phone": "01012345678",
  "country": "Egypt",
  "address": "123 Main Street, Cairo",
  "gender": "male",
  "dateOfBirth": "1995-06-15"
}
```

### Response `201 Created`

```json
{
  "message": "Seller profile created successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "country": "Egypt",
    "address": "123 Main Street, Cairo",
    "gender": "male",
    "dateOfBirth": "1995-06-15T00:00:00.000Z",
    "profileImage": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 2. Get Seller Profile

**GET** `/api/v1/sellers/profile`

Returns the authenticated seller's full profile.

### Request Body
None

### Response `200 OK`

```json
{
  "data": {
    "_id": "...",
    "userId": "...",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "country": "Egypt",
    "address": "123 Main Street, Cairo",
    "gender": "male",
    "dateOfBirth": "1995-06-15T00:00:00.000Z",
    "profileImage": "https://res.cloudinary.com/...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 3. Update Seller Profile

**PUT** `/api/v1/sellers/profile`

Updates the seller's personal profile fields (name, gender, dateOfBirth, profileImage). All fields are optional — only send the fields you want to update.

### Request Body (`application/json`)

| Field           | Type     | Required     | Description                    | Constraints                             |
|-----------------|----------|--------------|--------------------------------|-----------------------------------------|
| `firstName`     | `string` | ⬜ Optional  | New first name                 | Min: 2 chars, Max: 30 chars             |
| `lastName`      | `string` | ⬜ Optional  | New last name                  | Min: 2 chars, Max: 30 chars             |
| `gender`        | `string` | ⬜ Optional  | Gender                         | Enum: `"male"`, `"female"`, `"other"`   |
| `dateOfBirth`   | `string` | ⬜ Optional  | Date of birth                  | ISO 8601 format (e.g. `"1995-06-15"`)  |
| `profileImage`  | `string` | ⬜ Optional  | Profile image URL              | String URL                              |

> **Note:** To upload a profile image file, use the dedicated [Upload Profile Image](#4-upload-profile-image) endpoint instead.

### Example Request

```json
{
  "firstName": "Mohamed",
  "gender": "male",
  "dateOfBirth": "1993-03-20"
}
```

### Response `200 OK`

```json
{
  "data": {
    "_id": "...",
    "firstName": "Mohamed",
    "lastName": "Hassan",
    "gender": "male",
    "dateOfBirth": "1993-03-20T00:00:00.000Z",
    "profileImage": "https://res.cloudinary.com/...",
    ...
  }
}
```

---

## 4. Upload Profile Image

**POST** `/api/v1/sellers/profile-image/upload`

Uploads a profile image for the seller. The image is uploaded to Cloudinary and resized to 400×400px. Any existing image is deleted automatically.

### Request Body (`multipart/form-data`)

| Field          | Type   | Required | Description                              | Constraints                |
|----------------|--------|----------|------------------------------------------|----------------------------|
| `profileImage` | `file` | ✅ Yes   | The image file to upload                 | Must be an image file      |

### Example (FormData)

```
Content-Type: multipart/form-data

profileImage: <file>
```

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Profile image uploaded successfully",
  "data": {
    "profileImage": "https://res.cloudinary.com/.../sellers/image.jpg",
    "seller": {
      "_id": "...",
      "profileImage": "https://res.cloudinary.com/.../sellers/image.jpg",
      ...
    }
  }
}
```

---

## 5. Remove Profile Image

**DELETE** `/api/v1/sellers/profile-image/remove`

Removes the seller's current profile image from both Cloudinary and the database.

### Request Body
None

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Profile image removed successfully",
  "data": {
    "_id": "...",
    "profileImage": null,
    ...
  }
}
```

---

## 6. Update Contact Details

**PUT** `/api/v1/sellers/contact-details`

Updates the seller's contact information (phone, country, address). All fields are optional — only send the fields you want to update.

### Request Body (`application/json`)

| Field     | Type     | Required    | Description              | Constraints                              |
|-----------|----------|-------------|--------------------------|------------------------------------------|
| `phone`   | `string` | ⬜ Optional | New phone number         | Valid Egyptian, Saudi, or US phone       |
| `country` | `string` | ⬜ Optional | New country              | Min: 2 chars                             |
| `address` | `string` | ⬜ Optional | New address              | Min: 3 chars                             |

### Example Request

```json
{
  "phone": "01098765432",
  "country": "Saudi Arabia",
  "address": "456 King Road, Riyadh"
}
```

### Response `200 OK`

```json
{
  "data": {
    "_id": "...",
    "phone": "01098765432",
    "country": "Saudi Arabia",
    "address": "456 King Road, Riyadh",
    ...
  }
}
```

---

## 7. Change Password

**PUT** `/api/v1/sellers/password`

Changes the seller's account password. Requires the current password for verification and returns a new JWT token.

### Request Body (`application/json`)

| Field                | Type     | Required | Description                              | Constraints          |
|----------------------|----------|----------|------------------------------------------|----------------------|
| `currentPassword`    | `string` | ✅ Yes   | The seller's current password            | Must match existing  |
| `newPassword`        | `string` | ✅ Yes   | The new desired password                 | Min: 6 characters    |
| `newPasswordConfirm` | `string` | ✅ Yes   | Confirmation of the new password         | Must match `newPassword` |

### Example Request

```json
{
  "currentPassword": "oldPass123",
  "newPassword": "newSecurePass456",
  "newPasswordConfirm": "newSecurePass456"
}
```

### Response `200 OK`

```json
{
  "message": "Password updated successfully",
  "token": "<new_jwt_token>"
}
```

> **Important:** After a successful password change, the old token is invalidated. Use the returned `token` for all subsequent requests.

---

## 8. Deactivate Account

**DELETE** `/api/v1/sellers/deactivate`

Deactivates the seller's account by setting `active: false`. The account is not permanently deleted.

### Request Body
None

### Response `200 OK`

```json
{
  "message": "Account deactivated successfully"
}
```

---

## Error Responses

All endpoints follow the same error response format:

```json
{
  "status": "fail",
  "message": "<error description>"
}
```

| HTTP Status | Meaning                                           |
|-------------|---------------------------------------------------|
| `400`       | Bad request — validation error or invalid input   |
| `401`       | Unauthorized — missing or invalid token           |
| `403`       | Forbidden — token valid but role not allowed      |
| `404`       | Not found — seller profile not found              |
| `500`       | Internal server error                             |

---

## Seller Profile Object Reference

| Field          | Type       | Description                                      |
|----------------|------------|--------------------------------------------------|
| `_id`          | `ObjectId` | Seller profile unique ID                         |
| `userId`       | `ObjectId` | Reference to the associated user account         |
| `firstName`    | `string`   | Seller's first name                              |
| `lastName`     | `string`   | Seller's last name                               |
| `email`        | `string`   | Seller's email (lowercase)                       |
| `gender`       | `string`   | `"male"`, `"female"`, or `"other"`               |
| `dateOfBirth`  | `Date`     | Date of birth in ISO 8601                        |
| `profileImage` | `string`   | Full Cloudinary URL of the profile image         |
| `phone`        | `string`   | Seller's phone number                            |
| `country`      | `string`   | Seller's country                                 |
| `address`      | `string`   | Seller's address                                 |
| `createdAt`    | `Date`     | Timestamp when the profile was created           |
| `updatedAt`    | `Date`     | Timestamp when the profile was last updated      |
