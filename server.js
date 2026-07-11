import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

dotenv.config();
// Make sure the uploads folder exists (Railway doesn't keep empty/gitignored folders)
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

const app = express();

app.use(express.json());
app.use(cors());
// Serve uploaded files publicly so they can be downloaded/viewed
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Nexus backend is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);

// Create a raw HTTP server from the Express app (needed for Socket.IO)
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server, allow connections from any origin
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Video Call Signaling Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User joins a specific call room (identified by a unique room ID)
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    // Notify others in the room that a new user has joined
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // Relay WebRTC offer to the other person in the room
  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', { offer, from: socket.id });
  });

  // Relay WebRTC answer back to the caller
  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', { answer, from: socket.id });
  });

  // Relay ICE candidates (network info needed to establish the connection)
  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id });
  });

  // Toggle audio/video mute status - notify others in the room
  socket.on('toggle-media', ({ roomId, type, enabled }) => {
    socket.to(roomId).emit('toggle-media', { type, enabled, from: socket.id });
  });

  // End the call - notify others in the room
  socket.on('end-call', (roomId) => {
    socket.to(roomId).emit('call-ended', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// IMPORTANT: use server.listen (not app.listen) so Socket.IO works
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});