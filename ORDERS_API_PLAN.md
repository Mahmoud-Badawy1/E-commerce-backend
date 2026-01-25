# Orders API Plan for Sellers/Vendors

## Overview
This document outlines the detailed API plan for the Orders management page for sellers/vendors. All endpoints will be restricted to users with the "seller" role.

---

## 1. Database Model Considerations

### Current State:
- `Order` model exists with: customer, items (product, quantity, color, price), payment info, status
- `Product` model exists but **does NOT have a seller field**
- `Seller` model exists with `userId` reference to User

### Required Changes:
- **Add `seller` field to Product model** (ObjectId ref to Seller or User)
- **Update Order status enum** to match UI: `["pending", "Approved", "shipping", "completed", "cancelled"]`
  - Note: UI shows "Shipping" and "Completed" but current model has "delivered"
  - Map: `shipping` → "Shipping", `delivered` → "Completed"

---

## 2. API Endpoints

### 2.1 GET `/api/orders` - Get All Orders (Seller)
**Purpose:** List all orders containing products belonging to the authenticated seller

**Authentication:** 
- `authController.protect`
- `authController.allowedTo("seller")`

**Query Parameters:**
- `status` (optional): Filter by order status - `"pending" | "Approved" | "shipping" | "completed" | "cancelled" | "all"`
- `paymentStatus` (optional): Filter by payment status - `"paid" | "unpaid" | "all"`
- `keyword` (optional): Search by order ID or product name
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Items per page
- `sort` (optional, default: "-createdAt"): Sort field (e.g., "date", "-date", "price", "-price")
- `startDate` (optional): Filter orders from date (ISO format)
- `endDate` (optional): Filter orders to date (ISO format)

**Response Format:**
```json
{
  "status": "success",
  "results": 10,
  "paginationResult": {
    "currentPage": 1,
    "limit": 10,
    "numberOfPages": 5,
    "next": 2,
    "prev": null
  },
  "data": [
    {
      "_id": "order_id",
      "orderId": "021231", // Short ID for display
      "items": [
        {
          "product": {
            "_id": "product_id",
            "title": "Kanky Kitadakate (Green)",
            "imageCover": "https://..."
          },
          "quantity": 1,
          "color": "Green",
          "price": 21.78
        }
      ],
      "customer": {
        "name": "Leslie Alexander",
        "email": "leslie@example.com"
      },
      "totalOrderPrice": 21.78,
      "createdAt": "2023-04-17T00:00:00.000Z",
      "isPaid": true,
      "paidAt": "2023-04-17T00:00:00.000Z",
      "paymentMethod": "Paymob",
      "status": "shipping",
      "deliveredAt": null
    }
  ],
  "counts": {
    "all": 441,
    "shipping": 100,
    "completed": 300,
    "cancelled": 41
  }
}
```

**Implementation Details:**
- Filter orders where at least one item's product belongs to the seller
- Use `ApiFeatures` class for pagination, sorting, filtering
- Custom search: search by order `_id` (partial match) or product `title`
- Include order counts by status in response
- Populate customer (name, email) and product (title, imageCover)

---

### 2.2 GET `/api/orders/:id` - Get Single Order Details
**Purpose:** Get detailed information about a specific order

