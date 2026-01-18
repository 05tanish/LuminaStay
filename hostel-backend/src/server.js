import App from './app.js'
import { PORT } from './config/env.js'

App.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
