# TradingCo — Paper Trading Platform

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

A production-grade mock trading platform that simulates real brokerage experience with simulated capital. Practice trading with real-time price simulation, advanced charting, portfolio tracking, and performance analytics — all without risking real money.

## Features

- 📊 **Real-time price simulation** via WebSocket (STOMP)
- 📈 **Professional charting** with TradingView Lightweight Charts
- 💼 **Portfolio tracking** with live P&L updates
- 📋 **Order simulation** — Market, Limit, Stop-Loss with realistic fills
- 🔍 **Market screener** — Top gainers, losers, most active
- 📰 **Simulated news feed** with sentiment analysis
- 📉 **Performance analytics** — Win rate, Sharpe ratio, equity curve
- 📓 **Trade journal** — Strategy tags, notes, ratings
- 🛡️ **Risk management** — Daily loss limits, position sizing
- 🌙 **Professional dark theme** — Trading terminal aesthetics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Zustand + Lightweight Charts |
| Backend | Spring Boot 3.3 + Java 21 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| WebSocket | STOMP over SockJS |
| Auth | JWT (access + refresh tokens) |

## Quick Start

### Prerequisites
- Java 21+
- Node.js 20+
- Docker & Docker Compose

---

### Option A: Full Stack Docker Compose (Recommended)
You can run the entire application, including databases, backend, and frontend, with a single command:

1. **Build and start all services**:
   ```bash
   docker-compose up --build -d
   ```
2. **Access the application**:
   - **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8080](http://localhost:8080)
   - **API Documentation (Swagger)**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
3. **Shutdown**:
   ```bash
   docker-compose down
   ```

---

### Option B: Local Development
If you want to run services individually for hot-reloading:

1. **Start the database and cache in the background**:
   ```bash
   docker-compose up postgres redis -d
   ```
2. **Run the Spring Boot backend**:
   ```bash
   cd tradingco-backend
   ./mvnw spring-boot:run
   ```
   *Runs at: http://localhost:8080*

3. **Run the React frontend**:
   ```bash
   cd tradingco-frontend
   npm install
   npm run dev
   ```
   *Runs at: http://localhost:5173*

## Project Structure

```
TradingCo/
├── tradingco-backend/          # Spring Boot API
│   ├── src/main/java/com/tradingco/
│   │   ├── auth/               # Authentication & JWT
│   │   ├── market/             # Price simulation & quotes
│   │   ├── trading/            # Orders & execution
│   │   ├── portfolio/          # Portfolio & P&L
│   │   ├── analytics/          # Performance metrics
│   │   └── ...
│   └── src/main/resources/
│       └── db/migration/       # Flyway SQL migrations
├── tradingco-frontend/         # React SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route pages
│   │   ├── store/              # Zustand stores
│   │   ├── api/                # API client layer
│   │   └── hooks/              # Custom React hooks
│   └── public/
├── docker-compose.yml          # PostgreSQL + Redis
└── README.md
```

## Git Workflow

- `main` — Production-ready releases
- `develop` — Integration branch
- `feature/*` — Feature branches

## Author

**stranger0407** — [GitHub](https://github.com/stranger0407)

## License

MIT
