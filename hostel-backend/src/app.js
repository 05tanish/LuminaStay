import express from 'express'
import cors from 'cors'
import globalErrorHandler from "./middelware/Error.Middleware.js"
import cookieParser from 'cookie-parser'
import authroute from '../src/routes/auth/Auth.Routes.js'

const App = express()

App.use(cookieParser()); 
App.use(cors({ origin: true, credentials: true }))
App.use(express.json())

App.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

App.use('/api/auth', authroute)
App.use(globalErrorHandler)

export default App
