export function validateFutureDate(dateInput) {
	const date = new Date(dateInput)

	if (isNaN(date)) {
		throw new Error('Please provide a valid date.')
	}

	if (date < new Date()) {
		throw new Error('The planned date must be in the future.')
	}

	return date
}

export function getDayRange(date) {
	const start = new Date(date)
	start.setHours(0, 0, 0, 0)

	const end = new Date(date)
	end.setHours(23, 59, 59, 999)

	return { start, end }
}

export async function getUserTripOrThrow(prisma, userId, tripId) {
	const trip = await prisma.trip.findFirst({
		where: {
			id: tripId,
			userId,
		},
	})

	if (!trip) {
		throw new Error('Trip not found.')
	}

	return trip
}

export async function assertNoTripOnDate(prisma, userId, date, excludeTripId = null) {
	const { start, end } = getDayRange(date)

	const trip = await prisma.trip.findFirst({
		where: {
			userId,
			plannedDate: {
				gte: start,
				lte: end,
			},
			...(excludeTripId && {
				NOT: { id: excludeTripId },
			}),
		},
	})

	if (trip) {
		throw new Error('You already have a trip planned for this date.')
	}
}
