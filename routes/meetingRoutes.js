import express from 'express';
import {
  scheduleMeeting,
  acceptMeeting,
  rejectMeeting,
  getMyMeetings,
} from '../controllers/meetingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All meeting routes require the user to be logged in (protected)
router.post('/', protect, scheduleMeeting);
router.get('/', protect, getMyMeetings);
router.put('/:id/accept', protect, acceptMeeting);
router.put('/:id/reject', protect, rejectMeeting);

export default router;