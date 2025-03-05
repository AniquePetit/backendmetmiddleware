import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prismaClient.js';  // Zorg ervoor dat dit pad klopt

// Functie om nieuwe gebruiker te registreren
export async function register(email, password, username, name, phoneNumber, profilePicture) {
  try {
    // Zet de e-mail om naar lowercase voor consistente vergelijking
    const normalizedEmail = email.toLowerCase();
    
    // Kijk of de gebruiker al bestaat
    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return { error: 'Gebruiker bestaat al' };
    }

    // Hash het wachtwoord voordat je het opslaat in de database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Maak een nieuwe gebruiker aan met de extra gegevens
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword, // Het gehashte wachtwoord wordt opgeslagen
        username: username, // Voeg de gebruikersnaam toe
        name: name, // Voeg de naam toe
        phoneNumber: phoneNumber, // Voeg telefoonnummer toe
        profilePicture: profilePicture, // Voeg profielplaatje toe
      },
    });

    return { user: newUser };
  } catch (error) {
    console.error('Registratiefout:', error.message);
    return { error: 'Er is een fout opgetreden tijdens de registratie' };
  }
}

// Loginfunctie om te controleren of het wachtwoord klopt
export async function login(email, password) {
  try {
    // Zet de e-mail om naar lowercase voor consistente vergelijking
    const normalizedEmail = email.toLowerCase();
    console.log('Proberen gebruiker te vinden met e-mail:', normalizedEmail);

    // Zoek de gebruiker op basis van e-mail
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail }, // Zoek de gebruiker op basis van e-mail
    });

    if (!user) {
      console.log('Gebruiker niet gevonden');
      return { error: 'Gebruiker niet gevonden' };
    }

    console.log('Gebruiker gevonden:', user);

    // Vergelijk het ingevoerde wachtwoord met het opgeslagen gehashte wachtwoord
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Onjuist wachtwoord');
      return { error: 'Onjuist wachtwoord' };
    }

    // Controleer of de geheime sleutel aanwezig is in het .env-bestand
    if (!process.env.AUTH_SECRET_KEY) {
      throw new Error('AUTH_SECRET_KEY ontbreekt in het .env-bestand');
    }

    // Genereer het JWT-token met de gebruikersinformatie
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.AUTH_SECRET_KEY,  // Haal geheime sleutel uit het .env-bestand
      { expiresIn: '1h' }  // Token verloopt na 1 uur
    );

    console.log('Token gegenereerd:', token);
    return { token };
  } catch (error) {
    console.error('Login fout:', error.message);
    return { error: 'Er is een fout opgetreden tijdens het inloggen' };
  }
}
