# ⚡ VZNX Technical Challenge: Project & Team Workspace Prototype

This repository contains the submission for the VZNX Technical Challenge, a functional prototype of a **Workspace Dashboard** designed to streamline project and team management for an architecture studio.

Built with **Next.js**, **TypeScript**, and **Tailwind CSS**, this minimal application demonstrates core data modeling, state management, and clear UI presentation for critical project and team data.

---

## ✨ Features Implemented

The prototype focuses on delivering the core requirements outlined in the brief, prioritizing **structure, simplicity, and clarity**.

### 🏗️ Project Dashboard

-   **Project Listing:** Displays a clear list of all projects.
-   **Core Data:** Each project shows its **Name**, **Status** (In Progress/Completed), and **Progress Bar** (%).
-   **CRUD Operations:** Allows for **Adding new projects**, **Editing** project progress, and **Deleting** projects.

### 📋 Task Management

-   **Nested View:** Clicking a project navigates to its dedicated task list.
-   **Task Details:** Each task displays its name and current **Status** (Incomplete/Complete).
-   **Status Toggle:** Users can easily toggle a task's completion status.
-   **Visual Updates:** Completed tasks receive a visual update (e.g., strikethrough).
-   **Progress Automation (Bonus):** The parent project's **Progress Bar updates automatically** when related tasks are marked complete.

### 🧑‍🤝‍🧑 Team Overview

-   **Team Roster:** Displays a list of all active team members.
-   **Workload Metrics:** Shows the **number of tasks assigned** to each member.
-   **Capacity Bar (Bonus):** A visual "capacity bar" represents the workload (e.g., 5 tasks = 100% capacity).
-   **Color Logic (Bonus):** Uses **color cues (Green/Orange/Red)** to visually indicate workload levels (Low, Moderate, High).

---

## 🔑 Login Credentials

Use the following credentials to access the application and test the different user roles:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin` |
| **Manager** | `manager` | `manager` |

---

## 🚀 Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js** (App Router) | React framework for robust structure and routing. |
| **Language** | **TypeScript** | Enhances code quality and maintainability with static type checking. |
| **Styling** | **Tailwind CSS** | Utility-first CSS for rapid and consistent styling. |
| **Database** | **MongoDB** | NoSQL database used for data persistence. |
| **Visualization** | **Recharts** | Used for potential future charts and data visualization. |

---

## 🏁 Getting Started

Follow these steps to run the project locally.

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/engromerbaig/vznx-workspace-dashboard.git](https://github.com/engromerbaig/vznx-workspace-dashboard.git)
    ```

2.  **Navigate to the project directory**
    ```bash
    cd vznx-workspace-dashboard
    ```

3.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Configure Environment Variables**
    Create a file named **`.env.local`** in the root directory and populate it with the following essential variables:

    ```bash
    # ----------------------------
    # 🗄️ MONGODB CONFIGURATION
    # ----------------------------
    MONGODB_URI=mongodb+srv://sconstechofficial:GPx9eypWSz8toI5z@cluster0.f2iymps.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
    MONGODB_DB_NAME=vznx

    # ----------------------------
    # 🔐 JWT / AUTHENTICATION SECRETS
    # ----------------------------
    # ⚠️ These must be long, random strings for security.
    ACCESS_TOKEN_SECRET=2b3e84cf9a57a3cdabf9e879f9b27a9d6b6715f4110cc7c312ecfd441f72be22
    REFRESH_TOKEN_SECRET=4a8a7f9b80efb9b74d232d3b4dc8e18a0b8f6a2caa3f1f67907b2c8e81dbf841
    
    # 🌐 APP URL (Crucial for development/production)
    NEXTAUTH_URL=http://localhost:3000
    ```

5.  **Run the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

6.  Open your browser to `http://localhost:3000` to view the application.

---

## 🧑‍💻 Developed By

Developed by **[Muhammad Omer Baig](https://omerbaig.netlify.app/)**

## 📬 Contact

For inquiries:
📧 [omerbaigde@gmail.com](mailto:omerbaigde@gmail.com)
🌐 [omerbaig.dev](https://omerbaig.netlify.app/)