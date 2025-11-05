# GymApp - Full-Stack Gym Management System

GymApp is a comprehensive, full-stack web application designed to centralize and modernize the administration of a fitness center. The system provides a complete solution for managing clients, employees, and instructors, handling everything from membership sales and class enrollment to secure check-ins and financial reporting.

## Project Origin

This application was conceived and developed as a school project for the 7th semester of the **Computer Systems Engineering** program at the **Tecnológico Superior de Jalisco**.

The primary goal was to apply modern web development principles (specifically the PERN stack) to solve a real-world problem: digitizing and automating the daily operations of a gym, moving away from manual spreadsheets and disconnected systems into a single, cohesive platform.

## Tech Stack

This project is built on the **PERN** (PostgreSQL, Express, React, Node.js) stack, utilizing Vite for a modern, high-speed frontend development experience.

### Frontend

* **React (v19)**: A declarative library for building interactive user interfaces.
* **Vite**: Next-generation frontend tooling that provides a faster and leaner development experience.
* **React Router (v7)**: For client-side routing and navigation.
* **Axios**: A promise-based HTTP client for making requests to the backend API.
* **Chart.js (`react-chartjs-2`)**: Used to render dynamic, responsive charts for the admin, client, and instructor dashboards.
* **React Toastify**: For displaying user-friendly, non-blocking notifications.
* **CSS Modules**: For locally scoped CSS, preventing style collisions between components.

### Backend

* **Node.js**: A JavaScript runtime environment for the server-side.
* **Express.js**: A minimal and flexible Node.js web application framework used to build the RESTful API.
* **PostgreSQL**: A powerful, open-source object-relational database system.
* **`pg` (node-postgres)**: The non-blocking PostgreSQL client for Node.js, used for all database queries.
* **`jsonwebtoken` (JWT)**: For generating and verifying stateless authentication tokens to secure the API.
* **`bcrypt`**: For securely hashing and comparing user passwords.

---

## Stack Rationale

The selection of this stack was driven by a focus on performance, scalability, and a modern development experience:

* **React with Vite** provides an extremely fast development server with Hot Module Replacement (HMR) and a highly optimized production build.
* **Node.js and Express** offer a lightweight and powerful foundation for building a RESTful API. This combination is ideal for handling business logic, authentication, and serving data to the client.
* **PostgreSQL** was chosen for its reliability, transactional integrity, and its strength in managing the complex relational data required for this application (e.g., users, memberships, class enrollments, payments, and visits).
* **Token-Based Authentication (JWT)** enables a secure and stateless system. The backend validates permissions for every API request, allowing the frontend to securely manage the user's session.

## Key Features

* **Role-Based Access Control (RBAC)**: A secure authentication system with three distinct user roles:
    * **Admin (Employee)**: Full CRUD control over all modules, including client, employee, and instructor management. Can sell memberships, create classes, and view financial reports.
    * **Instructor**: A dedicated dashboard to view their upcoming classes, and manage their assigned class rosters (viewing and removing enrolled clients).
    * **Client**: A personal dashboard to view their membership status, enroll in classes, and track their personal profile and attendance.

* **Barcode Check-In System**: A full-screen kiosk page designed for a barcode scanner. It provides instant visual feedback for successful check-ins, check-outs, or access-denied errors (like an expired membership).

* **Advanced Membership Logic**: A complete system for selling and renewing memberships. The backend automatically calculates new expiration dates when a client renews, correctly adding any remaining days from their previous membership to the new one.

* **Dynamic Dashboards**: Each role has a unique dashboard presenting relevant, real-time data using Chart.js.
    * **Admin Dashboard**: Shows KPIs like total clients, new clients this month, monthly revenue, active memberships, and class popularity.
    * **Client Dashboard**: Shows membership status, next upcoming class, and a graph of personal attendance for the month.
    * **Instructor Dashboard**: Shows their next class, number of enrolled students, and a graph of their most popular classes.

* **Financial Reporting**: Admins can generate a detailed report of all payments within a selected date range. This report can be viewed in the app or exported as a formatted PDF.
