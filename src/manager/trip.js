import { prisma } from '../config/db.js'
import { validateFutureDate, getUserTripOrThrow, assertNoTripOnDate } from '../utils/tripValidators.js'

export async function createTrip(userId, name, plannedDate, plannedDuration) {
	const date = validateFutureDate(plannedDate)

	if (plannedDuration <= 0) {
		throw new Error('The duration must be greater than 0.')
	}

	await assertNoTripOnDate(prisma, userId, date)

	const trip = await prisma.trip.create({
		data: {
			name,
			userId,
			plannedDate: date,
			plannedDuration: Number(plannedDuration),
		},
	})

	return {
		status: 'success',
		data: {
			trip,
		},
	}
}

export async function getAllTrips(userId) {
	const trips = await prisma.trip.findMany({
		where: { userId },
		orderBy: { plannedDate: 'asc' },
	})

	return {
		status: 'success',
		data: {
			trips,
		},
	}
}

export async function getTrip(userId, tripId) {
	const trip = await getUserTripOrThrow(prisma, userId, tripId)

	return {
		status: 'success',
		data: {
			trip,
		},
	}
}

export async function updateTrip(
	userId,
	tripId,
	{ name, plannedDate, plannedDuration },
) {
	await getUserTripOrThrow(prisma, userId, tripId)

	const data = {}

	if (name !== undefined) {
		data.name = name
	}

	if (plannedDate !== undefined) {
		const date = validateFutureDate(plannedDate)
		await assertNoTripOnDate(prisma, userId, date, tripId)
		data.plannedDate = date
	}

	if (plannedDuration !== undefined) {
		if (plannedDuration <= 0) {
			throw new Error('The duration must be greater than 0.')
		}
		data.plannedDuration = Number(plannedDuration)
	}

	const trip = await prisma.trip.update({
		where: { id: tripId },
		data,
	})

	return {
		status: 'success',
		data: {
			trip,
		},
	}
}

export async function deleteTrip(userId, tripId) {
	await getUserTripOrThrow(prisma, userId, tripId)

	await prisma.trip.delete({
		where: { id: tripId },
	})

	return {
		status: 'success',
		message: 'Trip deleted successfully.',
	}
}
