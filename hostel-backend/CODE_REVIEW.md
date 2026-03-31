# 🔍 CODE REVIEW — Hostel Backend (Node.js + Express + Prisma)

> **Reviewer**: Senior Backend Engineer (Automated Review)
> **Date**: 2026-03-30
> **Scope**: Full codebase — security, architecture, bugs, scalability, and production readiness

---

## Summary

| Category | Issues | Critical | Fixed |
|----------|--------|----------|-------|
| **Crash Bugs** | 14 | 14 | ✅ 14 |
| **Security** | 7 | 5 | ✅ 7 |
| **Architecture** | 8 | 3 | ✅ 8 |
| **Scalability** | 6 | 2 | ✅ 6 |
| **Missing Features** | 5 | 2 | ✅ 5 |
| **Total** | **40** | **26** | **✅ 40** |

---

## 🔴 Critical Bugs (Crash-Causing)

### 1. `AppError.js` — ReferenceError on every error
| | |
|---|---|
| **File** | `src/utils/AppError.js` |
| **Issue** | Constructor references `this.errors = errors` but `errors` is not a parameter |
| **Impact** | Every `throw new AppError(...)` crashes the app with `ReferenceError: errors is not defined` |
| **Fix** | Added `errors = null` as optional 3rd constructor parameter |
| **Best Practice** | Always validate constructor parameters match usage |

### 2. `Admin.Services.js` — Duplicate imports + undefined variable
| | |
|---|---|
| **File** | `src/modules/admin/Admin.Services.js` |
| **Issue** | Lines 1-3 and 6-8 are identical imports. `updateroleservice` uses `actor` variable that's never passed |
| **Impact** | Duplicate import causes module error; `actor` causes ReferenceError on role update |
| **Fix** | Removed duplicates, added `actor` as parameter, aligned function name with controller |
| **Best Practice** | Function signatures should match their callers; no dead code |

### 3. `Admin.Controller.js` — Missing actor argument
| | |
|---|---|
| **File** | `src/modules/admin/Admin.Controller.js` |
| **Issue** | `updateroleservice(userId, role)` — missing `req.user` actor argument |
| **Impact** | Service crashes trying to access `actor.role` |
| **Fix** | Changed to `updateroleservice(userId, role, req.user)` |

### 4. `Admin.Routes.js` — Wrong import path
| | |
|---|---|
| **File** | `src/modules/admin/Admin.Routes.js` |
| **Issue** | Imports from `../../middlewares/` (with trailing 's'), directory is `../../middleware/` |
| **Impact** | Module not found — entire admin route tree fails to load |
| **Fix** | Changed to `../../middleware/` |

### 5. `Complaint.Service.js` — 3 separate bugs
| | |
|---|---|
| **File** | `src/modules/Complaint/Complaint.Service.js` |
| **Issue 1** | `complaintservice` uses `id` (undefined) in `data: { id, title, description }` |
| **Issue 2** | `deletecomplaintservice` uses wrong field name `userid` in Prisma where clause |
| **Issue 3** | No authorization — any user could update/delete any complaint |
| **Impact** | Complaint creation fails; deletion fails; security vulnerability |
| **Fix** | Changed to `userId: userid`, fixed field name, added ownership checks |

### 6. `Payment.Routes.js` — 3 critical errors
| | |
|---|---|
| **File** | `src/modules/Payment/Payment.Routes.js` |
| **Issue 1** | Line 14: `app.use(...)` — `app` is not defined in this file |
| **Issue 2** | Imports `getUserPayments` etc. from `PaymentWebhook.Controller` instead of `Payment.Controller` |
| **Issue 3** | `authorize("Admin")` — wrong casing, enum is `"ADMIN"` |
| **Impact** | File crashes on import; routes never register |
| **Fix** | Removed `app.use` line, fixed import source, fixed role casing |

### 7. `PaymentWebhook.Controller.js` — Default vs named import
| | |
|---|---|
| **File** | `src/modules/Payment/PaymentWebhook.Controller.js` |
| **Issue** | `import asyncHandler from ...` but asyncHandler is a named export |
| **Impact** | `asyncHandler` is `undefined`, middleware registration fails |
| **Fix** | Changed to `import { asyncHandler } from ...` |

### 8. `PaymentWebhook.Routes.js` — Missing extension + no export
| | |
|---|---|
| **File** | `src/modules/Payment/PaymentWebhook.Routes.js` |
| **Issue** | Import missing `.js` extension; no `export default router` |
| **Impact** | Module resolution fails in ESM; router cannot be imported |
| **Fix** | Added `.js` extension and `export default router` |

