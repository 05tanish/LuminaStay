import express from 'express'
import cors from 'cors'
import globalErrorHandler from "../middelware/Error.Middleware.js"
import cookieParser from 'cookie-parser';

const App = express()

App.use(cookieParser()); 

App.use(cors({ origin: true, credentials: true }))
App.use(express.json())

App.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

App.use(globalErrorHandler)

export default App
