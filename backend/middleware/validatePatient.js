function isEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPositiveNumber(val) {
  if (val === null || val === undefined) return false;
  const n = Number(val);
  return !Number.isNaN(n) && n > 0;
}

function isMobileNumber(value) {
  return typeof value === 'string' && /^\d{10}$/.test(value);
}

module.exports = (req, res, next) => {
  const { name, dob, email, gender, mobile, glucose, haemoglobin, cholesterol } = req.body;
  const errors = [];
  if (!name || typeof name !== 'string' || !name.trim()) errors.push({ field: 'name', message: 'Full Name is required' });
  if (!dob || Number.isNaN(Date.parse(dob))) errors.push({ field: 'dob', message: 'Valid Date of Birth is required' });
  else if (new Date(dob) > new Date()) errors.push({ field: 'dob', message: 'Date of Birth cannot be in the future' });
  if (!email || !isEmail(email)) errors.push({ field: 'email', message: 'Valid email is required' });
  if (gender && !['Male', 'Female', 'Other', 'Prefer not to say'].includes(gender)) errors.push({ field: 'gender', message: 'Invalid gender selection' });
  if (!mobile || !isMobileNumber(mobile)) errors.push({ field: 'mobile', message: 'Mobile number must be exactly 10 digits' });
  if (!isPositiveNumber(glucose)) errors.push({ field: 'glucose', message: 'Glucose must be a number greater than 0' });
  if (!isPositiveNumber(haemoglobin)) errors.push({ field: 'haemoglobin', message: 'Haemoglobin must be a number greater than 0' });
  if (!isPositiveNumber(cholesterol)) errors.push({ field: 'cholesterol', message: 'Cholesterol must be a number greater than 0' });

  if (errors.length) return res.status(400).json({ errors });
  next();
};
