const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log('PROTECT - token present:', !!token);
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    console.log('PROTECT - user found:', req.user?.email, req.user?.role);
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    console.log('PROTECT - error:', err.message);
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};
const requireDoctor = (req, res, next) => {
  if (req.user?.role !== 'doctor' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Doctor access required' });
  }
  next();
};

const requireDoctorOrSelf = (req, res, next) => {
  const isDoctor = req.user?.role === 'doctor' || req.user?.role === 'admin';
  const isSelf =
    req.params.patientId === req.user?.id?.toString() ||
    req.params.email === req.user?.email;
  if (!isDoctor && !isSelf) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { protect, requireDoctor, requireDoctorOrSelf };