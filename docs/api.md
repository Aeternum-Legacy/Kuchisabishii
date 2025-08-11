# Kuchisabishii - API Documentation

## Overview

This document outlines the planned API endpoints for the Kuchisabishii food journaling application.

## Base URL
```
Production: https://api.kuchisabishii.com
Development: http://localhost:3000/api
```

## Authentication

All API endpoints (except public ones) require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "displayName": "Display Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "username": "username",
      "displayName": "Display Name"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

#### POST /auth/logout
Logout user (invalidate token).

### Users

#### GET /users/profile
Get current user profile.

#### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "displayName": "New Display Name",
  "profileImage": "image_url"
}
```

### Food Entries

#### GET /food-entries
Get user's food entries with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Filter by category
- `date_from`: Start date filter
- `date_to`: End date filter
- `search`: Search in title/description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "entry_123",
      "title": "Amazing Ramen",
      "description": "Best ramen in the city",
      "images": ["url1", "url2"],
      "rating": 5,
      "category": "dinner",
      "location": {
        "name": "Ramen Shop",
        "address": "123 Main St",
        "latitude": 35.6762,
        "longitude": 139.6503
      },
      "tags": ["ramen", "japanese", "comfort-food"],
      "price": 12.99,
      "currency": "USD",
      "createdAt": "2024-01-15T18:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### POST /food-entries
Create a new food entry.

**Request Body:**
```json
{
  "title": "Amazing Ramen",
  "description": "Best ramen in the city",
  "images": ["base64_image_data"],
  "rating": 5,
  "category": "dinner",
  "location": {
    "name": "Ramen Shop",
    "address": "123 Main St",
    "latitude": 35.6762,
    "longitude": 139.6503
  },
  "tags": ["ramen", "japanese"],
  "price": 12.99,
  "currency": "USD"
}
```

#### GET /food-entries/:id
Get specific food entry by ID.

#### PUT /food-entries/:id
Update food entry.

#### DELETE /food-entries/:id
Delete food entry.

### Journal Entries

#### GET /journal-entries
Get user's journal entries.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `date_from`: Start date
- `date_to`: End date

#### POST /journal-entries
Create journal entry for a specific date.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "foodEntries": ["entry_123", "entry_456"],
  "notes": "Great day of eating!",
  "mood": "very_happy"
}
```

#### GET /journal-entries/:date
Get journal entry for specific date.

#### PUT /journal-entries/:id
Update journal entry.

### File Upload

#### POST /upload/image
Upload food image.

**Request:**
- Content-Type: `multipart/form-data`
- File field: `image`

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/images/img_123.jpg",
    "thumbnail": "https://storage.example.com/images/img_123_thumb.jpg"
  }
}
```

### Search

#### GET /search
Search across food entries.

**Query Parameters:**
- `q`: Search query
- `category`: Filter by category
- `location`: Location-based search
- `tags`: Filter by tags

### Statistics

#### GET /stats/summary
Get user's statistics summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEntries": 156,
    "averageRating": 4.2,
    "topCategories": [
      {"category": "dinner", "count": 45},
      {"category": "lunch", "count": 38}
    ],
    "entriesThisMonth": 23,
    "favoriteLocations": [
      {"name": "Ramen Shop", "count": 8}
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "validation_error",
  "message": "Email is required"
}
```

### Common Error Codes
- `validation_error`: Request data validation failed
- `authentication_required`: Missing or invalid authentication
- `permission_denied`: User lacks required permissions
- `resource_not_found`: Requested resource doesn't exist
- `rate_limit_exceeded`: Too many requests
- `internal_server_error`: Server error

## Rate Limiting

API requests are rate-limited:
- Authenticated users: 1000 requests per hour
- File uploads: 50 requests per hour
- Registration/login: 10 requests per minute per IP