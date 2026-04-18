# PRESCAN

> **Tagline:** "Pre-deployment vulnerability scanner for safer web releases."

PRESCAN is a full-stack, browser-integrated cybersecurity project designed to identify potential security weaknesses before and after deployment. This platform enables developers to scan a target application URL or local development endpoint through a Chrome extension, classify findings by severity, and generate structured JSON reports.

## Project Architecture

This is a monorepo containing three main components:

1.  **Backend (`/backend`)**: A Spring Boot application providing REST APIs for scan execution, history tracking, and report generation. It uses a modular mock scanning engine and H2 in-memory database for seamless local development.
2.  **Frontend (`/frontend`)**: A React + Vite application featuring a modern, dark-themed cybersecurity dashboard built with Tailwind CSS. It visualizes scan results, severity metrics, and historical data.
3.  **Chrome Extension (`/extension`)**: A Manifest V3 Chrome extension that acts as a quick trigger interface for the backend scanner directly from the browser.

---

## 🚀 Setup Instructions

### 1. Backend (Spring Boot)
The backend runs on **Java 17** and uses an H2 in-memory database by default.
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Build and run the application using Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
3. The server will start at `http://localhost:8080`.
   - *H2 Console (optional):* `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:prescandb`, User: `sa`, Password: `<empty>`)

### 2. Frontend (React + Vite)
The frontend requires **Node.js**.
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard at `http://localhost:5173`.

### 3. Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right corner).
3. Click **Load unpacked**.
4. Select the `extension` folder inside the PRESCAN project directory.
5. Pin the PRESCAN extension to your toolbar.

---

## 🛠️ Usage Flow

1. Ensure both the **Backend** and **Frontend** servers are running.
2. Click the PRESCAN extension icon in your Chrome toolbar.
3. The extension will automatically populate the URL of your active tab. Click **Scan Application**.
4. Wait for the scan to complete. A desktop notification will appear, and the extension popup will update with a severity summary.
5. Click **Open Detailed Report** in the extension to automatically open the React Dashboard's Report view.
6. Explore the visual report, switch to the JSON view, or download the full JSON artifact.

---

## 📚 API Endpoints

- `POST /api/scans/start` - Trigger a new scan. Body: `{ "targetUrl": "https://example.com" }`
- `GET /api/scans/history` - Retrieve a list of all past scans.
- `GET /api/scans/{id}` - Retrieve details of a specific scan report.

---

## 🗄️ Database Schema

The H2 (or MySQL) database uses two primary entities:
- **ScanTask**: Stores `id`, `targetUrl`, `scanTimestamp`, `status`, `overallRiskScore`, and severity counts.
- **Finding**: Stores `id`, `title`, `description`, `severity` (HIGH/MEDIUM/LOW), `affectedEndpoint`, `evidence`, and `recommendation`. It has a Many-To-One relationship with `ScanTask`.

---

## 🌐 Live Demo

Frontend: https://prescan-f5t8mk9hb-swathi-2106s-projects.vercel.app 

---

## 🔒 Security Disclaimer
This tool is for **educational and defensive pre-deployment scanning**. The provided scanner modules utilize safe, non-destructive checks and mock indicators. Do not implement destructive payloads.