**Authentication:**
- `authController.protect`
- `authController.allowedTo("seller")`

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "_id": "order_id",
    "orderId": "021231",
    "customer": {
      "_id": "user_id",
      "name": "Leslie Alexander",
      "email": "leslie@example.com",
      "addresses": [...]
    },
    "items": [
      {
        "product": {
          "_id": "product_id",
          "title": "Kanky Kitadakate (Green)",
          "imageCover": "https://...",
          "description": "...",
          "price": 21.78
        },
        "quantity": 1,
        "color": "Green",
        "price": 21.78
      }
    ],
    "cartPrice": 21.78,
    "taxes": 0,
    "shipping": 0,
    "totalOrderPrice": 21.78,
    "paymentMethod": "Paymob",
    "isPaid": true,
    "paidAt": "2023-04-17T00:00:00.000Z",
    "status": "shipping",
    "deliveredAt": null,
    "createdAt": "2023-04-17T00:00:00.000Z",
    "updatedAt": "2023-04-17T00:00:00.000Z"
  }
}
```

**Implementation Details:**
- Verify order contains at least one product belonging to the seller
- Return 403 if seller doesn't own any products in the order
- Populate full customer and product details

---

### 2.3 PUT `/api/orders/:id` - Update Order Status/Payment
**Purpose:** Update order status and/or payment status (for seller actions)

**Authentication:**
- `authController.protect`
- `authController.allowedTo("seller")`

**Request Body:**
```json
{
  "status": "shipping", // optional: "pending" | "Approved" | "shipping" | "completed" | "cancelled"
  "isPaid": true, // optional: boolean
  "paymentMethod": "Paymob" // optional: "cash on delivery" | "online payment" | "Paymob"
}
```

**Response Format:**
```json
{
  "status": "success",
  "message": "Order updated successfully",
  "data": {
    // Updated order object
  }
}
```

**Implementation Details:**
- Verify order contains seller's products
- If `status` is "completed", set `deliveredAt` to current date
- If `isPaid` is true, set `paidAt` to current date
- Validate status enum values
- Return 403 if seller doesn't own products in order

---

### 2.4 DELETE `/api/orders/:id` - Delete Order
**Purpose:** Delete an order (soft delete or hard delete based on business logic)

**Authentication:**
- `authController.protect`
- `authController.allowedTo("seller")`

**Response Format:**
```json
{
  "status": "success",
  "message": "Order deleted successfully"
}
```

**Implementation Details:**
- Verify order contains seller's products
- Consider: Should sellers be able to delete orders? Or only cancel?
- If hard delete: Remove order from database
- If soft delete: Add `deleted: true` field to order model
- Return 403 if seller doesn't own products in order

---

### 2.5 POST `/api/orders` - Create New Order (Optional)
**Purpose:** Allow seller to create a new order manually (if needed)

**Authentication:**
- `authController.protect`
- `authController.allowedTo("seller")`

**Request Body:**
```json
{
  "customer": "customer_user_id",
  "items": [
    {
      "product": "product_id",
      "quantity": 1,
      "color": "Green",
      "price": 21.78
    }
  ],
  "paymentMethod": "cash on delivery",
  "status": "pending"
}
```

**Response Format:**
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    // Created order object
  }
}
```

**Implementation Details:**
- Verify all products in items belong to the seller
- Calculate `cartPrice`, `taxes`, `shipping`, `totalOrderPrice`
- Use settings for taxes and shipping
- Return 400 if any product doesn't belong to seller

---

### 2.6 GET `/api/orders/export` - Export Orders
**Purpose:** Export orders to CSV/Excel format

**Authentication:**
- `authController.protect`
- `authController.allowedTo("seller")`

**Query Parameters:**
- `format` (optional, default: "csv"): `"csv" | "excel"`
- `status` (optional): Filter by status
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response:**
- File download (CSV or Excel)
- Headers: Order ID, Product Name, Customer, Price, Date, Payment Status, Order Status

**Implementation Details:**
- Use library like `csv-writer` or `exceljs`
- Filter orders by seller's products
- Generate file and send as download

---

### 2.7 GET `/api/orders/stats/counts` - Get Order Counts by Status
**Purpose:** Get counts of orders by status (for tabs display)

**Authentication:**
- `authController.protect`
- `authController.allowedTo("seller")`

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "all": 441,
    "shipping": 100,
    "completed": 300,
    "cancelled": 41,
    "pending": 0,
    "Approved": 0
  }
}
```

**Implementation Details:**
- Aggregate orders containing seller's products
- Group by status and count
- Return counts for all statuses

---

## 3. Middleware & Filters

### 3.1 `filterOrdersForSeller` Middleware
**Purpose:** Filter orders to only include those with seller's products

**Location:** `controller/orderController.js`

**Implementation:**
```javascript
exports.filterOrdersForSeller = asyncHandler(async (req, res, next) => {
  // Get seller's products
  const seller = await sellerModel.findOne({ userId: req.user._id });
  if (!seller) {
    return next(new ApiError("Seller profile not found", 404));
  }
  
  // Find all products belonging to this seller
  const sellerProducts = await productModel.find({ seller: seller._id }).select("_id");
  const productIds = sellerProducts.map(p => p._id);
  
  // Filter orders that contain at least one of seller's products
  req.filterObject = {
    "items.product": { $in: productIds }
  };
  
  next();
});
```

---

## 4. Validators

### 4.1 `orderValidator.js` - Create Order Validator
**Fields to validate:**
- `customer`: Required, MongoDB ObjectId, must exist in User model
- `items`: Required, array, min length 1
  - `items[].product`: Required, MongoDB ObjectId, must exist in Product model
  - `items[].quantity`: Required, number, min 1
  - `items[].price`: Required, number, min 0
  - `items[].color`: Optional, string
- `paymentMethod`: Required, enum: ["cash on delivery", "online payment", "Paymob"]
- `status`: Optional, enum: ["pending", "Approved", "shipping", "completed", "cancelled"]

### 4.2 Update Order Validator
**Fields to validate:**
- `status`: Optional, enum: ["pending", "Approved", "shipping", "completed", "cancelled"]
- `isPaid`: Optional, boolean
- `paymentMethod`: Optional, enum: ["cash on delivery", "online payment", "Paymob"]

---

## 5. Route Structure

**File:** `routes/orderRoute.js`

```javascript
// Seller-specific routes
router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("seller"),
    orderController.filterOrdersForSeller,
    orderController.getAllOrders
  )
  .post(
    authController.protect,
    authController.allowedTo("seller"),
    orderValidator.createOrderValidator,
    orderController.createOrder
  );

