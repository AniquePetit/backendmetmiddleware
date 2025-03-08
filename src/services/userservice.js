import bcrypt from 'bcryptjs';
import prisma from '../../prisma/migrations/prismaClient.js'; // Zorg ervoor dat dit pad klopt

// Haal een gebruiker op via ID
const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: id },
  });
};

// Werk een gebruiker bij
const updateUser = async (id, userData) => {
  try {
    // Zoek de gebruiker op basis van het ID
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new Error('Gebruiker niet gevonden');
    }

    // Update de gegevens van de gebruiker
    return await prisma.user.update({
      where: { id: id },
      data: {
        name: userData.name || user.name,
        email: userData.email || user.email,
        phoneNumber: userData.phoneNumber || user.phoneNumber,
        pictureUrl: userData.pictureUrl || user.pictureUrl,
      },
    });
  } catch (error) {
    console.error('Fout bij het updaten van gebruiker:', error);
    throw error;
  }
};

// Verwijder een gebruiker
const deleteUser = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new Error('Gebruiker niet gevonden');
    }

    return await prisma.user.delete({
      where: { id: id },
    });
  } catch (error) {
    console.error('Fout bij het verwijderen van gebruiker:', error);
    throw error;
  }
};

// Haal alle gebruikers op
const getAllUsers = async () => {
  return await prisma.user.findMany();
};

// Maak een nieuwe gebruiker aan
const createUser = async (userData) => {
  try {
    if (!userData.email || !userData.password || !userData.username || !userData.pictureUrl) {
      throw new Error('Email, password, username en pictureUrl zijn verplicht');
    }

    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (existingUserByUsername) {
      throw new Error('Gebruiker met dit gebruikersnaam bestaat al');
    }

    const existingUserByEmail = await prisma.user.findMany({
      where: { email: userData.email },
    });

    if (existingUserByEmail.length > 0) {
      throw new Error('Dit e-mailadres is al geregistreerd');
    }

    // Wachtwoord hashen
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        pictureUrl: userData.pictureUrl,
      },
    });

    return newUser;
  } catch (error) {
    console.error('Fout bij het aanmaken van gebruiker:', error);
    throw new Error(`Fout bij het aanmaken van gebruiker: ${error.message}`);
  }
};

export { getAllUsers, createUser, getUserById, updateUser, deleteUser };
