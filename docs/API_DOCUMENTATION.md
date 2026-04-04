# 📚 API Documentation Guide

## Overview

This NestJS application provides comprehensive API documentation through Swagger/OpenAPI 3.0. The documentation is automatically generated and available at:

**Development**: `http://localhost:3000/api/docs`
**Production**: `http://your-domain.com/api/docs`

## 🔐 Authentication

The API uses Bearer Token authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## 📋 Response Format

All API responses follow a consistent structure:

```typescript
interface BaseResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    traceId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface ErrorResponse {
  success: false;
  statusCode: number;
  code: string;
  message: string;
  errors?: string[];
  requestId?: string;
  traceId?: string;
  timestamp: string;
  path: string;
  layer?: string;
  stack?: string;
}
```

## 🔌 Available Endpoints

### Authentication (`/api/v1/auth`)

#### POST `/api/v1/auth/login`
Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshTokenId": "550e8400-e29b-41d4-a616-42a8f4ab123"
  },
  "message": "Login successful"
}
```

#### POST `/api/v1/auth/refresh`
Generate new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshTokenId": "550e8400-e29b-41d4-a616-42a8f4ab123"
  },
  "message": "Token refreshed successfully"
}
```

### Users (`/api/v1/users`)

#### POST `/api/v1/users`
Create a new user account.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a616-42a8f4ab123",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "user",
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User created successfully"
}
```

#### GET `/api/v1/users`
Retrieve paginated list of users.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "email": "user1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "user"
    },
    {
      "id": "2",
      "email": "user2@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "fullName": "Jane Smith",
      "role": "admin"
    }
  ],
  "message": "Users retrieved successfully",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

#### GET `/api/v1/users/:id`
Retrieve a specific user by their unique identifier.

**Path Parameter:**
- `id` (required): User unique identifier (UUID)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a616-42a8f4ab123",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "user",
    "isActive": true,
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User retrieved successfully"
}
```

## 🎯 Error Responses

### Validation Errors (400)
```json
{
  "success": false,
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    "email must be an email",
    "password must be at least 8 characters"
  ],
  "layer": "Validation"
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "statusCode": 401,
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "layer": "Application"
}
```

### Not Found Errors (404)
```json
{
  "success": false,
  "statusCode": 404,
  "code": "USER_NOT_FOUND",
  "message": "User not found",
  "layer": "Application"
}
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation
```bash
# Clone repository
git clone <repository-url>
cd nest-base

# Install dependencies
npm install

# Start development server
npm run start:dev
```

### Environment Variables
See `.env.example` file for required environment variables.

### Code Quality Tools
- **ESLint**: Automatic code linting on commit
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for code quality
- **TypeScript**: Strict type checking

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure all required environment variables
3. Run with process manager (PM2, Docker, etc.)

### Health Checks
- **Application Health**: `GET /health`
- **Database Health**: `GET /health/db`
- **API Documentation**: `GET /api/docs`

## 📝 Development Guidelines

### Code Standards
- Use TypeScript strict mode
- Follow existing naming conventions
- Write comprehensive tests
- Document new endpoints
- Use proper error handling

### Git Workflow
1. Create feature branch from `develop`
2. Make changes with proper commit messages
3. Create pull request to `develop`
4. Ensure CI/CD passes

### Testing
```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

## 🔍 Troubleshooting

### Common Issues

**Swagger not accessible:**
- Check if `NODE_ENV !== 'production'`
- Verify port configuration
- Check firewall settings

**Authentication failures:**
- Verify JWT secret configuration
- Check token expiration
- Verify user account status

**Database connection issues:**
- Check `DATABASE_URL` environment variable
- Verify database server is running
- Check connection pool settings

### Support
For technical support:
1. Check this documentation
2. Review error messages in logs
3. Check health endpoints
4. Contact development team with request ID and trace ID

---

*Last updated: January 2024*
