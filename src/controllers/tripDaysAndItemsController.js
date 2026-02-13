import {
	addTripDays,
	addTripItemsToDay,
	getTripDays,
	updateTripItem,
	deleteTripItem,
	findLocation,
} from '../manager/tripDaysAndItems.js'

import { assertUserIsTripOwner } from '../utils/tripValidators.js'

async function addTripDaysController(req, res) {
	const tripId = req.params.tripId
	const { days } = req.body

	if (!Array.isArray(days) || days.length === 0) {
		return res.status(400).json({ error: 'Days array is required' })
	}

	try {
		await assertUserIsTripOwner(userId, tripId)

		const createdDays = await addTripDays(tripId, days)
		return res.status(201).json({ status: 'success', data: { days: createdDays } })
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

async function getTripDaysController(req, res) {
	const { tripId } = req.params

	try {
		const days = await getTripDays(tripId)
		return res.status(200).json({ status: 'success', data: { days } })
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function updateTripItemController(req, res) {
	const { tripId, itemId } = req.params
	const data = req.body

	try {
		// Resolve item → day
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

async function findLocationController(req, res) {
	const name  = req.query.name

	try {
		const result = await findLocation(name)
		return res.status(200).json({ status: 'success', data: result })
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

export {
	addTripDaysController,
	addTripItemsController,
	getTripDaysController,
	updateTripItemController,
	deleteTripItemController,
	findLocationController,
}
