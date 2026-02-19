# API Testing Guide - New Features

## 📋 Overview
This guide covers all the new API endpoints added to your e-commerce backend. Make sure your server is running and you have your auth token ready.

## 🔐 Authentication Required
Most endpoints require authentication. Include your JWT token in the header:
```
Authorization: Bearer your-jwt-token-here
```

## 🧑‍💼 Avatar Upload
### Upload/Update User Avatar
```
POST /user/avatar
Content-Type: multipart/form-data
Body: avatar (file)
```

## 🚚 Delivery System
### Get Nearby Orders (Delivery Role Required)
```
GET /orders/nearby?lat=LATITUDE&lng=LONGITUDE&maxDistance=5000
```

### Update Delivery Location
```
PUT /user/profile
Body: {
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  }
}
```

## 💳 Payment Methods
### Create Payment Method (Admin Only)
```
POST /payment-methods
Body: {
  "name": "Credit Card",
  "type": "card",
  "isActive": true,
  "processingFee": 2.5,
  "description": "Pay with credit/debit card"
}
```

### Get All Payment Methods
```
GET /payment-methods
```

## 🔗 Social Links (Admin Only)
### Create Social Link
```
POST /social-links
Body: {
  "platform": "facebook",
  "url": "https://facebook.com/yourstore",
  "icon": "fab fa-facebook",
  "isActive": true
}
```

### Get All Social Links
```
GET /social-links
```

## 📜 Privacy Policy (Admin Only)
### Create/Update Privacy Policy
```
POST /privacy-policy
Body: {
  "title": "Privacy Policy",
  "content": "Your privacy policy content here...",
  "version": "1.0"
}
```

## 🔔 Notifications
### Get User Notifications
```
GET /notifications/my-notifications
```

### Mark Notification as Read
```
PUT /notifications/:id/read
```

### Update Notification Preferences
```
PUT /user/notification-preferences
Body: {
  "orderUpdates": true,
  "promotions": false,
  "newsletter": true
}
```

## 🏪 Seller Application System

### Customer Endpoints

#### Check Eligibility
```
GET /seller-applications/eligibility
```

#### Submit Application
```
POST /seller-applications/apply
Body: {
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

#### Check Application Status
```
GET /seller-applications/my-status
```

### Admin Endpoints (Admin Role Required)

#### Get All Applications
```
GET /seller-applications/admin/applications?page=1&limit=10&status=pending
```

#### Get Single Application
```
GET /seller-applications/admin/applications/:id
```

#### Approve Application
```
PUT /seller-applications/admin/approve/:id
Body: {
  "reviewNotes": "Application approved. Welcome to our platform!"
}
```

#### Decline Application
```
PUT /seller-applications/admin/decline/:id
Body: {
  "reviewNotes": "Missing tax documentation. Please resubmit."
}
```

## 🖼️ Seller Profile Image Upload
### Upload Seller Profile Image (Seller Role Required)
```
POST /seller/profile-image
Content-Type: multipart/form-data
Body: image (file)
```

## 📊 Usage Examples

### Complete Seller Application Flow:

1. **Customer checks eligibility:**
   ```
   GET /seller-applications/eligibility
   ```

2. **Customer submits application:**
   ```
   POST /seller-applications/apply
   Body: { businessName, businessType, etc... }
   ```

3. **Admin reviews applications:**
   ```
   GET /seller-applications/admin/applications
   ```

4. **Admin approves/declines:**
   ```
   PUT /seller-applications/admin/approve/:id
   Body: { reviewNotes: "Approved!" }
   ```

5. **Customer becomes seller automatically** (role updated, seller profile created)

## 🔧 Environment Setup
Make sure you have these environment variables in your `config.env`:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret
```

## 🚨 Important Notes

- All file uploads use Cloudinary (avatars, product images, seller profiles)
- Delivery system uses 2dsphere indexing for location queries
- Payment methods support tokenization and encryption
- Notification system includes user preferences
- Seller applications include automatic profile creation on approval
- Declined applications can be resubmitted (previous application is cleared)

## 🧪 Testing Checklist

- [ ] User avatar upload works
- [ ] Delivery location tracking functions
- [ ] Payment methods CRUD operations
- [ ] Social links management (admin)
- [ ] Privacy policy versioning
- [ ] Notifications with preferences
- [ ] Seller application workflow
- [ ] Admin approval/decline process
- [ ] Automatic seller profile creation
- [ ] Reapplication after decline

Happy testing! 🎉