# AI-Powered Banking Compliance & RegTech Platform

An enterprise-grade, full-stack digital banking platform featuring real-time AI fraud detection, automated AML compliance monitoring, and a built-in AI Copilot for RegTech analytics.

Built with a scalable **Turborepo monorepo** architecture, a high-performance **Next.js 15** frontend, an **Express.js** API, and a **Prisma/PostgreSQL** database.

---

## 🚀 Key Features

* **Digital Banking Experience**: Minimalist, sleek "Stripe-inspired" interface for users to open accounts, view balances, and transfer funds.
* **Role-Based Access Control (RBAC)**: Secure authentication (JWT + NextAuth) with specialized views for `CUSTOMER`, `ADMIN`, `COMPLIANCE_OFFICER`, and `FRAUD_ANALYST`.
* **Real-time AI Fraud Engine**: Simulated machine learning risk scoring. Large or unusual transactions are automatically scored and flagged.
* **Compliance Officer Dashboard**: Dedicated AML (Anti-Money Laundering) monitoring queue for investigating high-risk transactions.
* **Fraud Analytics Dashboard**: Live feed of fraud detections, risk factor breakdown (geo-velocity, unusual volume), and real-time risk index heatmap.
* **AI Copilot (ChatGPT Interface)**: A built-in intelligent assistant that compliance officers can query. Integrates with the `openai` SDK to generate regulatory SAR (Suspicious Activity Reports) in one click based on current database flags.

---

## 🛠️ Tech Stack

### Frontend (`apps/web`)
* Next.js (App Router)
* React & TypeScript
* Tailwind CSS (Enterprise Black & White aesthetic)
* Framer Motion (Micro-animations)
* NextAuth (Authentication)
* Lucide React (Icons)
* Zustand (State management)

### Backend (`apps/api`)
* Node.js & Express.js
* TypeScript
* Zod (Schema validation)
* JWT & bcrypt (Security)
* OpenAI SDK (AI Copilot)

### Database (`packages/database`)
* PostgreSQL
* Prisma ORM

---

## 📂 Architecture (Turborepo)

```text
.
├── apps
│   ├── api              # Express backend server (Port 4000)
│   └── web              # Next.js frontend application (Port 3000)
├── packages
│   └── database         # Shared Prisma schema and generated TS client
├── turbo.json           # Turborepo task runner configuration
└── package.json         # Root workspace configuration
```

---

## 💻 Running Locally

### 1. Prerequisites
* Node.js (v18+)
* A PostgreSQL Database (Local or via [NeonDB](https://neon.tech/) / [Supabase](https://supabase.com/))

### 2. Environment Setup

Create `.env` files in the following locations:

**Root (`/.env`)** and **Database (`/packages/database/.env`)**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

**Backend API (`/apps/api/.env`)**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="generate-a-strong-secret-key"
PORT=4000
OPENAI_API_KEY="your-openai-key" # Optional. If omitted, the app will use a mock AI engine.
```

**Frontend (`/apps/web/.env.local`)**
```env
NEXTAUTH_SECRET="generate-another-strong-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 3. Installation & Database Sync
From the root directory, install the monorepo dependencies and push the schema to your database:
```bash
npm install
npx prisma db push --schema=./packages/database/prisma/schema.prisma
```

### 4. Start the Application
Run the Turborepo dev script from the root directory. This will start the database compiler, Express backend, and Next.js frontend concurrently.
```bash
npm run dev
```

* **Frontend**: `http://localhost:3000`
* **API**: `http://localhost:4000/api/health`

---

## 🌐 Deployment (Railway / Vercel)

1. **Database:** Create a PostgreSQL instance on Supabase/NeonDB.
2. **Backend (Railway):** Import the GitHub repo. Set Root Directory to `/`. Set Start Command to `npm run start --workspace=@banking/api`. Provide `DATABASE_URL` and `JWT_SECRET` in environment variables.
3. **Frontend (Vercel):** Import the GitHub repo. Vercel automatically detects `apps/web`. Add `NEXT_PUBLIC_API_URL` (pointing to your Railway URL) and `NEXTAUTH_SECRET` in environment variables.

---


##**Sample Images**
<img width="1918" height="916" alt="image" src="https://github.com/user-attachments/assets/cda0291b-1259-4949-be33-da50a22f12cc" />
<img width="1907" height="911" alt="image" src="https://github.com/user-attachments/assets/e0658ad3-3f83-4718-ae5b-860394d6d18d" />
<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/c2618678-2345-4241-b34e-cc5668cb8687" />
<img width="1918" height="1021" alt="image" src="https://github.com/user-attachments/assets/2d1038a1-1f64-4f68-9251-2d336e53af4f" />





*Designed and developed as a conceptual AI enterprise banking ecosystem.*
