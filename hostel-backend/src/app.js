import express from "express"
import cors from 'cors'

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

export default app
