import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.js'
import { globalErrorHandler } from "./middleware/Error.Middleware.js"
import { requestLogger } from './middleware/requestLogger.middleware.js'
import { authRouter } from './modules/Auth/Auth.Routes.js'
import { adminRouter } from './modules/admin/Admin.Routes.js'
import { userRouter } from './modules/user/User.Routes.js'
import { foodRouter } from './modules/Food/Food.Routes.js'
import { complaintRouter } from './modules/Complaint/Complaint.Routes.js'
import { notificationRouter } from './modules/Notification/Notification.Routes.js'
import { roomRouter } from './modules/Rooms/Room.Routes.js'
import { hostelRouter } from './modules/Hostel/Hostel.Routes.js'
import { superAdminRouter } from './modules/SuperAdmin/Superadmin.Routes.js'
import { inviteRouter } from './modules/Invitesystem/Invite.Routes.js'
import { paymentRouter } from './modules/Payment/Payment.Routes.js'
import { CORS_ORIGIN } from './config/env.js'
import { AppError } from './utils/AppError.js'

export const App = express()

App.use(helmet());
App.use(cookieParser());
App.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
App.use(express.json({ limit: '10kb' }))
App.use(requestLogger)

App.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

App.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
App.use('/api/auth', authRouter);
App.use("/api/admin", adminRouter);
App.use("/api/user", userRouter);
App.use("/api/food", foodRouter);
App.use("/api/complaint", complaintRouter);
App.use("/api/notification", notificationRouter);
App.use("/api/rooms", roomRouter);
App.use("/api/hostel", hostelRouter);
App.use("/api/super-admin", superAdminRouter);
App.use("/api/invite", inviteRouter);
App.use("/api/payment", paymentRouter);

App.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

App.use(globalErrorHandler)
