// src/services/bookingService.js
import prisma from '../../prisma/migrations/prismaClient.js';

// Haal boekingen op voor een specifieke gebruiker
const getAllBookings = async (userId) => {
  try {
    // Controleer of de gebruiker bestaat
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error('Gebruiker bestaat niet');
    }

    // Haal de boekingen op voor de gebruiker
    return await prisma.booking.findMany({
      where: { userId: userId },
      include: { property: true }, // Voeg extra info over het property toe als nodig
    });
  } catch (error) {
    console.error('Fout bij het ophalen van boekingen:', error);
    throw new Error('Fout bij het ophalen van boekingen');
  }
};

// Maak een nieuwe boeking aan
const createBooking = async (bookingData) => {
  return await prisma.booking.create({
    data: bookingData,
  });
};

// Werk een bestaande boeking bij
const updateBooking = async (id, updatedData) => {
  return await prisma.booking.update({
    where: { id: id },
    data: updatedData,
  });
};

// Verwijder een boeking
const deleteBooking = async (id) => {
  return await prisma.booking.delete({
    where: { id: id },
  });
};

export { getAllBookings, createBooking, updateBooking, deleteBooking };