router
  .route("/stats/counts")
  .get(
    authController.protect,
    authController.allowedTo("seller"),
    orderController.filterOrdersForSeller,
    orderController.getOrderCounts
  );

router
  .route("/export")
  .get(
    authController.protect,
    authController.allowedTo("seller"),
    orderController.filterOrdersForSeller,
    orderController.exportOrders
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.allowedTo("seller"),
    orderController.getOrderDetails
  )
  .put(
    authController.protect,
    authController.allowedTo("seller"),
    orderValidator.updateOrderValidator,
    orderController.updateOrder
  )
  .delete(
    authController.protect,
    authController.allowedTo("seller"),
    orderController.deleteOrder
  );
```

---

## 6. Controller Functions

### 6.1 `getAllOrders` (Modified)
- Use existing `controllerHandler.getAll` but with seller filter
- Add custom search for order ID and product name
- Include status counts in response

### 6.2 `getOrderDetails`
- Verify order contains seller's products
- Return detailed order information

### 6.3 `updateOrder`
- Verify order contains seller's products
- Update status and/or payment info
- Handle `deliveredAt` and `paidAt` timestamps

### 6.4 `deleteOrder`
- Verify order contains seller's products
- Delete order (hard or soft delete)

### 6.5 `createOrder` (New)
- Verify all products belong to seller
- Calculate prices using settings
- Create order

### 6.6 `exportOrders` (New)
- Filter by seller
- Generate CSV/Excel file
- Return file download

### 6.7 `getOrderCounts` (New)
- Aggregate orders by status
- Return counts for all statuses

---

## 7. Custom Search Implementation

**Modify `apiFeatures.js` or create custom search in controller:**

For order search by ID or product name:
```javascript
if (this.queryString.keyword) {
  const keyword = this.queryString.keyword;
  query.$or = [
    { _id: { $regex: keyword, $options: "i" } }, // Search by order ID
    { "items.product.title": { $regex: keyword, $options: "i" } } // Search by product name
  ];
}
```

**Note:** Product name search requires aggregation or separate query since product is populated.

---

## 8. Status Mapping

**UI Status → Database Status:**
- "All Orders" → No filter
- "Shipping" → `status: "shipping"`
- "Completed" → `status: "completed"` (map from "delivered" if needed)
- "Cancel" → `status: "cancelled"`

**Payment Status:**
- "Paid" → `isPaid: true`
- "Unpaid" → `isPaid: false`

---

## 9. Response Format Standardization

All responses should follow this pattern:
```json
{
  "status": "success" | "error",
  "message": "Optional message",
  "data": { ... },
  "results": number, // For list endpoints
  "paginationResult": { ... } // For paginated endpoints
}
```

---

## 10. Error Handling

**Common Errors:**
- 401: Not authenticated
- 403: Not authorized (seller doesn't own products in order)
- 404: Order not found
- 400: Validation error
- 500: Server error

**Error Response Format:**
```json
{
  "status": "error",
  "message": "Error message",
  "error": "Detailed error info"
}
```

---

## 11. Implementation Order

1. **Update Product Model** - Add `seller` field
2. **Update Order Model** - Update status enum if needed
3. **Create `filterOrdersForSeller` middleware**
4. **Create validators** - `orderValidator.js`
5. **Update/Add controller functions**
6. **Update routes** - Add seller-specific routes
7. **Test endpoints** - Use Postman or similar

---

## 12. Testing Checklist

- [ ] GET `/api/orders` - Returns only seller's orders
- [ ] GET `/api/orders?status=shipping` - Filters by status
- [ ] GET `/api/orders?keyword=021231` - Searches by order ID
- [ ] GET `/api/orders?keyword=product` - Searches by product name
- [ ] GET `/api/orders/:id` - Returns order details
- [ ] PUT `/api/orders/:id` - Updates order status
- [ ] DELETE `/api/orders/:id` - Deletes order
- [ ] GET `/api/orders/stats/counts` - Returns status counts
- [ ] GET `/api/orders/export` - Exports orders
- [ ] Verify 403 error when accessing other seller's orders
- [ ] Test pagination
- [ ] Test sorting

---

## Notes

- All endpoints require seller authentication
- Orders are filtered to only include those with seller's products
- Status enum may need adjustment to match UI exactly
- Product model needs seller field added
- Consider adding indexes on `items.product` for performance
- Consider caching order counts if high traffic


