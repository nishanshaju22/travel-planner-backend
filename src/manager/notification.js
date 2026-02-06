import { isArrayBufferView } from 'node:util/types'
import { prisma } from '../config/db.js'
import { clients } from '../ws.js'

function notification(userId, payload, type) {
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

async function getNotification(userId, type, read) {

	if (!userId) {
		throw new Error('Invalid User Id')
	}

	const where = { userId }

	if (type) {
		where.type = type
	}

	if (read !== undefined) {
		where.read = read === 'true'
	}

	return prisma.notification.findMany({
		where,
		orderBy: {
			createdAt: 'desc',
		},
	})
}

async function createNotification(userId, payload, type) {

	if (!userId) {
		throw new Error('Invalid User Id')
	}

	if (type !== 'FRIEND_REQUEST' && type !== 'FRIEND_ACCEPTED' && type !== 'TRIP_INVITE' && type !== 'TRIP_UPDATED' && type !== 'SYSTEM') {
		throw new Error('Not a valid enum type')
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
	})

	if (!user) {
		throw new Error('This user does not exsist')
	}

	await prisma.notification.create({
		data: {
			userId,
			type,
			payload,
		},
	})

	return 'Success'
}

async function deleteNotificationAfterAccept(userId, friendId) {
    if (!userId || !friendId) {
        throw new Error('Invalid userId or friendId');
    }

    return prisma.notification.deleteMany({
        where: {
            userId,
            type: 'FRIEND_REQUEST',
            payload: {
                path: ['id'],
                equals: friendId,
            },
        },
    });
}

export { notification, getNotification, createNotification, deleteNotificationAfterAccept }
