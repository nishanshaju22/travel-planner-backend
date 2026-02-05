import { acceptRequest, addToBucketList, deleteBucketList, searchUsersByEmail, sendFriendsRequest, showBucketList } from '../manager/user.js'

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

export { bucketListController, showBucketListController, deleteBucketListController, sendFriendsRequestController, acceptRequestController, searchUsersByEmailController }