### 9. `Superadmin.Routes.js` — Undefined function
| | |
|---|---|
| **File** | `src/modules/SuperAdmin/Superadmin.Routes.js` |
| **Issue** | `authorizeHostelRole(...)` used but never imported |
| **Impact** | ReferenceError crashes the route registration |
| **Fix** | Added import for `authorizeHostelRole` from middleware |

### 10. `Room.Routes.js` — Wrong role casing
| | |
|---|---|
| **File** | `src/modules/Rooms/Room.Routes.js` |
| **Issue** | `authorize("Admin")` — should be `"ADMIN"` |
| **Impact** | All admin room operations silently reject valid admins |
| **Fix** | Changed to `"ADMIN"` |

### 11. `server.js` — Missing prisma import
| | |
|---|---|
| **File** | `src/server.js` |
| **Issue** | `prisma.$disconnect()` called in shutdown handler but `prisma` not imported |
| **Impact** | Graceful shutdown crashes with ReferenceError |
| **Fix** | Added `import { prisma } from './config/db.js'` |

### 12. `Otpverification.Service.js` — 3 bugs
| | |
|---|---|
| **File** | `src/modules/Auth/Otpverification.Service.js` |
| **Issue 1** | `import redis from ...` (default) but redis.js exports `{ redis }` (named) |
| **Issue 2** | Attempt tracking happens AFTER OTP comparison — brute force not rate-limited |
| **Issue 3** | catch block converts all errors to 503, masking "Invalid OTP" (400) errors |
| **Impact** | Redis client is undefined; rate limiting doesn't work; user-facing errors hidden |
| **Fix** | Fixed import, moved attempt tracking before comparison, removed error-swallowing catch |

### 13. `Food.Service.js` — Missing transaction argument
| | |
|---|---|
| **File** | `src/modules/Food/Food.Service.js` |
| **Issue** | `upsertMenuService(date, meals, tx)` requires `tx` but daily controller doesn't pass it |
| **Impact** | `tx.food.upsert(...)` crashes because `tx` is undefined |
| **Fix** | Made `tx` optional with `prisma` as fallback: `const db = tx \|\| prisma` |

### 14. `User.Schema.js` — Wrong enum casing
| | |
|---|---|
| **File** | `src/modules/user/User.Schema.js` |
| **Issue** | Zod enum `["admin", "user"]` — DB uses `"ADMIN"`, `"USER"` |
| **Impact** | Validation passes but Prisma rejects the values |
| **Fix** | Changed to `["SUPER_ADMIN", "ADMIN", "STAFF", "USER"]` |

---

## 🟡 Security Issues

### 15. Exposed credentials in `.env`
| | |
|---|---|
| **Issue** | Real DB URL, Redis token, and JWT secret are in `.env` |
| **Impact** | If `.env` is committed to Git, credentials are exposed to anyone with repo access |
| **Fix** | Created `.env.example` with placeholder values. **User must rotate all secrets.** |

### 16. CORS allows any origin
| | |
|---|---|
| **Issue** | `cors({ origin: true })` accepts requests from any domain |
| **Impact** | Cross-site attacks possible from any website |
| **Fix** | Changed to `cors({ origin: CORS_ORIGIN })` with configurable env var |

### 17. Cookie `secure` hardcoded to `false`
| | |
|---|---|
| **Issue** | JWT cookies set `secure: false` — cookies sent over HTTP |
| **Impact** | Cookies can be intercepted in transit on production (HTTPS) servers |
| **Fix** | Set `secure: IS_PRODUCTION` — true in production, false in development |

### 18. No security headers
| | |
|---|---|
| **Issue** | No protection against XSS, clickjacking, MIME sniffing |
| **Impact** | Common web vulnerabilities exploitable |
| **Fix** | Added `helmet` middleware for comprehensive security headers |

### 19. User enumeration in login
| | |
|---|---|
| **Issue** | "User not found" vs "Password does not match" reveals whether an email exists |
| **Impact** | Attacker can discover valid email addresses |
| **Fix** | Both cases now return generic "Invalid email or password" |

### 20. No body size limit
| | |
|---|---|
| **Issue** | `express.json()` accepts unlimited payload size |
| **Impact** | Attackers can send massive payloads to exhaust server memory |
| **Fix** | Added `express.json({ limit: '10kb' })` |

