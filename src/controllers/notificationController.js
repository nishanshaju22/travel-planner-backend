import { getNotification } from '../manager/notification.js'

async function getNotificationController(req, res) {
	const userId = req.user.id
	const type = req.query.type
	const read = req.query.read


	try {
		const result = await getNotification(userId, type, read)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}


export { getNotificationController }
