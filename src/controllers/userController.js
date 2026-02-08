import { acceptRequest, addToBucketList, deleteBucketList, searchUsersByEmail, sendFriendsRequest, showBucketList } from '../manager/user.js'
import { prisma } from '../config/db.js'

async function bucketListController(req, res) {
	const { userId, place } = req.body

	try {
		const result = await addToBucketList(userId, place)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function showBucketListController(req, res) {
	const userId = req.params.userId

	try {
		const result = await showBucketList(userId)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function deleteBucketListController(req, res) {
	const userId = req.params.userId
	const place = req.params.place

	try {
		const result = await deleteBucketList(userId, place)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function sendFriendsRequestController(req, res) {
	const { userId, friendId } = req.body

	try {
		const result = await sendFriendsRequest(userId, friendId)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function acceptRequestController(req, res) {
	const { userId, friendId } = req.body

	try {
		const result = await acceptRequest(userId, friendId)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function searchUsersByEmailController(req, res) {
	const query = req.params.query
	const currentUserId = req.user.id

	try {
		const result = await searchUsersByEmail(query, currentUserId)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function createUserPreferenceController(req, res) {
	const userId = req.user.id
	const data = req.body

	try {
		const existing = await prisma.userPreference.findUnique({
			where: { userId },
		})

		if (existing) {
			return res.status(409).json({ error: 'Use Update' })
		}

		const pref = await prisma.userPreference.create({
			data: {
				userId,
				...data,
			},
		})

		return res.status(201).json(pref)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function updateUserPreferenceController(req, res) {
	const userId = req.user.id
	const data = req.body

	try {
		const pref = await prisma.userPreference.update({
			where: { userId },
			data,
		})

		return res.status(200).json(pref)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function getUserPreferenceController(req, res) {
	const userId = req.user.id

	try {
		const pref = await prisma.userPreference.findUnique({
			where: { userId },
		})

		return res.status(200).json(pref)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

export { bucketListController, showBucketListController, deleteBucketListController, sendFriendsRequestController, acceptRequestController, searchUsersByEmailController, createUserPreferenceController, updateUserPreferenceController, getUserPreferenceController }
