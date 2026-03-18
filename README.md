# ManageMySubs — Subscription Seller Management

A full-stack web application for subscription sellers to manage their client subscriptions, track payments, handle renewals and replacements, monitor reminders, and view sales/profit reports.

## Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- Zustand (global state)
- TanStack Query (server state)
- React Hook Form + Zod (forms/validation)
- Lucide React (icons)
- date-fns (date utilities)
- Axios (HTTP client)

### Backend
- Express.js v5
- MongoDB + Mongoose v9
- JWT Authentication (jsonwebtoken + bcryptjs)
- Zod validation
- node-cron (scheduled reminders)
- helmet, cors, morgan (security/logging)

## Project Structure

```
ManageMySubs/
├── README.md
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── app.js              # Express app setup
│       ├── server.js           # Entry point
│       ├── config/             # Environment & DB config
│       ├── models/             # Mongoose schemas
│       ├── controllers/        # Route handlers
│       ├── services/           # Business logic
│       ├── routes/             # API route definitions
│       ├── middlewares/        # Auth, validation, errors
│       ├── validators/         # Zod schemas
│       ├── jobs/               # Cron jobs (reminders)
│       └── utils/              # Helpers, response, templates
└── frontend/
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css           # Tailwind imports + theme
        ├── api/                # Axios API modules
        ├── components/         # Reusable UI & feature components
        ├── hooks/              # TanStack Query hooks
        ├── pages/              # Route page components
        ├── router/             # Route definitions & guards
        ├── store/              # Zustand stores
        └── utils/              # Date helpers, formatters, constants
```

## Features

- **Multi-seller accounts** — each seller signs up and only sees their own data
- **Subscription categories** — create and manage categories (Netflix, Prime Video, etc.)
- **Client subscriptions** — full CRUD with duration types (monthly/yearly/custom)
- **Status tracking** — active, expiring_soon, expired, in_replacement, replacement_completed, cancelled
- **Payment tracking** — pending/paid/partially_paid with amounts and methods
- **Replacement system** — partial_paid and full_replacement_only flows with day calculations
- **Renewal flow** — renew from existing subscription with prefilled data and history tracking
- **Reminder system** — auto-generated reminders via cron for expiring, expired, payment pending, etc.
- **Dashboard** — 12 stat cards: active, expiring, expired, reminders, sales, profit, replacements, payments, renewals
- **Reports** — daily/monthly sales and profit breakdown with category grouping
- **Client timeline** — activity history per subscription (created, renewed, replacement, payment, etc.)
- **Message templates** — WhatsApp-style copyable templates for common client communications
- **Tags & notes** — optional tagging (VIP, urgent, late payer, etc.) and notes per subscription
- **Archive/soft delete** — archive instead of hard delete for categories and subscriptions
- **Search & filters** — search by name/email/phone, filter by status/payment/category/expiry/date range
- **Mobile-first UI** — bottom navigation, card-based layout, clean forms

## Setup

### Prerequisites

- **Node.js** v18 or later
- **MongoDB** running locally or a cloud MongoDB Atlas URI

### Project Layout

The repository is split into two apps:

- `backend/` contains the Express API, MongoDB models, validation, business logic, and the reminder cron job.
- `frontend/` contains the React application, routing, forms, state management, and mobile-first UI.

### Backend Environment

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/manage-my-subs
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Create a real `.env` file in `backend/` using the values from `backend/.env.example`, then adjust:

- `MONGODB_URI` to your MongoDB database.
- `JWT_SECRET` to a strong private secret.
- `FRONTEND_URL` to the URL where the frontend will run.

The backend exposes the API at `http://localhost:5000` by default and starts the reminder scheduler automatically.

### Frontend Environment

```env
VITE_API_URL=http://localhost:5000/api
```

Create a real `.env` file in `frontend/` using `frontend/.env.example`.

The frontend points to the backend API through `VITE_API_URL`. The current UI styling is configured to work without the missing Vite Tailwind plugin dependency that originally broke startup.

### Running The App

After dependencies are installed on your machine and both `.env` files are in place:

1. Start the backend application from `backend/`.
2. Start the frontend application from `frontend/`.
3. Open the frontend in your browser and create a seller account.

This README intentionally avoids shell install commands so the setup can match your preferred package workflow.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new seller |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Categories (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| GET | `/api/categories/:id` | Get category |
| PUT | `/api/categories/:id` | Update category |
| PATCH | `/api/categories/:id/archive` | Toggle archive |

### Subscriptions (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions` | List with search/filter/pagination |
| POST | `/api/subscriptions` | Create subscription |
| GET | `/api/subscriptions/:id` | Get with computed fields |
| PUT | `/api/subscriptions/:id` | Update subscription |
| PATCH | `/api/subscriptions/:id/archive` | Toggle archive |
| POST | `/api/subscriptions/:id/renew` | Renew subscription |
| PATCH | `/api/subscriptions/:id/payment` | Update payment |
| POST | `/api/subscriptions/:id/replacements` | Issue replacement |
| GET | `/api/subscriptions/:id/replacements` | List replacements |
| GET | `/api/subscriptions/:id/timeline` | Activity timeline |

### Reminders (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | List (filter by period/type/status) |
| PATCH | `/api/reminders/:id/complete` | Mark complete |
| PATCH | `/api/reminders/:id/dismiss` | Dismiss |

### Dashboard & Reports (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Summary stats |
| GET | `/api/reports/sales` | Sales report (daily/monthly) |
| GET | `/api/reports/profit` | Profit report by category |

## Data Models

- **User** — seller account (name, email, hashed password)
- **SubscriptionCategory** — subscription types per seller
- **ClientSubscription** — full subscription record with dates, pricing, status, payment
- **Replacement** — replacement records with type, days, and date tracking
- **Reminder** — auto-generated reminders with type, due date, and message templates
- **ActivityLog** — timeline entries for each subscription action

## Reminder Cron Job

The backend runs a cron job every 6 hours that:
1. Scans all non-archived subscriptions.
2. Resolves the effective lifecycle state first.
3. Persists status updates once, including replacement completion.
4. Upserts reminders for expiring soon, expired, renewal due, replacement completed, and payment pending follow-up.

An initial run also executes 5 seconds after server start.

## Security And Ownership

- Every protected backend resource is scoped by `userId` from the authenticated JWT.
- Categories, subscriptions, reminders, replacements, dashboard data, reports, and activity history are all isolated per seller.
- Passwords are hashed with `bcryptjs` before persistence.
- Helmet, CORS, centralized error handling, and request validation are enabled in the API.

## Product Notes

- Replacement flow supports both `partial_paid` and `full_replacement_only`.
- Renewal creates a fresh subscription cycle while preserving activity history.
- Search supports client name, email, and phone.
- Filters support lifecycle, payment state, category, archive state, and expiring windows.
- Reminder messages are copy-friendly and seller-facing quick actions are available in the UI.

## License

ISC
