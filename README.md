# KhabarBox : Food Ordering Platform

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Better_Auth-FF6B6B?style=for-the-badge&logo=auth0&logoColor=white" alt="Better Auth" />
</p>

<p align="center"><b>Delicious Food, Delivered Fast</b></p>

KhabarBox is a comprehensive **multi-vendor food ordering platform** built with modern web technologies. It connects food lovers with local restaurants, offering a seamless experience for customers, restaurant owners (providers), and administrators.

---

## Features

**For Customers:**
- Secure authentication with email/password & Google OAuth, including email verification
- Advanced meal search with filters (price range, dietary tags, categories, restaurants)
- Persistent cart with multi-restaurant support
- Real-time order tracking from placement to delivery
- Review and rate meals only after a successful delivery
- Auto-complete search suggestions for meals, tags, and restaurants

**For Providers (Restaurants):**
- Dashboard with revenue, orders, and performance metrics
- Full CRUD operations for meal management with category support
- Accept, prepare, and update order status in real time
- Restaurant profile management with logo, description, and hours
- Weekly revenue charts and popular items tracking

**For Administrators:**
- System-wide overview of users, orders, and revenue
- User management with suspend, activate, and delete capabilities
- Global order monitoring and status control
- 30-day revenue trend analytics and top provider rankings
- Visual order status breakdown

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Language | TypeScript 5+ |
| Framework | Express.js 4 |
| Database | PostgreSQL |
| ORM | Prisma 5+ |
| Authentication | Better Auth |
| Email Service | Nodemailer (Gmail SMTP) |

---

## API Documentation

### Base URL

```
http://localhost:5000
```

### Authentication

Most endpoints require a session cookie set by Better Auth after login. Protected routes are marked with `Auth Required`.

Role-based access is enforced on every route:
- `CUSTOMER` : Access to cart, orders, and reviews
- `PROVIDER` : Access to meal management and provider dashboard
- `ADMIN` : Full platform access

### Standard Error Response

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

---

### Authentication Endpoints

#### POST /auth/sign-up : Register a new user

```http
POST /api/auth/sign-up
Content-Type: application/json
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "CUSTOMER"
}
```

Response `201 Created`:
```json
{
  "success": true,
  "message": "Verification email sent",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CUSTOMER",
      "emailVerified": false,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

Error `400` : `"Email already exists"`

---

#### POST /auth/sign-in : Login

```http
POST /api/auth/sign-in
Content-Type: application/json
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response `200 OK`:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CUSTOMER",
      "emailVerified": true
    },
    "session": {
      "id": "session-uuid",
      "expiresAt": "2025-01-16T10:30:00Z"
    }
  }
}
```

Error `401` : `"Invalid email or password"`

---

#### GET /auth/session : Get current session

```http
GET /api/auth/session
Cookie: better-auth.session=xyz
```

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "user": { "id": "user-uuid", "email": "user@example.com", "role": "CUSTOMER" },
    "session": { "id": "session-uuid", "expiresAt": "2025-01-16T10:30:00Z" }
  }
}
```

Error `401` : `"You are not authorized!"`

---

### Meal Endpoints

#### GET /meals : Get all meals with filters

```http
GET /meals?search=biryani&categoryId=cat-123&minPrice=100&maxPrice=500&dietaryTags=spicy,halal&sortBy=price&sortOrder=asc&page=1&limit=10
```

Query Parameters:

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Search by meal name |
| `categoryId` | string | Filter by category |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `dietaryTags` | string | Comma-separated tags |
| `sortBy` | string | `price` or `createdAt` |
| `sortOrder` | string | `asc` or `desc` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "meal-uuid-1",
        "name": "Chicken Biryani",
        "price": 250.00,
        "imageUrl": "https://example.com/biryani.jpg",
        "isAvailable": true,
        "dietaryTags": ["spicy", "halal"],
        "category": { "id": "cat-123", "name": "Rice Items" },
        "provider": {
          "id": "provider-uuid",
          "providerProfile": { "restaurantName": "Spice Garden" }
        }
      }
    ],
    "metaData": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
  }
}
```

---

#### GET /meals/:id : Get meal by ID

Response `200 OK` includes full meal details with reviews, provider info, and average rating.

Error `404` : `"Meal not found"`

---

#### POST /meals : Create meal — `Auth Required : PROVIDER`

```http
POST /meals
Authorization: Bearer <token>
Content-Type: application/json
```

Request body:
```json
{
  "name": "Beef Tehari",
  "description": "Traditional Dhaka style tehari",
  "price": 300,
  "imageUrl": "https://example.com/tehari.jpg",
  "categoryId": "cat-123",
  "dietaryTags": ["spicy", "halal"],
  "isAvailable": true
}
```

Response `201 Created` : Returns created meal object.

Error `403` : `"Forbidden Access"`

---

#### PATCH /meals/:id : Update meal — `Auth Required : PROVIDER`

Accepts partial update. Only the meal's own provider can update it.

Error `400` : `"Meal not found"`

---

#### DELETE /meals/:id : Delete meal — `Auth Required : PROVIDER`

Error `400` : `"Failed to delete meal"`

---

#### GET /meals/suggestions : Auto-complete search

```http
GET /meals/suggestions?query=chi
```

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "meals": [{ "id": "...", "name": "Chicken Biryani", "price": 250 }],
    "tags": ["Chicken", "Chinese", "Chili"],
    "restaurants": [{ "id": "...", "name": "Chicken House" }],
    "categories": [{ "id": "cat-456", "name": "Chinese" }]
  }
}
```

