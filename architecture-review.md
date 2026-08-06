# Architecture Review — LIFORA Backend

## 1. Executive Overview
The **LIFORA Backend** is a Node.js REST API service built with Express.js (v5.2.1) and powered by an embedded SQLite database via `better-sqlite3`. It provides authentication, emergency SOS tracking, real-time location updating, AI chat history logging, and multilingual translation processing for the LIFORA mobile and web clients.

---

## 2. Technology Stack & Framework Discovery

| Component | Technology / Library | Version / Details |
| :--- | :--- | :--- |
| **Runtime Environment** | Node.js | CommonJS (`require`) |
| **Web Framework** | Express.js | `^5.2.1` |
| **Database** | SQLite 3 | Embedded DB (`better-sqlite3` v13.0.2 with WAL mode) |
| **Authentication** | Custom UID-based / Plain SHA-256 | Static string user identity tokens (`user.uid`) |
| **Configuration** | `dotenv` | `^17.4.2` |
| **CORS** | `cors` middleware | Wildcard origin enabled (`cors()`) |

---

## 3. Core Architectural Patterns & Data Flow

```
                                +-------------------+
                                | Mobile / Web Client|
                                +---------+---------+
                                          |
                                    HTTP / REST
                                          |
                                          v
                              +-----------+-----------+
                              | Express.js Server     |
                              | (CORS, Static Files)  |
                              +-----------+-----------+
                                          |
                                  +-------+-------+
                                  |  Middleware   |
                                  | (verifyToken) |
                                  +-------+-------+
                                          |
        +------------------+--------------+--------------+------------------+
        |                  |                             |                  |
        v                  v                             v                  v
+---------------+  +---------------+             +---------------+  +---------------+
| /api/auth     |  | /api/sos      |             | /api/location |  | /api/ai       |
+-------+-------+  +-------+-------+             +-------+-------+  +-------+-------+
        |                  |                             |                  |
        +------------------+--------------+--------------+------------------+
                                          |
                                          v
                              +-----------+-----------+
                              | SQLite Database       |
                              | (lifora.db - WAL)     |
                              +-----------------------+
```

---

## 4. Key Architectural Observations

### A. Authentication & Session Management Architecture
* **Token Representation**: Currently, authentication tokens returned during registration/login are simply the database record's static `uid` (`crypto.randomUUID()`).
* **Lack of Expiration & Cryptographic Signing**: Tokens are not cryptographically signed JSON Web Tokens (JWT) or session identifiers stored in a server-side session cache (e.g., Redis). A leaked UID allows perpetual impersonation until deleted from DB.
* **Password Cryptography**: Passwords are hashed using single-round, unsalted SHA-256 (`crypto.createHash('sha256')`). Modern standard practices require memory-hard password hashing functions such as Argon2id or bcrypt with appropriate salt rounds.

### B. Authorization & Access Control
* **Role-Based Controls**: A `role` column (`PATIENT`, `DOCTOR`, etc.) exists in the `users` table schema, but route handlers do not enforce role authorization checks before serving resources.
* **Token Fallback Behavior**: The `verifyToken` middleware permits unauthenticated or invalid tokens to proceed by populating a default generic user object (`req.user = { uid: token, name: 'User', role: 'PATIENT' }`), effectively bypassing token verification for endpoints wrapped in `verifyToken`.

### C. Input Validation & Data Hygiene
* Input parsing relies primarily on standard Express body parsing (`express.json()`). 
* Schema validation mechanisms (such as `zod`, `joi`, or `express-validator`) are absent. Data types (e.g., latitude/longitude bounds) are not verified prior to database operations.

### D. CORS & Security Headers
* `cors()` is instantiated without an explicit origin whitelist, permitting requests from any origin (`*`).
* Security headers (e.g., `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`) are not automatically set via security header middleware like `helmet`.

### E. Rate Limiting & Throttling
* Rate limiting middleware (such as `express-rate-limit`) is not configured, leaving login, registration, and SOS trigger endpoints open to high-frequency automated requests.
