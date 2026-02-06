#  Octafin: Real-Time Portfolio Analytics Engine

![Octafin Banner](https://via.placeholder.com/1200x400/000000/FFFFFF?text=OCTAFIN+PORTFOLIO+ANALYTICS)

> **Institutional-grade financial data at zero cost.** > A high-performance full-stack application that solves the "Latency vs. Accuracy" trade-off in financial tracking by decoupling real-time price feeds from fundamental data ingestion.

---

## 🔗 Live Demo
| Platform | Status | URL |
| :--- | :--- | :--- |
| **Frontend** (Vercel) |  Live | [**View Dashboard**](https://octafin-frontend.vercel.app) |
| **Backend** (Render) |  Live | [API Health Check](https://octafin-backend.onrender.com) |

*(Note: The backend is hosted on a free instance and may "sleep" after inactivity. Please allow 30-50 seconds for the first request to wake it up.)*

---

##  Tech Stack

### **Frontend**
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

### **Backend**
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![ExpressJS](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![Cheerio](https://img.shields.io/badge/Cheerio-e88c1f?style=for-the-badge)

### **Infrastructure & Deployment**
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Git](https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white)

---

##  The Architecture: Hybrid Data Pipeline

Most free financial APIs force a choice: **Fast & Dumb** (Live prices, no fundamentals) or **Slow & Smart** (Rich data, high latency). Octafin uses a hybrid approach to get both.

### 1. The Fast Path (Yahoo Finance Batch)
* **Problem:** Fetching 30 stocks individually results in the "N+1 Query Problem," taking ~12 seconds.
* **Solution:** Implemented **Batch Processing**. All holdings are aggregated into a single payload and fetched in **one HTTP request**.
* **Result:** Latency reduced to **<600ms**.

### 2. The Authority Path (Google Finance Scraper)
* **Problem:** Yahoo data for Indian markets is often stale/inaccurate for P/E and EPS.
* **Solution:** Built a custom ingestion engine using **Cheerio** to scrape authoritative data from Google Finance.
* **Optimization:** This runs asynchronously in the background. The user **never waits** for the scrape; they are served cached data immediately while the cache refreshes silently.

### 3. Real-Time WebSocket Feed
* **Implementation:** The server maintains a persistent `Socket.io` connection.
* **Efficiency:** Updates are pushed every 5 seconds **only if clients are connected**, reducing server load.
* **Visual Feedback:** The frontend compares ticks (`prevPrice` vs `currentPrice`) to flash Green/Red indicators, mimicking a Bloomberg/Binance terminal.

---

##  Getting Started Locally

This project is a **Monorepo**. You can run both the backend and frontend locally.

### Prerequisites
* Node.js (v18+)
* npm or yarn

### 1. Clone the Repository
```bash
git clone [https://github.com/shreenidhikattimani/octafin.git](https://github.com/shreenidhikattimani/octafin.git)
cd octafin

```

### 2. Setup Backend

```bash
cd backend
npm install

```

Create a `.env` file in `backend/`:

```env
PORT=5000
CLIENT_URL=http://localhost:3000

```

Start the server:

```bash
node server.js
# Runs on http://localhost:5000

```

### 3. Setup Frontend

Open a new terminal.

```bash
cd frontend
npm install

```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

```

Start the frontend:

```bash
npm run dev
# Open http://localhost:3000

```

---

##  Project Structure

```bash
/octafin
├── /backend
│   ├── /controllers   # Business logic (Hybrid Pipeline)
│   ├── /services      # Yahoo API & Google Scraper logic
│   ├── /routes        # Express routes
│   └── server.ts      # Entry point & Socket.io setup
│
├── /frontend
│   ├── /src/app       # Next.js App Router pages
│   ├── /src/hooks     # Custom hooks (usePortfolio)
│   ├── /src/components# UI Components
│   └── /src/types.ts  # Shared Type Definitions

```

---

##  Author

**Shreenidhi Kattimani** *Full Stack Developer & Systems Thinker*

---


```

```
