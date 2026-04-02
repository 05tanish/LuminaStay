
// 4. Added request body size limit to prevent payload attacks

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.js'

// Middleware
import globalErrorHandler from "./middleware/Error.Middleware.js"
import { requestLogger } from './middleware/requestLogger.middleware.js'

// Route modules
import authroute from './modules/Auth/Auth.Routes.js'
import adminRoutes from './modules/admin/Admin.Routes.js'
import userRoutes from './modules/user/User.Routes.js'
import foodroutes from './modules/Food/Food.Routes.js'
import complaintroutes from './modules/Complaint/Complaint.Routes.js'
import notificationRoutes from './modules/Notification/Notification.Routes.js'
import roomRoutes from './modules/Rooms/Room.Routes.js'
import hostelRoutes from './modules/Hostel/Hostel.Routes.js'
import superAdminRoutes from './modules/SuperAdmin/Superadmin.Routes.js'
import inviteRoutes from './modules/Invitesystem/Invite.Routes.js'
import paymentRoutes from './modules/Payment/Payment.Routes.js'

// Config
import { CORS_ORIGIN } from './config/env.js'
import AppError from './utils/AppError.js'

const App = express()

// Security headers — protects against common web vulnerabilities
// (XSS, clickjacking, MIME sniffing, etc.)
App.use(helmet());

App.use(cookieParser());

App.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

// Limit JSON body size to 10kb to prevent large payload attacks
App.use(express.json({ limit: '10kb' }))

// Structured request logging for all routes
App.use(requestLogger)

// Health check endpoint — used by load balancers and monitoring
App.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// ========== API Documentation ==========
App.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ========== API Routes ==========
App.use('/api/auth', authroute);
App.use("/api/admin", adminRoutes);
App.use("/api/user", userRoutes);
App.use("/api/food", foodroutes);
App.use("/api/complaint", complaintroutes);
App.use("/api/notification", notificationRoutes);
App.use("/api/rooms", roomRoutes);
App.use("/api/hostel", hostelRoutes);
App.use("/api/super-admin", superAdminRoutes);
App.use("/api/invite", inviteRoutes);
App.use("/api/payment", paymentRoutes);

// 404 handler for unregistered routes — returns a clear error instead
// of the default Express HTML response
App.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler — must be LAST middleware
App.use(globalErrorHandler)

export default App
