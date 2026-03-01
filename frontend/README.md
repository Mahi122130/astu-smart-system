# 🛠️ ASTU Smart Complaint & Issue Tracking System

An AI-powered digital platform designed for **Adama Science and Technology University (ASTU)** to streamline student grievances, campus facility issues, and administrative workflows.



## 🌟 Key Features
* **Role-Based Portals:** Separate workflows for Students (Submit), Staff (Resolve), and Admins (Manage Analytics).
* **AI Assistant:** Powered by **Gemini 2.5 Flash** to assist students in drafting, refining, and categorizing complaints.
* **Smart Tracking:** Real-time status updates (Open, In-Progress, Resolved) with automated notifications for students and staff.
* **Evidence Uploads:** Integrated support for image and document attachments via Multer and cloud-ready path handling.
* **Analytics Dashboard:** Comprehensive administrative overview of campus issue trends and resolution rates.

## 🚀 Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide React
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB Atlas via **Prisma 6**
- **AI Integration:** Google Generative AI (Gemini SDK)
- **Deployment:** Render (Backend), Vercel/Render (Frontend)



## 📋 Installation & Local Setup

### 1. Prerequisites
- Node.js v18+ 
- MongoDB Atlas Account
- Google AI Studio API Key (for Gemini)

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file and add your credentials
# PORT=5000
# DATABASE_URL="mongodb+srv://..."
# JWT_SECRET="your_secret"
# GEMINI_API_KEY="your_key"

# Initialize Prisma and start the server
npx prisma generate
npx prisma db push
npm run dev