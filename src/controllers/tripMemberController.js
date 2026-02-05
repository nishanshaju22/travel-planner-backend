import {
	addTripMembers,
	removeTripMember,
    updateTripMemberRole
} from '../manager/tripMembers.js'


async function addTripMembersController(req, res) {
	const tripId = req.params.tripId
	const ownerId = req.params.userId
	const { memberIds } = req.body

	if (!Array.isArray(memberIds) || memberIds.length === 0) {
		return res.status(400).json({ error: 'memberIds must be a non-empty array' })
	}

	try {
		const trip = await addTripMembers(tripId, ownerId, memberIds)
		return res.status(200).json({ status: 'success', data: { trip } })
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function removeTripMemberController(req, res) {
	const ownerId = req.params.userId
	const tripId = req.params.tripId
	const memberId = req.params.memberId

	try {
		const result = await removeTripMember(ownerId, tripId, memberId)
		return res.status(200).json({ status: 'success', data: result })
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function updateTripMemberRoleController(req, res) {
    const tripId = req.params.tripId
    const ownerId = req.params.userId
    const memberId = req.params.memberId
    const { role } = req.body

    if (!role) {
        return res.status(400).json({ error: 'Role is required' })
    }

    try {
        const updatedMember = await updateTripMemberRole(tripId, ownerId, memberId, role)
        return res.status(200).json({ status: 'success', data: { member: updatedMember } })
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}

export {
	addTripMembersController,
    removeTripMemberController,
    updateTripMemberRoleController
}