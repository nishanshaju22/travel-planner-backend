import { z } from 'zod'

import { createTrip } from '../../../manager/Trip/trip.js'
import { syncTripDaysWithPlan, addTripItemsToDay } from '../../../manager/Trip/tripDaysAndItems.js'
import { addTripAccommodations } from '../../../manager/Trip/tripAccommodations.js'

export class TripTools {
	constructor(mcp) {
		this.mcp = mcp
		this._registerTools()
	}

	_registerTools() {
		this.mcp.registerTool(
			'createTrip',
			{
				title: 'Create Trip',
				description: 'Creates a new trip',
				inputSchema: {
					type: 'object',
					properties: {
						ownerId: { type: 'string' },
						name: { type: 'string' },
						plannedDate: { type: 'string' },
						plannedDuration: { type: 'number' },
						budget: { type: 'number' },
						preferences: {},
					},
					required: ['ownerId', 'name', 'plannedDate', 'plannedDuration'],
				},
			},
			this.createTrip.bind(this),
		)

		this.mcp.registerTool(
			'syncTripDaysWithPlan',
			{
				title: 'Sync Trip Days',
				description: 'Initialises trip days based on trip dates',
				inputSchema: {
					type: 'object',
					properties: {
						tripId: { type: 'string' },
					},
					required: ['tripId'],
				},
			},
			this.syncTripDaysWithPlan.bind(this),
		)

		this.mcp.registerTool(
			'addTripAccommodation',
			{
				title: 'Add Trip Accommodation',
				description: 'Adds accommodation to a trip',
				inputSchema: {
					type: 'object',
					properties: {
						tripId: { type: 'string' },
						name: { type: 'string' },
						locationId: { type: 'string' },
						checkInDate: { type: 'string' },
						checkOutDate: { type: 'string' },
						cost: { type: 'number' },
						type: { type: 'string' },
					},
					required: [
						'tripId',
						'name',
						'locationId',
						'checkInDate',
						'checkOutDate',
						'cost',
						'type',
					],
				},
			},
			this.addTripAccommodation.bind(this),
		)

		this.mcp.registerTool(
			'addTripItem',
			{
				title: 'Add Trip Item',
				description: 'Adds an item to a trip day',
				inputSchema: {
					type: 'object',
					properties: {
						dayId: { type: 'string' },
						name: { type: 'string' },
						type: { type: 'string' },
						description: { type: 'string' },
						startTime: { type: 'string' },
						endTime: { type: 'string' },
						costEstimate: { type: 'number' },
						locationId: { type: 'string' },
					},
					required: ['dayId', 'name', 'type'],
				},
			},
			this.addTripItem.bind(this),
		)
	}

	async createTrip({
		ownerId,
		name,
		plannedDate,
		plannedDuration,
		budget,
		preferences,
	}) {
		try {
			const result = await createTrip(
				ownerId,
				name,
				plannedDate,
				plannedDuration,
				[],
				budget,
				preferences,
			)
			return result
		} catch (error) {
			return { status: 'error', message: error.message }
		}
	}

	async syncTripDaysWithPlan({ tripId }) {
		try {
			const result = await syncTripDaysWithPlan(tripId)
			return { status: 'success', data: result }
		} catch (error) {
			return { status: 'error', message: error.message }
		}
	}

	async addTripAccommodation({
		tripId,
		name,
		locationId,
		checkInDate,
		checkOutDate,
		cost,
		type,
	}) {
		try {
			const result = await addTripAccommodations(tripId, [
				{
					name,
					locationId,
					checkIn: checkInDate,
					checkOut: checkOutDate,
					cost,
					type,
				},
			])

			return { status: 'success', data: result }
		} catch (error) {
			return { status: 'error', message: error.message }
		}
	}

	async addTripItem({
		dayId,
		name,
		type,
		description,
		startTime,
		endTime,
		costEstimate,
		locationId,
	}) {
		try {
			const result = await addTripItemsToDay(dayId, [
				{
					name,
					type,
					description,
					startTime,
					endTime,
					costEstimate,
					locationId,
				},
			])

			return { status: 'success', data: result }
		} catch (error) {
			return { status: 'error', message: error.message }
		}
	}
}
