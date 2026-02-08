import express from 'express'
import { bucketListController, showBucketListController, deleteBucketListController, sendFriendsRequestController, acceptRequestController, searchUsersByEmailController, createUserPreferenceController, updateUserPreferenceController, getUserPreferenceController } from '../controllers/userController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.post('/addBucketList', bucketListController)

router.get('/showBucketList/:userId', showBucketListController)

router.delete('/:userId/showBucketList/:place', deleteBucketListController)

router.post('/sendFriendRequest', sendFriendsRequestController)

router.put('/acceptRequest', acceptRequestController)

router.get('/search/:query', searchUsersByEmailController)

router.post('/preference', createUserPreferenceController)

router.put('/preference', updateUserPreferenceController)

router.get('/preference', getUserPreferenceController)

export default router
