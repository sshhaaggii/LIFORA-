# Implementation & Code Quality Review — LIFORA Backend

## 1. Overview
This review presents detailed code quality, security control, and architectural observations for the backend implementation across all component routes, database models, and middleware.

---

## 2. Review Findings & Technical Observations

### Finding 1: Unsalted Single-Round Password Hashing
* **File**: [auth.js](file:///c:/Users/Shagithiyan%20N/OneDrive/Desktop/PROJECTS/LIFORA/backend/src/routes/auth.js#L8-L10)
* **Component**: Authentication Service (`/api/auth/register`, `/api/auth/login`)
* **Observation**: Passwords are hashed using standard SHA-256 (`crypto.createHash('sha256').update(password).digest('hex')`) without salt or iteration stretch.
* **Why It Matters**: SHA-256 is designed for fast cryptographic verification and is vulnerable to precomputed lookup tables (rainbow tables) and rapid GPU-assisted cracking.
* **Recommendation**: Replace SHA-256 with `bcrypt` (or `argon2id`) using a salt factor of 12 or higher.

```js
// Recommended pattern with bcrypt
const bcrypt = require('bcrypt');
const pwdHash = await bcrypt.hash(password, 12);
```

---

### Finding 2: Token Verification Fallback Bypass
* **File**: [verifyToken.js](file:///c:/Users/Shagithiyan%20N/OneDrive/Desktop/PROJECTS/LIFORA/backend/src/middleware/verifyToken.js#L22-L28)
* **Component**: Authentication Middleware (`verifyToken`)
* **Observation**: When an invalid or unknown token is sent in the `Authorization` header, `verifyToken` constructs a dummy fallback user object (`req.user = { uid: token, ... }`) and calls `next()`, treating the request as authenticated.
* **Why It Matters**: Any client can supply an arbitrary string in the Authorization header and successfully pass authentication checks for protected routes (`/api/sos/trigger`, `/api/location/update`, etc.).
* **Recommendation**: Return a strict `401 Unauthorized` response when `!user`.

```js
// Recommended pattern
if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
}
```

---

### Finding 3: Token Architecture Based on Static Database UUIDs
* **File**: [auth.js](file:///c:/Users/Shagithiyan%20N/OneDrive/Desktop/PROJECTS/LIFORA/backend/src/routes/auth.js#L48)
* **Component**: Token Issuer
* **Observation**: The server returns the user's permanent database `uid` as the session `token`.
* **Why It Matters**: Static tokens cannot expire, cannot be revoked independently of identity, and lack cryptographic signatures verifying payload integrity.
* **Recommendation**: Adopt standard signed JSON Web Tokens (JWT) with explicit short lifetimes (`expiresIn: '1h'`) and refresh token rotation.

---

### Finding 4: Missing Input Schema Validation & Type Checking
* **File**: [location.js](file:///c:/Users/Shagithiyan%20N/OneDrive/Desktop/PROJECTS/LIFORA/backend/src/routes/location.js#L12-L14)
* **Component**: Location API (`/api/location/update`)
* **Observation**: Inputs like `latitude` and `longitude` are checked only for existence (`!= null`), but not validated as numeric coordinates (e.g., latitude between -90 and 90, longitude between -180 and 180).
* **Why It Matters**: Malformed coordinate inputs can disrupt database queries or cause invalid coordinate renderings on mobile UI clients.
* **Recommendation**: Enforce runtime schema validation using a validation library such as `zod`.

---

### Finding 5: Permissive CORS Configuration
* **File**: [index.js](file:///c:/Users/Shagithiyan%20N/OneDrive/Desktop/PROJECTS/LIFORA/backend/src/index.js#L20)
* **Component**: HTTP Server Middleware
* **Observation**: `app.use(cors())` enables cross-origin resource sharing for all domains (`*`).
* **Why It Matters**: In production, unconstrained CORS policies allow unauthorized third-party websites to interact with API endpoints from a user's browser.
* **Recommendation**: Explicitly specify allowed origins from environment variables.

```js
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3000',
    credentials: true
}));
```

---

### Finding 6: Missing Security HTTP Response Headers
* **File**: [index.js](file:///c:/Users/Shagithiyan%20N/OneDrive/Desktop/PROJECTS/LIFORA/backend/src/index.js#L19-L23)
* **Component**: Express Application Configuration
* **Observation**: Security headers such as `X-Content-Type-Options`, `X-Frame-Options`, and `Content-Security-Policy` are absent from HTTP responses.
* **Why It Matters**: Lacking standard security headers leaves web clients vulnerable to MIME-sniffing, clickjacking, or cross-site scripting risks.
* **Recommendation**: Add `helmet` middleware to set standard defensive HTTP headers.

```js
const helmet = require('helmet');
app.use(helmet());
```

---

### Finding 7: Lack of Rate Limiting Throttling
* **File**: [index.js](file:///c:/Users/Shagithiyan%20N/OneDrive/Desktop/PROJECTS/LIFORA/backend/src/index.js#L19-L23)
* **Component**: Middleware Stack
* **Observation**: Authentication endpoints (`/api/auth/login`, `/api/auth/register`) do not implement rate limiting.
* **Why It Matters**: Endpoints are vulnerable to automated high-volume credential guessing or Denial-of-Service (DoS) bursts.
* **Recommendation**: Integrate `express-rate-limit` on sensitive routes.
