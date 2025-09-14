# JavaScript Module System

This document describes the JavaScript module system used in the HexTrackr frontend.

---

## Overview

The frontend uses ES6 modules to organize and manage JavaScript code.

- **`shared/`**: Contains reusable components and utility functions.
- **`pages/`**: Contains page-specific logic.
- **`utils/`**: Contains utility functions that can be used across the application.

---

## State Management

The application uses a simple state management pattern.

- **Global State**: A global `appState` object is used to store application-wide state.
- **Page-specific State**: Each page manages its own state.

---

## Real-time Updates

The frontend uses Socket.io to receive real-time updates from the server.

- **`socket.js`**: A dedicated module handles the Socket.io connection and event handling.
