import express from 'express';
import { login, register } from '../services/authservice.js';  // Zorg ervoor dat het pad klopt

const router = express.Router();

// POST /login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Controleer of de vereiste gegevens zijn ingevuld
  if (!email || !password) {
    return res.status(400).json({ error: 'Email en wachtwoord zijn verplicht' });
  }

  // Roep de login functie aan uit authservice.js
  const result = await login(email, password);

  // Als er een token is, stuur het terug, anders stuur een foutmelding
  if (result.token) {
    return res.json({ token: result.token });
  } else {
    return res.status(401).json({ error: result.error });
  }
});

// POST /register route (registreer nieuwe gebruiker)
router.post('/register', async (req, res) => {
  const { email, password, username, name, phoneNumber, profilePicture } = req.body;

  // Controleer of de vereiste gegevens zijn ingevuld
  if (!email || !password || !username || !name || !phoneNumber || !profilePicture) {
    return res.status(400).json({ error: 'Email, wachtwoord, gebruikersnaam, naam, telefoonnummer en profielplaatje zijn verplicht' });
  }

  // Roep de register functie aan uit authservice.js
  const result = await register(email, password, username, name, phoneNumber, profilePicture);

  if (result.user) {
    return res.status(201).json({ user: result.user });
  } else {
    return res.status(400).json({ error: result.error });
  }
});

export default router;
