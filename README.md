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
# System Architecture & Diagrams

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Client["👤 Client Layer"]
        Browser["Browser<br/>(Customer / Admin / Compliance / Fraud Analyst)"]
    end

    subgraph Frontend["apps/web — Next.js 15 (Port 3000)"]
        UI["App Router UI<br/>Tailwind + Framer Motion"]
        NextAuthFE["NextAuth<br/>Session Handling"]
        Zustand["Zustand<br/>Client State"]
        Copilot["AI Copilot UI<br/>(ChatGPT-style Interface)"]
    end

    subgraph External["🤖 External AI Service"]
        OpenAI["OpenAI SDK<br/>SAR Report Generation"]
    end

    subgraph Backend["apps/api — Express.js (Port 4000)"]
        Auth["Auth Middleware<br/>JWT + bcrypt"]
        RBAC["RBAC Guard<br/>(CUSTOMER / ADMIN /<br/>COMPLIANCE_OFFICER / FRAUD_ANALYST)"]
        Validation["Zod Schema<br/>Validation"]
        FraudEngine["Fraud Detection Engine<br/>(Risk Scoring Simulation)"]
        Routes["REST Routes<br/>/accounts /transactions /flags"]
    end

    subgraph Data["packages/database"]
        Prisma["Prisma ORM"]
        Postgres[("PostgreSQL<br/>Users · Accounts · Transactions · Flags")]
    end

    Browser --> UI
    UI --> NextAuthFE
    UI --> Zustand
    UI --> Copilot

    Copilot -- "Direct API call<br/>(flagged transaction context)" --> OpenAI
    UI -- "HTTPS / REST" --> Routes

    Routes --> Auth
    Auth --> RBAC
    RBAC --> Validation
    Validation --> FraudEngine
    Validation --> Prisma
    FraudEngine --> Prisma
    Prisma --> Postgres

    Copilot -. "fetch flagged data<br/>to build prompt" .-> Routes

    style Browser fill:#1a1a1a,color:#fff,stroke:#fff
    style OpenAI fill:#10a37f,color:#fff,stroke:#fff
    style Postgres fill:#336791,color:#fff,stroke:#fff
    style FraudEngine fill:#b91c1c,color:#fff,stroke:#fff
    style RBAC fill:#1a1a1a,color:#fff,stroke:#fff
```


---

## 🔐 RBAC & Authentication Flow

```mermaid
flowchart TD
    Start(["User Visits App"]) --> Login["Login Form<br/>(NextAuth Credentials)"]
    Login --> Verify{"Verify Credentials<br/>JWT + bcrypt"}

    Verify -- "❌ Invalid" --> Reject["Reject<br/>Show Error"]
    Verify -- "✅ Valid" --> IssueToken["Issue JWT<br/>(role embedded in payload)"]

    IssueToken --> CheckRole{"Decode Role"}

    CheckRole -- "CUSTOMER" --> CustomerView["Customer Dashboard<br/>• View Balances<br/>• Transfer Funds<br/>• Open Accounts"]
    CheckRole -- "ADMIN" --> AdminView["Admin Dashboard<br/>• User Management<br/>• System Settings"]
    CheckRole -- "COMPLIANCE_OFFICER" --> ComplianceView["Compliance Dashboard<br/>• AML Monitoring Queue<br/>• AI Copilot (SAR Gen)<br/>• Investigate Flags"]
    CheckRole -- "FRAUD_ANALYST" --> FraudView["Fraud Analytics Dashboard<br/>• Live Detection Feed<br/>• Risk Index Heatmap<br/>• Geo-Velocity Breakdown"]

    CustomerView --> Middleware["Every Subsequent Request<br/>→ RBAC Guard Middleware"]
    AdminView --> Middleware
    ComplianceView --> Middleware
    FraudView --> Middleware

    Middleware --> Allowed{"Role Permitted<br/>for Route?"}
    Allowed -- "Yes" --> Resource["Serve Protected Resource"]
    Allowed -- "No" --> Forbidden["403 Forbidden"]

    style Verify fill:#1a1a1a,color:#fff,stroke:#fff
    style ComplianceView fill:#b91c1c,color:#fff,stroke:#fff
    style FraudView fill:#b91c1c,color:#fff,stroke:#fff
    style Forbidden fill:#7f1d1d,color:#fff,stroke:#fff
```

---

## ⚡ Real-time Fraud Detection Sequence

```mermaid
sequenceDiagram
    actor Customer
    participant Web as Next.js (apps/web)
    participant API as Express API
    participant Engine as Fraud Engine
    participant DB as PostgreSQL
    participant Analyst as Fraud Analyst Dashboard
    participant Officer as Compliance Officer
    participant AI as OpenAI SDK

    Customer->>Web: Initiate Transfer
    Web->>API: POST /transactions (JWT)
    API->>API: Validate (Zod) + RBAC Guard
    API->>Engine: Score Transaction<br/>(amount, geo-velocity, volume)

    alt Risk Score Low
        Engine->>DB: Save Transaction (status: CLEARED)
        DB-->>Web: 200 OK — Transfer Complete
    else Risk Score High
        Engine->>DB: Save Transaction (status: FLAGGED)
        Engine->>DB: Create Risk Flag Record
        DB-->>Analyst: Live Feed Update<br/>(Risk Heatmap + Breakdown)
        DB-->>Officer: New Item in AML Monitoring Queue
        Web-->>Customer: Transfer Pending Review
    end

    Officer->>Officer: Opens AI Copilot
    Officer->>Web: Request SAR Draft for Flag #X
    Web->>API: GET /flags/:id (fetch context)
    API->>DB: Query Flag + Transaction Details
    DB-->>API: Flagged Data
    API-->>Web: Return Context JSON
    Web->>AI: Direct call with flagged context<br/>(no backend in this hop)
    AI-->>Web: Generated SAR Report
    Web-->>Officer: Render SAR for Review/Submission
```

---

## 🗄️ Database Entity-Relationship Diagram

```mermaid
erDiagram
    USER {
        string id PK
        string email
        string passwordHash
        string name
        enum role "CUSTOMER | ADMIN | COMPLIANCE_OFFICER | FRAUD_ANALYST"
        datetime createdAt
    }

    ACCOUNT {
        string id PK
        string userId FK
        string accountNumber
        decimal balance
        enum accountType
        datetime createdAt
    }

    TRANSACTION {
        string id PK
        string senderAccountId FK
        string receiverAccountId FK
        decimal amount
        enum status "PENDING | CLEARED | FLAGGED | REJECTED"
        float riskScore
        datetime createdAt
    }

    FLAG {
        string id PK
        string transactionId FK
        string reviewedById FK
        enum riskFactor "GEO_VELOCITY | UNUSUAL_VOLUME | HIGH_AMOUNT | OTHER"
        enum flagStatus "OPEN | UNDER_REVIEW | RESOLVED | ESCALATED"
        text notes
        datetime createdAt
    }

    SAR_REPORT {
        string id PK
        string flagId FK
        string generatedById FK
        text content
        enum submissionStatus "DRAFT | SUBMITTED"
        datetime createdAt
    }

    USER ||--o{ ACCOUNT : "owns"
    ACCOUNT ||--o{ TRANSACTION : "sends (sender)"
    ACCOUNT ||--o{ TRANSACTION : "receives (receiver)"
    TRANSACTION ||--o| FLAG : "may trigger"
    USER ||--o{ FLAG : "reviewed by (Compliance/Fraud)"
    FLAG ||--o| SAR_REPORT : "generates"
    USER ||--o{ SAR_REPORT : "generated by (Compliance Officer)"
```

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
