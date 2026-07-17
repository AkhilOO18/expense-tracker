# Ledger — Expense Tracker
🔗 **Live demo:** [expense-tracker-zeta-two-92.vercel.app](https://expense-tracker-zeta-two-92.vercel.app)

A full-stack expense tracker: track income and expenses, and visualize your
spending with charts.

**Stack:** React (Vite) · Node.js · Express · MongoDB · Chart.js · JWT auth

See [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) for full architecture, API
contract, environment variables, and deployment instructions.

## Quick start

```bash
# 1. Backend
cd server
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm install
npm run dev

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173, create an account, and start logging transactions.
