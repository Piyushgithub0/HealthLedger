# HealthLedger – Smart Healthcare

## Overview
HealthLedger is a comprehensive, full-stack smart healthcare application leveraging modern web technologies. This repository contains both the frontend application and the backend server in a single cohesive workspace.

## Project Structure

### Frontend (`src/`)
- **Framework**: React 19 with TypeScript.
- **Build Tool**: Vite for fast, optimized development experience and builds.
- **Styling**: Tailwind CSS for responsive and customizable designs.
- **Features**: Interactive maps (`leaflet`, `react-leaflet`), data visualization (`recharts`), QR code support, and modern UI components using Radix UI and Lucide React.
- **Routing**: Handled by React Router v7.

### Backend (`server/`)
- **Environment**: Node.js and Express.js REST API.
- **Database**: MongoDB (via Mongoose).
- **Authentication**: Secure user authentication using JWT (`jsonwebtoken`) and password hashing (`bcryptjs`).
- **Integrations**: 
  - Generative AI responses utilizing `Mistral AI`.
  - Dynamic PDF generation (`pdfkit`).
  - Email integrations (`nodemailer`).

---

## Running the Project Locally

Because this is a full-stack project, you need to run both the frontend and the backend simultaneously in **two separate terminal windows** for the app to function properly.

### 1. Prerequisites
- **Node.js** (v22.12.0 or higher)
- **MongoDB** (Local or Cloud MongoDB connection depending on your configuration).
- Create a `.env` file inside the `server/` directory and add your required environment variables (e.g., Database URI, JWT Secret, Mistral API Key).

### 2. Install Dependencies
Run the following at the root of the project to install all required dependencies:
```bash
npm install
```

### 3. Start the Backend Server (Terminal 1)
Open a terminal at the project root and start the backend Express server. This will listen for incoming API requests:
```bash
npm run server
```

### 4. Start the Frontend Dev Server (Terminal 2)
Open a **new** terminal window at the project root and start the Vite frontend.
```bash
npm run dev
```
Navigate to the local URL provided in this terminal (usually `http://localhost:5173`) to view the application in your browser.

---

## ⚠️ Troubleshooting: Vite Proxy Errors

**Common Error Phrase**: `[vite] http proxy error: ...`

If you encounter proxy errors in your frontend terminal (or see `502`/`504 Bad Gateway` / `ECONNREFUSED` responses in your browser's network tab for API requests), **it means your frontend application is trying to communicate with the backend, but your backend server is not running or is unresponsive.**

### How to resolve it:
1. Ensure you have a terminal window open that is successfully running the backend using `npm run server`.
2. Check your backend terminal for any crash logs or database connection errors.
3. Make sure your `server/.env` is correctly populated with the needed environment variables so the server will start fully.
4. Once the backend terminal logs confirm the server is running, refresh your browser page. The proxy error should disappear.

---
Need help or want to join the community? Join our [Discord](https://discord.gg/shDEGBSe2d).
