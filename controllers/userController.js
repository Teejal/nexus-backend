import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, bio, startupHistory, investmentHistory, preferences } = req.body;

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (startupHistory !== undefined) user.startupHistory = startupHistory;
    if (investmentHistory !== undefined) user.investmentHistory = investmentHistory;
    if (preferences !== undefined) user.preferences = preferences;

    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};