---

### Cart Endpoints — `Auth Required : CUSTOMER`

#### POST /cart : Add item to cart

```json
{ "mealId": "meal-uuid", "quantity": 2 }
```

Response `201 Created` : Returns cart item with meal details.

Error `400` : `"Meal not available"`

---

#### GET /cart : Get my cart

Response `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cart-item-uuid",
        "quantity": 2,
        "meal": { "name": "Chicken Biryani", "price": 250.00 }
      }
    ],
    "meta": { "totalItems": 3, "totalAmount": 530.00 }
  }
}
```

---

#### PATCH /cart/:cartId : Update item quantity

```json
{ "quantity": 3 }
```

Error `400` : `"Quantity must be at least 1"`

---

#### DELETE /cart/:cartId : Remove item from cart

Error `400` : `"Cart item not found"`

---

#### DELETE /cart/clear : Clear entire cart

---

### Order Endpoints

#### POST /orders : Place order — `Auth Required : CUSTOMER`

```json
{
  "deliveryAddress": "House 12, Road 5, Dhanmondi, Dhaka",
  "phone": "01712345678",
  "notes": "Please deliver after 7 PM"
}
```

Response `201 Created` : Returns array of orders (one per provider if multi-restaurant cart).

Error `400` : `"Cart is empty"`

---

#### GET /orders/my-orders : Customer's order history — `Auth Required : CUSTOMER`

Returns list of orders with items and provider details.

---

#### GET /orders/provider-orders : Incoming orders — `Auth Required : PROVIDER`

Returns orders assigned to the provider, including customer contact info.

---

#### GET /orders/:id : Get order by ID — `Auth Required`

Error `404` : `"Order not found"`

---

#### PATCH /orders/:id/status : Update order status — `Auth Required : PROVIDER`

```json
{ "status": "PREPARING" }
```

Order status flow : `PLACED` → `PREPARING` → `READY` → `DELIVERED`

Error `400` : `"Cannot change from DELIVERED to PREPARING"`

---

#### POST /orders/:id/cancel : Cancel order — `Auth Required : CUSTOMER`

Error `400` : `"Cannot cancel this order"`

---

### Review Endpoints

#### POST /reviews : Create review — `Auth Required : CUSTOMER`

```json
{
  "mealId": "meal-uuid",
  "rating": 5,
  "comment": "Absolutely delicious!"
}
```

Note : Reviews can only be submitted for meals from a `DELIVERED` order.

Error `400` : `"You can only review meals from delivered orders"`

---

#### GET /reviews/:mealId : Get reviews for a meal

Response includes list of reviews and `averageRating`.

---

#### GET /reviews/my-reviews : Get my reviews — `Auth Required : CUSTOMER`

---

#### PATCH /reviews/:reviewId : Update review — `Auth Required : CUSTOMER`

```json
{ "rating": 4, "comment": "Updated comment" }
```

Error `400` : `"Review not found or not authorized"`

---

#### DELETE /reviews/:reviewId : Delete review — `Auth Required : CUSTOMER or ADMIN`

Error `403` : `"Not authorized to delete this review"`

---

### User Profile Endpoints — `Auth Required`

#### GET /users/me : Get my profile

Returns role-specific profile. Provider response includes restaurant details.

---

#### PATCH /users/me : Update profile

```json
{
  "name": "John Doe Updated",
  "image": "https://example.com/photo.jpg",
  "phone": "01799999999"
}
```

---

#### PATCH /users/provider-profile : Update restaurant profile — `Auth Required : PROVIDER`

```json
{
  "restaurantName": "Spice Garden Premium",
  "description": "Fine dining Bangladeshi cuisine",
  "address": "456 New Location, Dhaka",
  "logoUrl": "https://example.com/new-logo.jpg",
  "openingHours": "11:00 AM - 11:00 PM"
}
```

