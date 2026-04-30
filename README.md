#  Veltrix Commerce Ecosystem

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-05998b.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![AI-Powered](https://img.shields.io/badge/Intelligence-AI--Driven-ff69b4.svg?style=for-the-badge)](https://github.com/abhixw/Veltrix)

Veltrix is a premium, high-performance eCommerce ecosystem engineered for scale, security, and enterprise-grade intelligence. Beyond standard retail functions, Veltrix integrates **Three-Tier AI Recommendations**, **Sentiment Analysis**, and an **Autonomous Stock Intelligence Hub** to provide a state-of-the-art retail experience.

---

##  The Veltrix Edge

###  Triple-Engine AI Recommendations
Veltrix maximizes user engagement and Average Order Value (AOV) through a hybrid intelligence strategy:
- **Collaborative Engine:** Analyzes cross-user behavior patterns ("Customers who bought this also liked...").
- **Basket Co-occurrence:** Mathematically identifies products frequently purchased together in the same transaction.
- **Semantic Vibe-Mapping:** Utilizes NLP to suggest products with similar stylistic attributes and "vibes."

###  AI-Driven Sentiment Moderation
- **Real-Time NLP Analysis:** Every customer review is processed via `TextBlob` to assign a polarity score.
- **Sentiment Shield:** A dedicated Admin hub monitors the global "Store Vibe," identifying trends in positive vs. critical feedback.
- **Transactional Verification:** Fraud-resistant badge system that automatically verifies reviews from confirmed purchasers.

### Enterprise Promotional Engine
- **Atomic Discounting:** Supports both dynamic **Percentage** and fixed **Flat Rate** logic.
- **Usage Governance:** Sophisticated constraints including expiry tracking, global usage caps, and per-user redemption limits.
- **Live Cart Injection:** Seamless integration with the checkout flow for instantaneous price adjustments.

### Admin Tactical Command Center
- **Sales Velocity Analytics:** High-precision monitoring of stock turnover and high-performing categories.
- **Predictive Stock Alerts:** Automated high-visibility warnings triggered when inventory reaches critical thresholds.
- **Global Moderation Suite:** One-click review management and sentiment-based filtering.
- **SuperAdmin Hardening:** Hardcoded identity verification (`abhinavhshrimali12@gmail.com`) ensuring only authorized leadership can access tactical tools.

###  Responsive "Aura" Design System
- **Mobile-First Fluids:** A completely refactored layout that transforms from a desktop powerhouse into a sleek mobile app.
- **Adaptive Navigation:** Features horizontal category sliders and collapsible command menus for peak mobile accessibility.

---

##  Modern Tech Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Core** | Python / FastAPI | High-concurrency transactional processing |
| **AI Intelligence** | TextBlob / Custom Rec Engines | Sentiment & Behavioral modeling |
| **Frontend UI** | React 18 / Vite | Blazing fast reactive interface |
| **Persistence** | SQLite / SQLAlchemy ORM | ACID-compliant data integrity |
| **Security** | JWT / BCrypt | Encrypted auth & RBAC guarding |
| **Design Language** | Emerald Green & Midnight Blue | Premium, high-conversion visual identity |

---

##  Deployment & Installation

### 1. System Requirements
- **Python:** 3.9 or higher
- **Node.js:** Latest LTS
- **Browser:** Modern Chromium-based browser for best UI experience

### 2. Backend Orchestration
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Intelligence & Core dependencies
pip install fastapi uvicorn sqlalchemy python-multipart python-jose[cryptography] passlib[bcrypt] textblob

# Launch the Tactical API
uvicorn main:app --reload
```

### 3. Frontend Orchestration
```bash
cd frontend
npm install
npm run dev
```

---

##  Architecture Overview

```text
Veltrix/
├── backend/          # TRANSACTIONAL CORE
│   ├── models/       # Intelligence-aware SQLAlchemy entities (Review, Coupon, Recs)
│   ├── routers/      # Hardened REST API Gateway
│   ├── services/     # Recommendation & Business Strategy layer
│   └── uploads/      # Content Delivery Network (Product Media)
└── frontend/         # USER INTERFACE
    ├── src/
    │   ├── pages/    # AdminTactical, ReviewsHub, Orders, Checkout, etc.
    │   ├── App.jsx   # Context Orchestration & Responsive Routing
    │   └── index.css # "Aura" Design Tokens & Responsive Queries
```

---
**Veltrix Commerce — Engineering the future of retail.**
*Developed with precision to deliver a world-class shopping experience.*
