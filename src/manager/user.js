import { prisma } from '../config/db.js'
import { createNotification, deleteNotificationAfterAccept, notification } from './notification.js'


async function addToBucketList(userId, place) {

	if (!userId) {
		throw new Error('no user was provided')
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
	})

	if (!user) {
		throw new Error('This user does not exsist')
	}

	if (user.bucketList.includes(place)) {
		throw new Error('This place already exsist in the bucketList')
	}

	await prisma.user.update({
		where: { id: userId },
		data: { bucketList: { push: place } },
	})

	return {
		message: 'Success',
		data: place,
	}
}

async function showBucketList(userId) {

	console.log(userId)

	if (!userId) {
		throw new Error('no user was provided')
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
	})

	if (!user) {
		throw new Error('User does not exsists')
	}

	return user.bucketList
}

async function deleteBucketList(userId, place) {
	if (!userId) throw new Error('no user provided')
	if (!place) throw new Error('no place provided')

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { bucketList: true },
	})

	if (!user) throw new Error('user not found')

	const updatedBucketList = user.bucketList.filter(
		item => item !== place,
	)

	await prisma.user.update({
		where: { id: userId },
		data: {
			bucketList: updatedBucketList,
		},
	})


	return {
		message: 'success',
		data: updatedBucketList,
	}
}

async function sendFriendsRequest(userId, friendId) {
	if (!userId || !friendId) {
		throw new Error('Invalid User Ids')
	}

	if (userId === friendId) {
		throw new Error('You cannot add yourself as a friend')
	}

	const [user, friend] = await Promise.all([
		prisma.user.findUnique({ where: { id: userId } }),
		prisma.user.findUnique({ where: { id: friendId } }),
	])

	if (!user || !friend) {
		throw new Error('User does not exist')
	}

	const existing = await prisma.friendship.findUnique({
		where: {
			userId_friendId: {
				userId,
				friendId,
			},
		},
	})

	if (existing && existing.status === 'BLOCKED') {
		throw new Error('This user does not exsist')
	} else if (existing && existing.status === 'PENDING') {
		throw new Error('A request has already been send to this user')
	} else if (existing && existing.status === 'ACCEPTED') {
		throw new Error('This user is already your friend')
	}

	await prisma.friendship.create({
		data: {
			userId: friendId,
			friendId: userId,
			status: 'PENDING',
		},
	})

	const friendship = await prisma.friendship.create({
		data: {
			userId,
			friendId,
			status: 'PENDING',
		},
	})

	const payload = {
		email: user.email,
		name: user.name,
        id: user.id,
		message: `The user ${user.name} with email: ${user.email} has sent you a friend request`,
	}

	notification(friendId, payload, 'NOTIFICATION')
	createNotification(friendId, payload, 'FRIEND_REQUEST')

	return {
		message: 'Success',
		data: friendship,
	}
}

async function acceptRequest(userId, friendId) {

	if (!userId || !friendId) {
		throw new Error('Invalid User IDs')
	}

	const [user, friend] = await Promise.all([
		prisma.user.findUnique({ where: { id: userId } }),
		prisma.user.findUnique({ where: { id: friendId } }),
	])

	if (!user || !friend) {
		throw new Error('User does not exist')
	}

	const existing = await prisma.friendship.findUnique({
		where: {
			userId_friendId: {
				userId,
				friendId,
			},
		},
	})

	if (existing && existing.status === 'BLOCKED') {
		throw new Error('This user does not exsist')
	} else if (existing && existing.status === 'ACCEPTED') {
		throw new Error('This user is already your friend')
	} else if (!existing) {
		throw new Error('Please send a request to this user first')
	}

	await prisma.friendship.update({
		where: {
			userId_friendId: {
				userId: friendId,
				friendId: userId,
			},
		},
		data: {
			status: 'ACCEPTED',
		},
	})

	const friendship = await prisma.friendship.update({
		where: {
			userId_friendId: {
				userId: userId,
				friendId: friendId,
			},
		},
		data: {
			status: 'ACCEPTED',
		},
	})

	const payload = {
		email: friend.email,
		name: friend.name,
		message: `The user ${friend.name} with email: ${friend.email} has accepted your friend request you are both now friends and can add each other to trip.`,
	}

	notification(userId, payload, 'NOTIFICATION');
	createNotification(userId, payload, 'FRIEND_ACCEPTED');
    deleteNotificationAfterAccept(userId, friendId);

	return {
		message: 'Success',
		data: friendship,
	}
}

async function searchUsersByEmail(query, currentUserId) {
	if (!query) return []

	return prisma.user.findMany({
		where: {
			id: {
				not: currentUserId,
			},
			email: {
				contains: query,
				mode: 'insensitive',
			},
		},
		select: {
			id: true,
			email: true,
			name: true,
		},
		take: 10,
	})
}

export { addToBucketList, showBucketList, deleteBucketList, sendFriendsRequest, acceptRequest, searchUsersByEmail }
