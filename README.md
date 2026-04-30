# Veltrix Commerce 🚀

Veltrix is a premium, full-stack eCommerce platform engineered for speed, security, and a high-end shopping experience. Built with a modern **FastAPI** backend and a sleek **React** frontend, it features a transactional core loop including persistent shopping carts, inventory management, and automated order processing.

---

## ✨ Key Features

### 🛍️ Shopping Experience
- **Premium UI/UX:** A stunning, Orange-themed interface inspired by modern high-end marketplaces (Vibe Commerce aesthetic).
- **Categorical Navigation:** A sticky vertical sidebar for seamless browsing through Electronics, Lifestyle, Men's/Women's clothing, and more.
- **Real-Time Search:** Live global search functionality across product names and descriptions.
- **Dynamic Catalog:** Real-time product counts per category and status indicators (In Stock / Out of Stock).

### 🛒 Cart & Checkout
- **Cloud-Persisted Cart:** Items are saved to the database per user, ensuring your cart follows you across sessions.
- **Interactive Management:** Quick adjust quantity (+/-) and surgical item removal with instantaneous subtotal recalculation.
- **Transactional Checkout:** Atomic order processing with stock validation and row-level database locking to prevent overselling.
- **Shipping Entry:** Dedicated checkout flow with shipping address collection and secure payment simulation.

### 📜 User & Admin Management
- **Role-Based Access (RBAC):** Separate interfaces for **Users** (Shoppers) and **Managers** (Admins).
- **Manager Dashboard:** Specialized portal for managers to upload inventory, set prices, and manage stock with automated image processing.
- **Order History:** Comprehensive receipt-style order tracking with historical price snapshots.
- **Secure Auth:** JWT-based authentication system with encrypted password storage.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Python / FastAPI |
| **Frontend** | React (Vite) / Vanilla CSS |
| **Database** | PostgreSQL / SQLAlchemy ORM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Icons** | Lucide React |
| **Typography** | Google Fonts (Outfit) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js & npm
- PostgreSQL

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies(if requirements.txt exists)
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-multipart python-jose[cryptography] passlib[bcrypt]

# Run the server
uvicorn main:app --reload
```
*The backend runs at `http://127.0.0.1:8000`*

### 3. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Run development server
npm run dev
```
*The frontend runs at `http://localhost:5173`*

---

## 📂 Project Structure

```text
Veltrix/
├── backend/
│   ├── models/       # SQLAlchemy Database Models
│   ├── routers/      # FastAPI REST API Endpoints
│   ├── schemas/      # Pydantic Data Structures
│   ├── uploads/      # Static Media (Product Images)
│   └── main.py       # Application Entry Point
└── frontend/
    ├── src/
    │   ├── pages/    # React View Components (Cart, Orders, etc.)
    │   ├── App.jsx   # Routing Logic
    │   └── index.css # Premium Design System
```

---

## 🔒 Security & Performance
- **Transactional Integrity:** Uses ACID-compliant transactions for checkout.
- **Static File Optimization:** Product images are served via mounted static directories for low-latency delivery.
- **Responsive Design:** Edge-to-edge layout optimization for desktops and tablets.

---
*Veltrix Commerce — Engineering the future of retail.*
