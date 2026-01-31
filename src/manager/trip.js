import { prisma } from '../config/db.js'

export async function createTrip(userId, name, plannedDate, plannedDuration) { 
    plannedDate = new Date(plannedDate)
    
    if (isNaN(plannedDate)) {
        throw new Error('Please provide a valid date.')
    }

    if (plannedDate < new Date()) {
        throw new Error('The planned date must be in the future.')
    }

    if (plannedDuration <= 0) {
        throw new Error('The duration must be greater than 0.')
    }

    const startOfDay = new Date(plannedDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(plannedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existingTrip = await prisma.trip.findFirst({
        where: {
        userId,
        plannedDate: {
            gte: startOfDay,
            lte: endOfDay
        }
        }
    })

    if (existingTrip) {
        throw new Error("You already have a trip planned for this date.")
    }

    const trip = await prisma.trip.create({
        data: {
            name: name,
            userId: userId,
            plannedDate: new Date(plannedDate),
            plannedDuration: Number(plannedDuration)
        }
    })

    const data = {
		status: 'success',
		data: {
			trip: {
				name: trip.name,
                plannedDate: trip.plannedDate,
                plannedDuration: trip.plannedDuration,
                createdAt: trip.createdAt,
                updatedAt: trip.updatedAt
			},
		},
	}
    
    return data
}