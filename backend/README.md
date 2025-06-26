# Event Management Backend API

A complete RESTful API for event management built with Express.js, MongoDB, and JWT authentication.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Attendee, Organizer, Admin)
  - Password hashing with bcrypt
  - Password reset functionality

- **Event Management**
  - CRUD operations for events
  - Event registration/unregistration
  - Image upload support
  - Advanced filtering and search
  - Pagination support

- **User Management**
  - User profile management
  - Admin user management
  - User statistics

- **Security**
  - Input validation
  - Error handling
  - CORS configuration
  - File upload security

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://junaidrizwan:d6cOpd0FZd30tQpY@cluster0.oyicrq9.mongodb.net/event-management?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/me` | Update profile | Private |
| PUT | `/api/auth/changepassword` | Change password | Private |
| POST | `/api/auth/logout` | Logout user | Private |
| POST | `/api/auth/forgotpassword` | Forgot password | Public |
| PUT | `/api/auth/resetpassword/:token` | Reset password | Public |

### Events

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/events` | Get all events | Public |
| GET | `/api/events/:id` | Get single event | Public |
| POST | `/api/events` | Create event | Private (Organizer/Admin) |
| PUT | `/api/events/:id` | Update event | Private (Owner/Admin) |
| DELETE | `/api/events/:id` | Delete event | Private (Owner/Admin) |
| POST | `/api/events/:id/register` | Register for event | Private |
| DELETE | `/api/events/:id/register` | Unregister from event | Private |
| GET | `/api/events/user/me` | Get user's events | Private |

### Users (Admin Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get single user | Admin/Same User |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| GET | `/api/users/stats/overview` | User statistics | Admin |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "organizer"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2024",
    "description": "Join us for the biggest tech conference",
    "category": "Technology",
    "date": "2024-03-15",
    "time": "09:00",
    "location": "San Francisco, CA",
    "ticketLimit": 500,
    "price": 299
  }'
```

### Get Events with Filters
```bash
curl "http://localhost:5000/api/events?category=Technology&location=San Francisco&page=1&limit=10"
```

## 🗄️ Database Schema

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['attendee', 'organizer', 'admin']),
  avatar: String,
  bio: String,
  phone: String,
  isVerified: Boolean,
  lastLogin: Date,
  timestamps: true
}
```

### Event Schema
```javascript
{
  title: String (required),
  description: String (required),
  category: String (required, enum),
  date: Date (required),
  time: String (required),
  location: String (required),
  image: String,
  ticketLimit: Number (required),
  ticketsSold: Number,
  price: Number (required),
  organizer: ObjectId (ref: User),
  organizerName: String,
  attendees: [ObjectId],
  status: String (enum: ['active', 'cancelled', 'completed', 'draft']),
  featured: Boolean,
  tags: [String],
  timestamps: true
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | - |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| NODE_ENV | Environment mode | development |

### File Upload

- Supported formats: JPG, PNG, GIF
- Maximum file size: 5MB
- Upload directory: `/uploads`

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## 📊 Response Format

Successful responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "total": 100,
  "totalPages": 10,
  "currentPage": 1
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS protection
- File upload security
- Role-based access control

## 🧪 Testing

Test the API endpoints using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

## 📦 Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT_SECRET
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use environment variables for sensitive data
6. Set up proper logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License. 