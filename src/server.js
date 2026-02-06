import express from 'express'
import { config } from 'dotenv'
import { connectDB, disconnectDB } from './config/db.js'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import tripRoutes from './routes/tripRoutes.js'
import cookieParser from 'cookie-parser'
import { initWebSocket } from './ws.js'


config()
connectDB()

const app = express()

app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/trip', tripRoutes)

const PORT = 5001
const server = app.listen(PORT, () => {
	console.log(`Server running on PORT ${PORT}`)
});

initWebSocket(server)

process.on('unhandledRejection', (err) => {
	console.error('Unhandled Rejection', err)
	server.close(async() => {
		await disconnectDB()
		process.exit(1)
	})
})

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception', err)
	server.close(async() => {
		await disconnectDB()
		process.exit(1)
	})
})

process.on('SIGTERM', (err) => {
	console.error('SIGTERM', err)
	server.close(async() => {
		await disconnectDB()
		process.exit(1)
	})
})