### 21. `crypto` npm package installed
| | |
|---|---|
| **Issue** | `crypto` is a built-in Node.js module — the npm package is deprecated and unnecessary |
| **Impact** | Supply chain risk from unnecessary third-party dependency |
| **Fix** | Removed from `package.json` |

---

## 🟠 Architecture Issues

### 22. No env validation
| | |
|---|---|
| **Issue** | Missing env vars cause cryptic runtime errors instead of clear startup failures |
| **Fix** | `env.js` now validates all required vars and throws descriptive errors at startup |

### 23. Weak global error handler
| | |
|---|---|
| **Issue** | Only handled Prisma P2002 error. JWT errors, validation errors, and programming errors not handled |
| **Fix** | Now handles: Prisma (P2002, P2025, P2003), JWT (invalid, expired), Zod, and hides stack traces in production |

### 24. No structured logging
| | |
|---|---|
| **Issue** | Scattered `console.log/error` with no timestamps, levels, or structure |
| **Fix** | Created `logger.js` utility with ERROR/WARN/INFO/DEBUG levels and JSON metadata |

### 25. No request logging
| | |
|---|---|
| **Issue** | No visibility into incoming requests - impossible to debug or monitor |
| **Fix** | Created `requestLogger.middleware.js` with timing, URL, status, and IP logging |

### 26. Missing Zod validation on most endpoints
| | |
|---|---|
| **Issue** | `Admin.Schema.js` was empty; only User module had schemas (with wrong values) |
| **Fix** | Created Zod schemas for all 9 modules: Admin, Food, Complaint, Hostel, Room, Payment, Invite, Notification |

### 27. Duplicated role hierarchy logic
| | |
|---|---|
| **Issue** | Role levels `{ SUPER_ADMIN: 3, ADMIN: 2, USER: 1 }` defined in 3 places |
| **Fix** | Centralized in `Admin.Services.js` as `ROLE_LEVELS` constant |

### 28. HostelRole middleware not async-safe
| | |
|---|---|
| **Issue** | `authorizeHostelRole` is async but not wrapped in `asyncHandler` |
| **Impact** | Thrown errors become unhandled promise rejections and crash the process |
| **Fix** | Wrapped inner function in `asyncHandler` |

### 29. Five routes never mounted
| | |
|---|---|
| **Issue** | Room, Hostel, SuperAdmin, Invite, and Payment routes defined but never registered in `app.js` |
| **Impact** | These endpoints are completely unreachable |
| **Fix** | Added all 5 route modules to `app.js` |

---

## 🔵 Scalability Issues

### 30–35. No pagination on list endpoints
| | |
|---|---|
| **Issue** | All `findMany` queries return unbounded results |
| **Impact** | As data grows, responses become slow and memory-heavy |
| **Endpoints Fixed** | `getUserNotifications`, `getUnreadNotifications`, `getcomplaintservice`, `getUserPaymentHistory`, `getAllPayments`, `getAllHostels` |
| **Fix** | Added `page`, `limit`, `skip`, `take` with standardized pagination response |

---

## 🟢 Additional Improvements

| # | Improvement | Details |
|---|---|---|
| 36 | Added production start script | `npm start` runs `node src/server.js` |
| 37 | Added graceful shutdown | Prisma + Redis disconnect, shutdown timeout, unhandled rejection/exception handlers |
| 38 | Added 404 handler | Unregistered routes return structured JSON error instead of HTML |
| 39 | Added audit logging utility | `audit.js` for tracking admin actions |
| 40 | Added complaint ownership checks | Users can only update/delete their own complaints |
| 41 | Added notification ownership check | Users can only mark their own notifications as read |
| 42 | Added fee ownership check | Users can only create payment orders for their own fees |
| 43 | Cash payment wrapped in transaction | Payment record + fee status update are now atomic |
| 44 | Hostel update field whitelisting | Prevents arbitrary field injection via req.body |
| 45 | RESTful complaint routes | DELETE/PUT now use URL params instead of request body |

---

## Recommendations for Next Steps

1. **Rotate all secrets** — DB URL, Redis token, JWT secret, Razorpay keys
2. **Add a test framework** — Vitest or Jest for unit and integration tests
3. **Add rate limiting on auth routes** — The rate limiter exists but isn't applied to login/register
4. **Consider refresh tokens** — Current 7-day JWT has no revocation mechanism
5. **Add database indexes** — Review query patterns and add indexes for common lookups
6. **Set up CI/CD** — Automated linting, testing, and deployment pipeline
7. **Add API documentation** — Swagger/OpenAPI for frontend team
8. **Consider TypeScript** — Catches many of the bugs found in this review at compile time
