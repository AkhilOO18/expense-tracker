# Expense Tracker — Project Reference & Architecture Guide (RAG)

This file is the single source of truth for the project: stack, data model, API
contract, folder layout, environment variables, and deployment steps. Keep it
updated as the app changes — it's what you (or an AI assistant) should read
first to get full context on the project without re-explaining it.

## 1. Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Frontend   | React 18 (Vite), React Router, Axios, Chart.js (react-chartjs-2) |
| Backend    | Node.js, Express                                  |
| Database   | MongoDB (MongoDB Atlas in production)             |
| Auth       | JWT (JSON Web Tokens) + bcrypt password hashing    |
| Deployment | Frontend → Vercel, Backend → Render, DB → MongoDB Atlas |

## 2. Monorepo layout

```
expense-tracker/
├── server/                 # Express API
│   ├── config/db.js        # Mongo connection
│   ├── models/             # Mongoose schemas (User, Transaction)
│   ├── middleware/auth.js  # JWT verification middleware
│   ├── controllers/        # Route logic
│   ├── routes/             # Express routers
│   ├── server.js           # App entry point
│   ├── .env.example
│   └── package.json
├── client/                 # React app
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with base URL + token header
│   │   ├── context/AuthContext.jsx
│   │   ├── components/         # Reusable UI (forms, charts, navbar, list)
│   │   ├── pages/               # Login, Register, Dashboard
│   │   ├── App.jsx, main.jsx
│   │   └── styles/
│   ├── .env.example
│   └── package.json
└── PROJECT_SPEC.md         # This file
```

## 3. Data models

### User
| Field     | Type   | Notes                       |
|-----------|--------|------------------------------|
| name      | String | required                    |
| email     | String | required, unique            |
| password  | String | hashed with bcrypt          |
| createdAt | Date   | auto                        |

### Transaction
| Field       | Type                    | Notes                              |
|-------------|-------------------------|-------------------------------------|
| user        | ObjectId (ref: User)    | owner of the transaction            |
| type        | String enum: income/expense | required                       |
| category    | String                  | e.g. Food, Rent, Salary, Freelance  |
| amount      | Number                  | required, positive                  |
| description | String                  | optional                            |
| date        | Date                    | defaults to now                     |
| createdAt   | Date                    | auto                                |

## 4. API contract

Base URL: `/api`

### Auth (`/api/auth`)
| Method | Endpoint         | Body                          | Auth | Description        |
|--------|------------------|--------------------------------|------|---------------------|
| POST   | /register        | `{ name, email, password }`    | No   | Create account       |
| POST   | /login           | `{ email, password }`          | No   | Returns `{ token, user }` |
| GET    | /me              | —                               | Yes  | Return logged-in user |

### Transactions (`/api/transactions`) — all require `Authorization: Bearer <token>`
| Method | Endpoint      | Body / Query                                  | Description                  |
|--------|---------------|-------------------------------------------------|-------------------------------|
| GET    | /             | query: `type, category, from, to`               | List current user's transactions |
| POST   | /             | `{ type, category, amount, description, date }` | Create transaction            |
| PUT    | /:id          | any updatable field                             | Update transaction            |
| DELETE | /:id          | —                                                | Delete transaction            |
| GET    | /summary      | query: `from, to`                                | Totals, category breakdown, monthly trend for charts |

`/summary` response shape:
```json
{
  "totalIncome": 12000,
  "totalExpense": 8400,
  "balance": 3600,
  "byCategory": [ { "category": "Food", "type": "expense", "total": 2200 } ],
  "monthly": [ { "month": "2026-06", "income": 6000, "expense": 4200 } ]
}
```

## 5. Environment variables

### server/.env
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/expense-tracker
JWT_SECRET=<a long random string>
CLIENT_URL=http://localhost:5173
```

### client/.env
```
VITE_API_URL=http://localhost:5000/api
```

In production, `CLIENT_URL` becomes your Vercel domain, and `VITE_API_URL`
becomes your Render backend URL.

## 6. Local development

```bash
# Backend
cd server
npm install
npm run dev        # nodemon, http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev         # http://localhost:5173
```

## 7. Deployment

### MongoDB Atlas
1. Create a free cluster → Database Access → add a user with password.
2. Network Access → allow access from anywhere (`0.0.0.0/0`) for Render.
3. Copy the connection string into `MONGO_URI`.

### Backend → Render
1. Push code to GitHub.
2. Render → New → Web Service → connect the repo, root directory `server`.
3. Build command: `npm install`. Start command: `node server.js`.
4. Add env vars (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`) in Render dashboard.
5. Deploy → copy the resulting URL (e.g. `https://expense-tracker-api.onrender.com`).

### Frontend → Vercel
1. Vercel → New Project → import the same repo, root directory `client`.
2. Framework preset: Vite.
3. Add env var `VITE_API_URL=https://<your-render-url>/api`.
4. Deploy → copy the resulting URL, then set it as `CLIENT_URL` in Render (for CORS) and redeploy the backend.

## 8. Status / next steps checklist

- [x] Backend scaffolded (auth + transactions + summary)
- [x] Frontend scaffolded (auth pages + dashboard + charts)
- [ ] Push to GitHub
- [ ] Set up MongoDB Atlas cluster
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Point frontend env var at live backend, redeploy
