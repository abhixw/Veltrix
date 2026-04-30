# Veltrix Commerce 🚀

Veltrix is a premium, high-performance eCommerce ecosystem engineered for scale, security, and intelligence. Beyond standard retail functions, Veltrix integrates **AI-driven recommendations**, **Sentiment Analysis**, and a **Stock Intelligence Hub** to provide a state-of-the-art enterprise retail experience.

---

## ✨ Advanced Intelligence & Features

### 🧠 Triple-Engine AI Recommendations
Veltrix uses a hybrid recommendation strategy to maximize user engagement:
- **Collaborative Filtering:** Analyzes "Customers who bought this also liked..." patterns.
- **Co-occurrence Analysis:** Identifies products frequently purchased together in the same basket.
- **Semantic Mapping:** Suggests products with a "Similar Vibe" using description-based pattern matching.

### 🎭 Feedback & Sentiment Analysis
- **AI Sentiment Moderation:** Reviews are automatically analyzed using `TextBlob` to assign sentiment scores.
- **Sentiment Shield:** Admins can monitor global customer sentiment trends (Positive vs. Critical) from a central hub.
- **Verified Purchase Badging:** Automatically tags reviews from users who have completed a transaction for the product.

### 🎟️ Promotional & Coupon Engine
- **Flexible Discounting:** Supports both **Percentage** (e.g., 20% off) and **Flat Rate** (e.g., $10 off) logic.
- **Usage Governance:** Enforces expiry dates, maximum usage limits, and per-user redemption constraints.
- **Real-Time Validation:** Instant subtotal updates in the checkout flow upon coupon application.

### 📊 Admin Intelligence Hub
- **Sales Velocity Tracking:** Real-time monitoring of turnover and best-selling inventory.
- **Stock Alert System:** High-visibility warnings for low-stock items.
- **Review Moderation Hub:** Centralized portal to delete or moderate feedbacks across all products.
- **SuperAdmin Hardening:** Strict role-based hardening restricting sensitive operations to a designated master account.

### 📱 Responsive & Mobile-First
- **Adaptive Layouts:** Fully refactored CSS Grid/Flexbox system that adapts seamlessly from ultra-wide monitors to mini smartphones.
- **Mobile Navigation:** Interactive horizontal category sliders and collapsible menus for peak mobile UX.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Python / FastAPI |
| **Intelligence** | TextBlob (NLP) / Recommendation Micro-services |
| **Frontend** | React (Vite) / Mobile-Responsive CSS |
| **Database** | SQLite (Development) / SQLAlchemy ORM |
| **Authentication** | JWT (JSON Web Tokens) with Role-Based Guarding |
| **Design System** | Vibe Commerce Aesthetic (Emerald Green / Deep Blue) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js & npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Core & Intelligence Dependencies
pip install fastapi uvicorn sqlalchemy python-multipart python-jose[cryptography] passlib[bcrypt] textblob

# Run the server
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
Veltrix/
├── backend/
│   ├── models/       # Intelligence-aware SQLAlchemy Models (Review, Coupon, Recs)
│   ├── routers/      # Hardened REST API Endpoints
│   ├── services/     # Recommendation & Business Logic Layer
│   └── uploads/      # Static Media (Product Images)
└── frontend/
    ├── src/
    │   ├── pages/    # AdminHub, Favorites, ReviewsHub, Checkout, etc.
    │   ├── App.jsx   # Global Context & Responsive Routing
    │   └── index.css # Premium Design Language & Media Queries
```

---
*Veltrix Commerce — Engineering the future of retail.*
