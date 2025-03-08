import dotenv from 'dotenv/config';  // Zorgt ervoor dat omgevingsvariabelen worden geladen
import express from 'express';
import cors from 'cors';

import userRoutes from './routes/users.js';
import authRouter from './routes/auth.js';  // Zorg ervoor dat het pad klopt
import propertyRoutes from './routes/properties.js';  
import hostRoutes from './routes/hosts.js'; 
import amenityRoutes from './routes/amenities.js';  
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';

// Importeer de middleware
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
app.use(cors());
app.use(express.json());

// Test route om te zien of de server draait
app.get('/test', (req, res) => {
  res.send('Test werkt!');
});

app.use('/', authRouter); 

// Beveiligde routes (met authMiddleware)
app.use('/users', authMiddleware, userRoutes);  // Route voor gebruikers, alleen voor geauthenticeerde gebruikers
app.use('/properties', authMiddleware, propertyRoutes);  // Route voor properties, alleen voor geauthenticeerde gebruikers
app.use('/hosts', authMiddleware, hostRoutes);  // Route voor hosts, alleen voor geauthenticeerde gebruikers
app.use('/amenities', authMiddleware, amenityRoutes);  // Route voor voorzieningen, alleen voor geauthenticeerde gebruikers
app.use('/bookings', authMiddleware, bookingRoutes);  // Route voor bookings, alleen voor geauthenticeerde gebruikers
app.use('/reviews', authMiddleware, reviewRoutes);  // Route voor reviews, alleen voor geauthenticeerde gebruikers

// Foutafhandelingsroute
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Algemene foutafhandelingsmiddleware
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    message: error.message,
    error: process.env.NODE_ENV === 'development' ? error : {},
  });
});



// Start de server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
