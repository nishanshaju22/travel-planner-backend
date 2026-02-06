import { prisma } from '../config/db.js'

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

export async function getUserTripOrThrow(userId, tripId) {
	const trip = await prisma.trip.findFirst({
		where: {
			id: tripId,
			OR: [
				{ ownerId: userId },
				{ members: { some: { userId } } },
			],
		},
		include: {
			members: {
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							createdAt: true,
							updatedAt: true,
						},
					},
				},
			},
			accommodations: {
				include: { location: true },
			},
			days: {
				include: {
					items: {
						include: { location: true },
					},
				},
			},
		},
	})

	if (!trip) throw new Error('Trip not found or access denied')
	return trip
}



export async function assertNoTripOnDate(ownerId, date, excludeTripId = null) {
	const { start, end } = getDayRange(date)

	const trip = await prisma.trip.findFirst({
		where: {
			ownerId, // updated field
			plannedDate: { gte: start, lte: end },
			...(excludeTripId && { NOT: { id: excludeTripId } }),
		},
	})

	if (trip) throw new Error('You already have a trip planned for this date.')
}

export async function assertUserIsTripOwner(userId, tripId) {
	const trip = await prisma.trip.findUnique({
		where: { id: tripId },
		select: { ownerId: true },
	})

	if (!trip) {
		throw new Error('Trip not found')
	}

	if (trip.ownerId !== userId) {
		throw new Error('User is not the owner of this trip')
	}
}

export async function validateFriends(ownerId, memberIds = []) {
	if (!memberIds.length) return

	const friendships = await prisma.friendship.findMany({
		where: {
			userId: ownerId,
			status: 'ACCEPTED',
		},
	})

	const friendIds = friendships.map(f => f.friendId)
	const invalidMembers = memberIds.filter(id => !friendIds.includes(id))

	if (invalidMembers.length > 0) {
		throw new Error('All members must be friends of the trip owner.')
	}
}

export function validateTripPreferences(preferences = []) {
	if (!Array.isArray(preferences)) {
		throw new Error('Preferences must be an array')
	}

	const validPreferences = Object.values(prisma.TripPreference)

	const invalidPreferences = preferences.filter(
		pref => !validPreferences.includes(pref),
	)

	if (invalidPreferences.length > 0) {
		throw new Error(
			`Invalid trip preferences: ${invalidPreferences.join(', ')}`,
		)
	}

	return true
}
