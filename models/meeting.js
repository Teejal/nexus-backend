import mongoose from 'mongoose';

// Meeting schema - stores scheduled meetings between two users
const meetingSchema = new mongoose.Schema(
  {
    // The user who scheduled/created the meeting
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The user who was invited to the meeting
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Meeting date in YYYY-MM-DD format
    date: {
      type: String,
      required: true,
    },
    // Meeting time in HH:MM format
    time: {
      type: String,
      required: true,
    },
    // Duration of the meeting in minutes
    duration: {
      type: Number,
      default: 30,
    },
    // Optional notes/agenda for the meeting
    notes: {
      type: String,
      default: '',
    },
    // Meeting status - starts as pending until participant responds
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;