Error `400` : `"Profile not found. Create one first."`

---

### Provider Public Endpoints

#### GET /provider/profile/all : Get all providers

```http
GET /provider/profile/all?page=1&limit=8
```

Returns paginated list of restaurants with average ratings and meal count.

---

#### GET /provider/profile/top-rated : Get top-rated restaurants

Returns top restaurants sorted by average rating.

---

#### GET /provider/profile/:userId : Get public provider profile

Returns full restaurant profile with menu and reviews.

---

### Provider Dashboard Endpoints — `Auth Required : PROVIDER`

#### GET /provider/dashboard/stats

```json
{
  "success": true,
  "data": {
    "totalOrders": 156,
    "totalRevenue": 45000.00,
    "pendingOrders": 12,
    "totalMeals": 25,
    "todayOrders": 8,
    "weeklyRevenue": 8500.00
  }
}
```

---

#### GET /provider/dashboard/recent-orders

```http
GET /provider/dashboard/recent-orders?page=1&limit=5
```

Returns paginated recent orders with customer info and items.

---

#### GET /provider/dashboard/popular-meals

```http
GET /provider/dashboard/popular-meals?limit=5
```

Returns top-selling meals with total sold count and revenue.

---

#### GET /provider/dashboard/weekly-chart

Returns daily order count and revenue for the current week.

```json
{
  "success": true,
  "data": [
    { "day": "Sun", "orders": 5, "revenue": 1500.00 },
    { "day": "Mon", "orders": 8, "revenue": 2400.00 }
  ]
}
```

---

#### GET /provider/dashboard/my-meals

```http
GET /provider/dashboard/my-meals?page=1&limit=10&isAvailable=true
```

Returns paginated list of the provider's own meals with review and order counts.

---

### Category Endpoints

#### GET /categories : Get all categories

```http
GET /categories?page=1&limit=10&search=rice
```

Returns paginated categories with meal counts.

---

#### GET /categories/:id : Get category by ID

Returns category with all its associated meals.

Error `404` : `"Category not found"`

---

#### POST /categories : Create category — `Auth Required : ADMIN`

```json
{ "name": "Desserts", "description": "Sweet dishes and desserts" }
```

Error `400` : `"Category with this name already exists"`

---

#### PATCH /categories/:id : Update category — `Auth Required : ADMIN`

---

#### DELETE /categories/:id : Delete category — `Auth Required : ADMIN`

Error `400` : `"Cannot delete category with existing meals"`

---

### Admin Endpoints — `Auth Required : ADMIN`

#### GET /admin/stats : Platform overview

```json
{
  "success": true,
  "data": {
    "users": { "total": 150, "providers": 25, "customers": 125 },
    "orders": { "total": 1200, "pending": 45 },
    "revenue": 350000.00
  }
}
```

---

#### GET /admin/users : Get all users

```http
GET /admin/users?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

Returns paginated users with role, status, and provider profile if applicable.

---

#### GET /admin/orders : Get all orders

```http
GET /admin/orders?page=1&limit=20
```

Returns paginated orders with customer and provider details.

---

#### PATCH /admin/users/:userId/suspend : Suspend a user

Error `400` : `"Cannot suspend admin"`

---

#### PATCH /admin/users/:userId/activate : Activate a suspended user

---

#### DELETE /admin/users/:userId : Delete a user

Error `400` : `"Cannot delete user: Active orders are still in progress."`

---

#### PATCH /admin/orders/:orderId/status : Update any order status

```json
{ "status": "DELIVERED" }
```

---

#### POST /admin/orders/:orderId/cancel : Cancel any order

---

#### GET /admin/revenue-trend : Revenue trend

```http
GET /admin/revenue-trend?days=30
```

Returns daily revenue and order count for the specified period.

---

#### GET /admin/recent-orders : Recent orders

```http
GET /admin/recent-orders?limit=10
```

---

#### GET /admin/top-providers : Top providers by revenue

```http
GET /admin/top-providers?limit=5
```

Returns top restaurants with total revenue and order count.

---

#### GET /admin/order-status-breakdown : Order status distribution

Returns count per status with color codes for chart rendering.

```json
{
  "success": true,
  "data": [
    { "name": "PLACED",    "value": 45,   "color": "#3b82f6" },
    { "name": "PREPARING", "value": 32,   "color": "#f59e0b" },
    { "name": "READY",     "value": 18,   "color": "#8b5cf6" },
    { "name": "DELIVERED", "value": 1105, "color": "#10b981" },
    { "name": "CANCELLED", "value": 12,   "color": "#ef4444" }
  ]
}
```

---

<div align="center">
Made with ❤️ by Rubaid
</div>
