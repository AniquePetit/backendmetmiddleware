import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/migrations/prismaClient.js';

const ACCESS_TOKEN_EXPIRATION = '1h'; // Access token verloopt na 1 uur
const REFRESH_TOKEN_EXPIRATION = '7d'; // Refresh token verloopt na 7 dagen

export async function register(email, password, username, name, phoneNumber, profilePicture) {
  try {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await prisma.user.findFirst({ where: { email: normalizedEmail } });

    if (existingUser) {
      return { error: 'Gebruiker bestaat al' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        username,
        name,
        phoneNumber,
        profilePicture,
      },
    });

    return { user: newUser };
  } catch (error) {
    console.error('Registratiefout:', error.message);
    return { error: 'Er is een fout opgetreden tijdens de registratie' };
  }
}

export async function login(email, password) {
  try {
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } });

    if (!user) {
      return { error: 'Gebruiker niet gevonden' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { error: 'Onjuist wachtwoord' };
    }

    if (!process.env.AUTH_SECRET_KEY || !process.env.REFRESH_SECRET_KEY) {
      throw new Error('AUTH_SECRET_KEY of REFRESH_SECRET_KEY ontbreekt in het .env-bestand');
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.AUTH_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    // Sla het refresh token op in de database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Login fout:', error.message);
    return { error: 'Er is een fout opgetreden tijdens het inloggen' };
  }
}

// Functie om refresh token te valideren en een nieuwe access token te genereren
export async function refreshAccessToken(refreshToken) {
  try {
    if (!refreshToken) {
      return { error: 'Geen refresh token opgegeven' };
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.refreshToken !== refreshToken) {
      return { error: 'Ongeldig of verlopen refresh token' };
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.AUTH_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    return { accessToken: newAccessToken };
  } catch (error) {
    console.error('Fout bij refresh token:', error.message);
    return { error: 'Ongeldig of verlopen refresh token' };
  }
}
