import {
	syncTripDaysWithPlan,
	addTripItemsToDay,
	getTripDays,
	updateTripItem,
	deleteTripItem,
} from '../../manager/Trip/tripDaysAndItems.js'

import { assertUserIsTripOwner } from '../../utils/tripValidators.js'

async function syncTripDaysWithPlanController(req, res) {
	const userId = req.user.id
	const { tripId } = req.params

	try {
		await assertUserIsTripOwner(userId, tripId)

		const createdDays = await syncTripDaysWithPlan(tripId)

		return res.status(201).json({
			status: 'success',
			data: { days: createdDays },
		})
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function getTripDaysController(req, res) {
	const { tripId } = req.params

	try {
		const days = await getTripDays(tripId)
		return res.status(200).json({ status: 'success', data: { days } })
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function addTripItemsController(req, res) {
	const dayId = req.params.dayId
	const { items } = req.body

	if (!Array.isArray(items) || items.length === 0) {
		return res.status(400).json({ error: 'Items array is required' })
	}

	try {
		const createdItems = await addTripItemsToDay(dayId, items)
		return res.status(201).json({ status: 'success', data: { items: createdItems } })
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function updateTripItemController(req, res) {
	const { tripId, itemId } = req.params
	const data = req.body

	try {
		const item = await prisma.itineraryItem.findUnique({
			where: { id: itemId },
			include: { day: true },
		})

		if (!item) throw new Error('Item not found')
		if (item.day.tripId !== tripId) {
			throw new Error('Item does not belong to this trip')
		}

		const updatedItem = await updateTripItem(itemId, data)
		return res.status(200).json({ status: 'success', data: { item: updatedItem } })
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function deleteTripItemController(req, res) {
	const { tripId, itemId } = req.params

	try {
		const item = await prisma.itineraryItem.findUnique({
			where: { id: itemId },
			include: { day: true },
		})

		if (!item) throw new Error('Item not found')
		if (item.day.tripId !== tripId) {
			throw new Error('Item does not belong to this trip')
		}

		const result = await deleteTripItem(itemId)
		return res.status(200).json({ status: 'success', data: result })
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

export {
	syncTripDaysWithPlanController,
	addTripItemsController,
	getTripDaysController,
	updateTripItemController,
	deleteTripItemController,
}
