import jwt from 'jsonwebtoken';

// Gebruik AUTH_SECRET_KEY uit de omgevingsvariabelen
const SECRET_KEY = process.env.AUTH_SECRET_KEY || 'geheime_sleutel'; // Standaard als er geen .env is

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Geen toegang, token ontbreekt' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verificatie mislukt:', error.message); // Foutlog voor debugging
    res.status(401).json({ message: 'Ongeldige token' });
  }
};

export default authMiddleware;
