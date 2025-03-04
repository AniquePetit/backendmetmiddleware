import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prismaClient.js'; // Zorg ervoor dat dit pad klopt

// Login functie
export async function login(email, password) {
  try {
    // Stap 1: Haal de gebruiker op via het emailveld met `findFirst`
    const user = await prisma.user.findFirst({
      where: { email: email }, // Zoek de eerste gebruiker die overeenkomt met het emailveld
    });

    // Stap 2: Als de gebruiker niet gevonden wordt, geef een foutmelding terug
    if (!user) {
      return { error: 'Gebruiker niet gevonden' }; // Dit retourneert een fout als de gebruiker niet bestaat
    }

    // Stap 3: Vergelijk het ingevoerde wachtwoord met het opgeslagen gehashte wachtwoord
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: 'Onjuist wachtwoord' }; // Als het wachtwoord ongeldig is
    }

    // Stap 4: Genereer het JWT-token met gebruikersinformatie en de AUTH_SECRET_KEY
    if (!process.env.AUTH_SECRET_KEY) {
      throw new Error('AUTH_SECRET_KEY ontbreekt in de .env-bestand');
    }

    // Genereer het JWT-token dat 1 uur geldig is
    const token = jwt.sign(
      { userId: user.id, email: user.email },  // Informatie die in het token wordt gezet
      process.env.AUTH_SECRET_KEY, // Haal de geheime sleutel uit de .env-bestand
      { expiresIn: '1h' } // Token verloopt na 1 uur
    );

    return { token }; // Return het token als alles succesvol is
  } catch (error) {
    console.error('Login fout:', error.message); // Log de fout voor debugging
    return { error: 'Er is een fout opgetreden tijdens het inloggen' }; // Return een algemene foutmelding
  }
}
