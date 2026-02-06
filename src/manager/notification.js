import { clients } from '../ws.js'

export function notification(userId, payload, type) {
	let userSockets

	if (type === 'NOTIFICATION') {
		userSockets = clients.get(userId.toString())
	} else {
		// implement later
	}

	if (!userSockets) return

	for (const ws of userSockets) {
		if (ws.readyState === ws.OPEN) {
			ws.send(JSON.stringify({
				type,
				payload,
			}))
		}
	}
}
