import App from './app.js'
import { PORT } from './config/env.js'
import "dotenv/config";


App.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

App.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🩺 Health check: http://localhost:${PORT}/health`)
})
