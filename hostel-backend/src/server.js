// Load environment variables before anything else
import "dotenv/config";
import App from './app.js'
import { PORT } from './config/env.js'

// Start the Express server on the configured port
App.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🩺 Health check: http://localhost:${PORT}/health`)
})
