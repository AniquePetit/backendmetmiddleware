import bcrypt from 'bcryptjs';
import prisma from '../prisma/prismaClient.js'; // Zorg ervoor dat dit pad klopt

// Haal een gebruiker op via ID
const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: id },  // Zoek op basis van het ID
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
        name: userData.name || user.name,  // Als naam niet wordt meegegeven, gebruik de bestaande naam
        email: userData.email || user.email,  // Als email niet wordt meegegeven, gebruik de bestaande email
        phoneNumber: userData.phoneNumber || user.phoneNumber,  // Als phoneNumber niet wordt meegegeven, gebruik de bestaande telefoonnummer
        pictureUrl: userData.pictureUrl || user.pictureUrl,  // Als pictureUrl niet wordt meegegeven, gebruik de bestaande pictureUrl
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
    // Zoek de gebruiker op basis van het ID
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new Error('Gebruiker niet gevonden');
    }

    // Verwijder de gebruiker
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
  return await prisma.user.findMany();  // Haal alle gebruikers op
};

// Maak een nieuwe gebruiker aan
const createUser = async (userData) => {
  try {
    // Valideer de gegevens
    if (!userData.email || !userData.password || !userData.username || !userData.pictureUrl) {
      throw new Error('Email, password, username en pictureUrl zijn verplicht');
    }

    // Controleer of de gebruiker al bestaat door naar het unieke 'username' te zoeken
    const existingUserByUsername = await prisma.user.findUnique({
      where: {
        username: userData.username,  // Zoek op basis van het unieke username
      },
    });

    if (existingUserByUsername) {
      throw new Error('Gebruiker met dit gebruikersnaam bestaat al');
    }

    // Controleer of het e-mailadres al bestaat
    const existingUserByEmail = await prisma.user.findMany({
      where: {
        email: userData.email,  // Zoek op basis van email, maar dit is niet uniek
      },
    });

    if (existingUserByEmail.length > 0) {
      throw new Error('Dit e-mailadres is al geregistreerd');
    }

    // Wachtwoord hashen
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Maak de nieuwe gebruiker aan
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword, // Sla het gehashte wachtwoord op
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        pictureUrl: userData.pictureUrl, // Zorg ervoor dat pictureUrl altijd wordt doorgegeven
      },
    });

    return newUser;  // Retourneer de nieuwe gebruiker
  } catch (error) {
    console.error('Fout bij het aanmaken van gebruiker:', error);
    throw new Error(`Fout bij het aanmaken van gebruiker: ${error.message}`);
  }
};

export { getAllUsers, createUser, getUserById, updateUser, deleteUser };
