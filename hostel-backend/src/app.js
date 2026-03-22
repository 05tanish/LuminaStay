import express from 'express'
import cors from 'cors'
import globalErrorHandler from "./middleware/Error.Middleware.js"
import cookieParser from 'cookie-parser'
import authroute from './modules/Auth/Auth.Routes.js'
import adminRoutes from './modules/admin/Admin.Routes.js'
import userRoutes from './modules/user/User.Routes.js'
const App = express()

App.use(cookieParser());
App.use(cors({ origin: true, credentials: true }))
App.use(express.json())

App.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})
App.use("/api/admin", adminRoutes);
App.use('/api/auth', authroute);
App.use("/api/user", userRoutes);
App.use(globalErrorHandler)

export default App
