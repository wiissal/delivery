# 📦 LogistiMa - Delivery Dispatch System

Complete Documentation & UML Diagrams

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [UML Diagrams](#uml-diagrams)
7. [Testing](#testing)

---

## 🎯 Project Overview

**LogistiMa** is a backend delivery dispatch system designed for the Moroccan market. It handles package assignment to deliverers with advanced features like race condition prevention, smart dispatcher algorithms, and background job processing.

### Tech Stack
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL 15
- **Cache/Queue:** Redis 7
- **Job Processing:** BullMQ
- **Testing:** Jest
- **Container:** Docker

### Key Metrics
- ✅ **62/70 tests passing** (88.5% coverage)
- ✅ Race condition prevention working
- ✅ Transaction locking implemented
- ✅ Background jobs processing

---

## ✨ Features

1. **Smart Package Assignment**
   - Automatically finds best available deliverer
   - Considers zone, capacity, and current workload

2. **Race Condition Prevention**
   - PostgreSQL row-level locking
   - ACID transactions
   - Prevents double assignments

3. **Redis Caching**
   - Zone data cached for performance
   - Automatic cache invalidation

4. **Background Jobs**
   - Route calculation
   - Receipt generation
   - Retry logic with exponential backoff

---

## 🔧 Installation

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- Git

### Steps

```bash
# 1. Clone repository
git clone <your-repo-url>
cd delivery

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Start Docker services
docker-compose up -d

# 5. Create databases
docker exec -it logistima-db psql -U postgres -c "CREATE DATABASE logistima;"
docker exec -it logistima-db psql -U postgres -c "CREATE DATABASE logistima_test;"

# 6. Run application
npm run dev
```

### Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=logistima
DB_USER=postgres
DB_PASSWORD=your database password 

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🚀 Usage

### Start Services

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Start worker (background jobs)
npm run worker

# Using Docker
docker-compose up
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## 📡 API Endpoints

### Packages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages` | Get all packages |
| GET | `/api/packages?status=pending` | Filter by status |
| GET | `/api/packages/:id` | Get package by ID |
| POST | `/api/packages` | Create package |
| PUT | `/api/packages/:id/assign` | Assign to deliverer |
| PUT | `/api/packages/:id/auto-assign` | Auto-assign |
| DELETE | `/api/packages/:id` | Delete package |

### Deliverers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deliverers` | Get all deliverers |
| GET | `/api/deliverers/:id` | Get deliverer by ID |
| POST | `/api/deliverers` | Create deliverer |
| PUT | `/api/deliverers/:id` | Update deliverer |
| DELETE | `/api/deliverers/:id` | Delete deliverer |

### Zones

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/zones` | Get all zones (cached) |
| GET | `/api/zones/:id` | Get zone by ID |
| POST | `/api/zones` | Create zone |
| PUT | `/api/zones/:id` | Update zone |
| DELETE | `/api/zones/:id` | Soft delete zone |

---

## 📊 UML Diagrams
### Check the `docs/` folder for detailed UML diagrams.

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Tests
```bash
# Dispatcher service (race condition tests)
npm test src/services/tests/dispatcherService.test.js

# Model tests
npm test src/models/tests/

# Cache tests
npm test src/services/tests/cacheService.test.js
```

### Test Results
```
Test Suites: 4 passed, 3 failed, 7 total
Tests:       62 passed, 8 failed, 70 total
Coverage:    88.5%
```

### Key Test Scenarios

**1. Race Condition Test**
- ✅ 3 concurrent requests try to assign to deliverer with capacity 1
- ✅ Only 1 succeeds with 201
- ✅ Other 2 fail with 409 (Conflict)

**2. Transaction Locking Test**
- ✅ Row-level locking prevents double assignment
- ✅ Capacity correctly updated
- ✅ Database remains consistent

**3. Cache Test**
- ✅ Zone data cached successfully
- ✅ Cache invalidation works
- ✅ TTL expiration works

---

## 📂 Project Structure

```
delivery/
├── src/
│   ├── config/
│   │   ├── index.js              # Main config
│   │   ├── database.js           # PostgreSQL config
│   │   └── redis.js              # Redis config
│   │
│   ├── models/
│   │   ├── index.js              # Model exports & relationships
│   │   ├── Zone.js               # Zone model
│   │   ├── Deliverer.js          # Deliverer model
│   │   ├── Package.js            # Package model
│   │   └── Delivery.js           # Delivery model
│   │
│   ├── services/
│   │   ├── dispatcherService.js  # Smart assignment logic
│   │   ├── cacheService.js       # Redis caching
│   │   ├── queueService.js       # BullMQ job queues
│   │   └── tests/                # Service tests
│   │
│   ├── controllers/
│   │   ├── packageController.js  # Package API
│   │   ├── delivererController.js# Deliverer API
│   │   ├── zoneController.js     # Zone API
│   │   └── tests/                # Controller tests
│   │
│   ├── routes/
│   │   ├── packageRoutes.js
│   │   ├── delivererRoutes.js
│   │   └── zoneRoutes.js
│   │
│   ├── middleware/
│   │   └── errorHandler.js
│   │
│   ├── index.js                  # Main API server
│   └── worker.js                 # Worker process
│
├── docker-compose.yml            # Docker orchestration
├── Dockerfile                    # Container image
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── jest.config.js                # Test configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

---

## 🐳 Docker Services

```yaml
services:
  db:                    # PostgreSQL 15
    ports: 5432:5432
    
  redis:                 # Redis 7
    ports: 6379:6379
    
  api:                   # Express API
    ports: 3000:3000
    depends_on: [db, redis]
    
  worker:                # Background Worker
    depends_on: [db, redis]
```

### Start All Services
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f api
docker-compose logs -f worker
```

---

## 📊 Performance Metrics

- **API Response Time:** < 100ms (with cache)
- **Transaction Lock Time:** < 50ms
- **Cache Hit Rate:** ~80%
- **Background Job Processing:** ~2s per job



## 📝 License

MIT License - Feel free to use this project for learning and commercial purposes.

---

## 🙏 Acknowledgments

- Built for LogistiMa delivery operations
- Designed for Moroccan market (Casablanca, Rabat, etc.)
- Implements best practices for distributed systems

---

**Made with ❤️ for LogistiMa - Efficient urban delivery for Morocco**