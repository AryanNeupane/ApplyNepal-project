import User from '../models/User.js';
import Recruiter from '../models/Recruiter.js';
import Admin from '../models/Admin.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';

export const registerJobSeeker = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: 'jobseeker'
    });

    const token = generateToken(user._id, 'jobseeker');
    const refreshToken = generateRefreshToken(user._id, 'jobseeker');

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerRecruiter = async (req, res) => {
  try {
    const { fullName, email, password, phone, companyName } = req.body;

    const recruiterExists = await Recruiter.findOne({ email });
    if (recruiterExists) {
      return res.status(400).json({ message: 'Recruiter already exists' });
    }

    const recruiter = await Recruiter.create({
      fullName,
      email,
      password,
      phone,
      companyName,
      role: 'recruiter',
      verificationStatus: 'pending'
    });

    const token = generateToken(recruiter._id, 'recruiter');
    const refreshToken = generateRefreshToken(recruiter._id, 'recruiter');

    res.status(201).json({
      _id: recruiter._id,
      fullName: recruiter.fullName,
      email: recruiter.email,
      role: recruiter.role,
      companyName: recruiter.companyName,
      verificationStatus: recruiter.verificationStatus,
      token,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    let role;

    // Try Admin first
    user = await Admin.findOne({ email }).select('+password');
    if (user) {
      role = 'admin';
    } else {
      // Try Recruiter
      user = await Recruiter.findOne({ email }).select('+password');
      if (user) {
        role = 'recruiter';
      } else {
        // Try User
        user = await User.findOne({ email }).select('+password');
        if (user) {
          role = 'jobseeker';
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check isActive only if the field exists (Admin might not have it, but defaults to true)
    if (user.isActive === false) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, role);
    const refreshToken = generateRefreshToken(user._id, role);

    const userData = {
      _id: user._id,
      email: user.email,
      role,
      token,
      refreshToken
    };

    if (role === 'jobseeker') {
      userData.fullName = user.fullName;
      userData.skills = user.skills;
      userData.resume = user.resume;
    } else if (role === 'recruiter') {
      userData.fullName = user.fullName;
      userData.companyName = user.companyName;
      userData.verificationStatus = user.verificationStatus;
    }

    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8 || !/^(?=.*[A-Z])(?=.*[0-9])/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must be at least 8 characters and include at least one uppercase letter and one number' });
    }

    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user._id).select('+password');
    } else if (req.user.role === 'recruiter') {
      user = await Recruiter.findById(req.user._id).select('+password');
    } else {
      user = await User.findById(req.user._id).select('+password');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

