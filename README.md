# 🚀 StorePilot AI

AI-Powered Shopify Store Copilot built with Next.js, TypeScript, MongoDB, Redux Toolkit, Shopify GraphQL APIs, and OpenAI.

StorePilot AI helps Shopify merchants optimize product SEO using AI-powered workflows while maintaining scalable multi-store SaaS architecture.

---

# ✨ Features

## 🔐 Authentication System

- JWT Authentication
- Access & Refresh Tokens
- Silent Session Refresh
- Protected Routes
- HttpOnly Cookies
- Redux Session Persistence

---

## 🛍 Shopify Store Integration

- Shopify OAuth Flow
- Secure Store Connection
- Multi-Store Architecture
- Access Token Management
- Shopify GraphQL Integration

---

## 🔄 Product Synchronization

- Cursor-Based Pagination
- Chunk-Based Product Sync
- Lightweight Product Caching
- Multi-Tenant Product Isolation
- Optimized Sync Architecture

---

## 🤖 AI SEO Generation

- AI-Powered SEO Title Generation
- AI Meta Description Generation
- Google Search Preview
- Shopify SEO Sync
- OpenAI / OpenRouter Integration

---

# 🧠 MVP Workflow

```txt
Connect Shopify Store
        ↓
Sync Products
        ↓
Select Product
        ↓
Generate AI SEO
        ↓
Preview SEO
        ↓
Save SEO Back To Shopify
```

---

# 🏗 Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Redux Toolkit

---

## Backend

- Next.js API Routes
- MongoDB
- Mongoose
- JWT Authentication

---

## Shopify

- Shopify OAuth
- Shopify GraphQL Admin API

---

## AI

- OpenAI
- OpenRouter

---

# 📦 Folder Structure

```txt
app
│
├── api
│   └── v1
│       ├── auth
│       ├── shopify
│       └── ai
│
├── components
│
├── config
│
├── helpers
│   └── shopify
│
├── lib
│
├── models
│
├── redux
│
├── utils
│
└── graphql
```

---

# 🔐 Authentication Architecture

StorePilot AI uses a production-grade JWT authentication system.

## Features

- Access Tokens
- Refresh Tokens
- Silent Refresh Flow
- Session Persistence
- Secure HttpOnly Cookies

---

# 🛍 Shopify OAuth Flow

```txt
Merchant enters store URL
        ↓
OAuth redirect to Shopify
        ↓
Merchant approves permissions
        ↓
Callback handled
        ↓
Store access token stored securely
```

---

# 🔄 Product Sync Architecture

Products are synced using scalable cursor-based pagination.

## Why?

Some Shopify stores contain:

- 100 products
- 1,000 products
- 10,000+ products

Traditional sync methods can:
- timeout
- overload memory
- create server bottlenecks

---

## Solution

StorePilot AI uses:

- Cursor Pagination
- Chunk Synchronization
- Lightweight Product Cache

---

## Sync Flow

```txt
Sync Request
        ↓
Fetch 250 Products
        ↓
Store Optimized Metadata
        ↓
Return nextCursor
        ↓
Continue Until Complete
```

---

# 🧠 Lightweight Product Cache Strategy

Instead of fully mirroring Shopify product data, StorePilot AI stores only optimized metadata:

- title
- handle
- featured image
- SEO title
- SEO description
- product status
- timestamps

---

# Why?

Benefits:

✅ lower database cost  
✅ scalable architecture  
✅ faster dashboard rendering  
✅ AI-ready product workflow  
✅ optimized synchronization  

Shopify remains the source of truth.

---

# 🤖 AI SEO Workflow

StorePilot AI integrates AI to optimize Shopify product SEO.

## AI Workflow

```txt
Fetch Product
        ↓
Generate AI SEO
        ↓
Preview SEO
        ↓
Save SEO To Shopify
```

---

# 🧪 Current MVP Features

## Completed

- Authentication System
- Shopify OAuth
- Product Sync
- Product Dashboard
- Single Product Page
- AI SEO Generation
- SEO Google Preview
- Save SEO Back To Shopify

---

# 📈 Future Roadmap

## Planned Features

- Shopify Webhooks
- Background Queue Workers
- Bulk AI SEO Generation
- SEO History
- AI Recommendations
- Product Analytics
- Auto SEO Optimization
- Multi-Store Dashboard
- AI Agent Workflows

---

# 🛡 Scalability Decisions

StorePilot AI was intentionally designed with scalable architecture principles.

## Key Decisions

- Minimal Product Cache
- Cursor Pagination
- Chunk Sync Engine
- Multi-Tenant Isolation
- Shopify As Source Of Truth
- AI-Optimized Product Storage

---

# 🎨 UI/UX Design

The platform uses:

- modern SaaS UI
- pastel purple branding
- minimal AI-first dashboard design
- responsive layouts
- clean typography
- scalable dashboard architecture

---

# ⚙️ Environment Variables

Create:

```env
MONGODB_URI=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=

SHOPIFY_SCOPES=

OPENROUTER_API_KEY=
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/imaditya-jain/EverM-re.git
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Add Environment Variables

Create `.env.local`

---

## 4. Run Development Server

```bash
npm run dev
```

---

# 🧠 Engineering Highlights

This project demonstrates:

- scalable SaaS architecture
- Shopify ecosystem integration
- GraphQL API integration
- AI workflow orchestration
- production authentication architecture
- cursor-based synchronization
- multi-tenant backend architecture
- AI-first product engineering

---

# 📌 Project Vision

StorePilot AI aims to become an intelligent Shopify AI Copilot capable of:

- AI SEO optimization
- intelligent product recommendations
- automated store optimization
- AI-powered ecommerce workflows
- scalable AI agents for Shopify merchants

---

# 👨‍💻 Author

Aditya Jain

GitHub:
https://github.com/imaditya-jain

Repository:
https://github.com/imaditya-jain/StorePilot-AI

---

# ⭐ Support

If you found this project useful, consider starring the repository.