import express from 'express'
import { bucketListController, showBucketListController, deleteBucketListController } from '../controllers/userController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.post('/addBucketList', bucketListController)

router.get('/showBucketList/:userId', showBucketListController)

router.delete('/:userId/showBucketList/:place', deleteBucketListController)

export default router
