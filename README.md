# hextorq-finance-frontend

Frontend web application for the Revenue & Cost Tracker built with React 19, Vite, and Tailwind CSS.

## 🚀 Features
- **Transaction Overview**: Real-time tracking of revenue (Credit) and expenses (Debit).
- **Dynamic Aggregate Totals**: Automatic live calculations for Total Credit, Total Debit, and Net Balance.
- **Interactive Data Entry**: Modal form supporting Add and Edit operations with field validation.
- **Instant Search & Filter**: Real-time filter across descriptions, transaction types, remarks, and dates.
- **Production-Ready**: Configured for local development and instant deployment to Vercel.

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set `VITE_API_URL` to your backend URL:
```env
# Local backend
VITE_API_URL=http://localhost:8000

# Or production backend
# VITE_API_URL=https://hextorq-finance-backend.onrender.com
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 🌐 Deploy to Vercel
1. Import this repository into Vercel.
2. Set Environment Variable `VITE_API_URL` to your deployed backend URL.
3. Deploy!
