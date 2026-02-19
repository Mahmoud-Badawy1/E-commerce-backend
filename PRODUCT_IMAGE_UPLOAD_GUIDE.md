# Product Image Upload Guide

## Overview
The product creation flow has been optimized to handle images **after** product creation, avoiding issues with large image sizes during the initial product creation request.

## New Flow

### 1. Create Product First (Without Images)
Products can now be created without images. A placeholder image will be used initially.

**Endpoint:** `POST /api/v1/products/seller` (for sellers) or `POST /api/v1/products` (for admins)

**Request Body:**
```json
{
  "title": "Product Name",
  "description": "Product description",
  "price": 100,
  "quantity": 10,
  "sku": "PROD-001",
  "category": "category-id-here",
  // ... other product fields
  // NO imageCover or images needed here
}
```

**Response:**
```json
{
  "data": {
    "_id": "product-id-here",
    "title": "Product Name",
    "imageCover": "https://via.placeholder.com/800x600.png?text=Product+Image",
    "images": [],
    // ... other product fields
  }
}
```

### 2. Upload Images to Cloudinary
After successful product creation, upload the images using the product ID.

**Endpoint:** `POST /api/v1/products/seller/:id/upload-images` (for sellers)  
**Or:** `POST /api/v1/products/:id/upload-images` (for admins)

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `imageCover`: Single image file (optional)
- `images`: Multiple image files up to 5 (optional)

**Response:**
```json
{
  "status": "success",
  "message": "Product images uploaded and updated successfully",
  "data": {
    "product": {
      "_id": "product-id-here",
      "imageCover": "https://res.cloudinary.com/[cloudinary-url]",
      "images": [
        "https://res.cloudinary.com/[cloudinary-url-1]",
        "https://res.cloudinary.com/[cloudinary-url-2]"
      ],
      // ... other product fields
    }
  }
}
```

## Frontend Implementation Example

### Step 1: Keep Images in State
```javascript
const [productData, setProductData] = useState({
  title: '',
  description: '',
  price: 0,
  quantity: 0,
  sku: '',
  category: '',
  // ... other fields
});

const [imageCover, setImageCover] = useState(null);
const [images, setImages] = useState([]);

// Handle image selection
const handleImageCoverChange = (e) => {
  setImageCover(e.target.files[0]);
};

const handleImagesChange = (e) => {
  setImages(Array.from(e.target.files));
};
```

### Step 2: Create Product
```javascript
const createProduct = async () => {
  try {
    // Step 1: Create product without images
    const response = await fetch('/api/v1/products/seller', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    const result = await response.json();
    const productId = result.data._id;

    // Step 2: Upload images if available
    if (imageCover || images.length > 0) {
      const formData = new FormData();
      
      if (imageCover) {
        formData.append('imageCover', imageCover);
      }
      
      images.forEach((image) => {
        formData.append('images', image);
      });

      const imageResponse = await fetch(`/api/v1/products/seller/${productId}/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const imageResult = await imageResponse.json();
      
      if (imageResult.status === 'success') {
        console.log('Product created and images uploaded successfully!');
        return imageResult.data.product;
      }
    }

    return result.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};
```

### Step 3: React Component Example
```javascript
const CreateProductForm = () => {
  const [loading, setLoading] = useState(false);
  const [imageCover, setImageCover] = useState(null);
  const [images, setImages] = useState([]);
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: 0,
    // ... other fields
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create product
      const response = await fetch('/api/v1/products/seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) throw new Error('Failed to create product');

      const { data: product } = await response.json();

      // Upload images if provided
      if (imageCover || images.length > 0) {
        const formData = new FormData();
        
        if (imageCover) {
          formData.append('imageCover', imageCover);
        }
        
        images.forEach((image) => {
          formData.append('images', image);
        });

        const uploadResponse = await fetch(
          `/api/v1/products/seller/${product._id}/upload-images`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          }
        );

        if (!uploadResponse.ok) {
          console.warn('Product created but image upload failed');
        }
      }

      alert('Product created successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Product fields */}
      <input
        type="text"
        placeholder="Product Title"
        value={productData.title}
        onChange={(e) => setProductData({...productData, title: e.target.value})}
      />
      
      {/* Image uploads */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageCover(e.target.files[0])}
      />
      
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setImages(Array.from(e.target.files))}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
};
```

## Benefits

1. **No Image Size Issues**: Images are handled separately, avoiding request payload size limits
2. **Better Error Handling**: If product creation fails, no images are uploaded
3. **Progressive Enhancement**: Product is created first, then enhanced with images
4. **Cleaner Separation**: Product data and image uploads are separate concerns
5. **Retry Logic**: If image upload fails, you can retry without recreating the product

## API Endpoints Summary

| Role   | Endpoint                                    | Method | Purpose                              |
|--------|---------------------------------------------|--------|--------------------------------------|
| Seller | `/api/v1/products/seller`                  | POST   | Create product without images        |
| Seller | `/api/v1/products/seller/:id/upload-images`| POST   | Upload images for seller's product   |
| Admin  | `/api/v1/products`                         | POST   | Create product without images        |
| Admin  | `/api/v1/products/:id/upload-images`       | POST   | Upload images for any product        |

## Notes

- Products can be created without images (placeholder will be used)
- Images are uploaded after product creation succeeds
- Each upload can include 1 cover image and up to 5 additional images
- Images are automatically resized and optimized by Cloudinary
- If image upload fails, the product still exists with placeholder image
- You can call the upload endpoint multiple times to add more images

## Legacy Support

The old `/api/v1/products/upload-images` endpoint still exists for standalone image uploads (without product ID), but the new flow is recommended for product creation.
