import Meeting from '../models/Meeting.js';
import User from '../models/User.js';

// @route   POST /api/meetings
// @desc    Schedule a new meeting (with conflict detection)
// @access  Private
export const scheduleMeeting = async (req, res) => {
  try {
    const { participantEmail, date, time, duration, notes } = req.body;
    const organizerId = req.user._id;

    if (!participantEmail || !date || !time) {
      return res.status(400).json({ message: 'Participant email, date, and time are required' });
    }

    // Find the participant by their email
    const participant = await User.findOne({ email: participantEmail });
    if (!participant) {
      return res.status(404).json({ message: 'No user found with this email' });
    }
    const participantId = participant._id;

    // Conflict detection: check if either the organizer or the participant
    // already has a meeting at this exact date and time (ignoring rejected ones)
    const conflict = await Meeting.findOne({
      date,
      time,
      status: { $ne: 'rejected' },
      $or: [
        { organizer: organizerId },
        { participant: organizerId },
        { organizer: participantId },
        { participant: participantId },
      ],
    });

    if (conflict) {
      return res.status(400).json({ message: 'A meeting is already scheduled at this date and time' });
    }

    // No conflict found - safe to create the meeting
    const meeting = await Meeting.create({
      organizer: organizerId,
      participant: participantId,
      date,
      time,
      duration: duration || 30,
      notes: notes || '',
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/meetings/:id/accept
// @desc    Accept a pending meeting request
// @access  Private (only the invited participant can accept)
export const acceptMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only the participant who was invited can accept the meeting
    if (meeting.participant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot accept this meeting' });
    }

    meeting.status = 'accepted';
    await meeting.save();

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/meetings/:id/reject
// @desc    Reject a pending meeting request
// @access  Private (only the invited participant can reject)
export const rejectMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    if (meeting.participant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot reject this meeting' });
    }

    meeting.status = 'rejected';
    await meeting.save();

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/meetings
// @desc    Get all meetings for the logged-in user (as organizer OR participant)
// @access  Private
export const getMyMeetings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find meetings where the user is either the organizer or the participant
    // populate() replaces the ObjectId with actual user details (name, email, role)
    const meetings = await Meeting.find({
      $or: [{ organizer: userId }, { participant: userId }],
    })
      .populate('organizer', 'name email role')
      .populate('participant', 'name email role')
      .sort({ date: 1, time: 1 });

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};