import { prisma } from '../config/db.js'
import {
	validateFriends,
	assertUserIsTripOwner,
} from '../utils/tripValidators.js'

// ----------------------
// Update Trip Members
// ----------------------
export async function addTripMembers(tripId, ownerId, memberIds = []) {
	await assertUserIsTripOwner(ownerId, tripId)
	await validateFriends(ownerId, memberIds)

	// Only add new members
	const trip = await prisma.trip.findUnique({
		where: { id: tripId },
		include: { members: true },
	})

	const existingIds = trip.members.map(m => m.userId)
	const duplicateIds = memberIds.filter(id => existingIds.includes(id))

	if (duplicateIds.length > 0) {
		throw new Error(
			`These users are already members of the trip: ${duplicateIds.join(', ')}`,
		)
	}

    const newIds = memberIds.filter(id => !existingIds.includes(id))

    if (newIds.length === 0) {
        throw new Error('No new members to add')
    }

	await prisma.tripMember.createMany({
		data: newIds.map(id => ({ tripId, userId: id, role: 'VIEWER' })),
	})

	return prisma.trip.findUnique({
		where: { id: tripId },
		include: { members: { include: { user: true } } },
	})
}

export async function removeTripMember(ownerId, tripId, userId) {
	await assertUserIsTripOwner(ownerId, tripId)

	const member = await prisma.tripMember.findUnique({
		where: { tripId_userId: { tripId, userId } },
	})

	if (!member) throw new Error('Member not found')
	if (member.role === 'OWNER') throw new Error('Cannot remove the owner')

	await prisma.tripMember.delete({
		where: { tripId_userId: { tripId, userId } },
	})

	return { message: 'Member removed' }
}

export async function updateTripMemberRole(tripId, ownerId, memberId, role) {
    const validRoles = ['VIEWER', 'EDITOR']
    if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`)
    }

    await assertUserIsTripOwner(ownerId, tripId)

    // Fetch the member
    const member = await prisma.tripMember.findUnique({
        where: { tripId_userId: { tripId, userId: memberId } },
    })

    if (!member) {
        throw new Error('Member not found')
    }

    // Owner role cannot be changed
    if (member.role === 'OWNER') {
        throw new Error('Cannot change the owner role')
    }

    // Update the role
    const updatedMember = await prisma.tripMember.update({
        where: { tripId_userId: { tripId, userId: memberId } },
        data: { role },
    })

    return updatedMember
}
