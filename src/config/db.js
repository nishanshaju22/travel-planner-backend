import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
	log: ['query', 'error', 'warn'],
})

const connectDB = async() => {
	try {
		await prisma.$connect()
		console.log('DB Connected')
	} catch (error) {
		console.error(`Database connection error: ${error}`)
		process.exit(1)
	}
}

const disconnectDB = async() => {
	await prisma.$disconnect()
}

export { prisma, connectDB, disconnectDB }
