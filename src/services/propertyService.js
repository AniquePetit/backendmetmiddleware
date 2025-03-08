import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Functie om alle accommodaties op te halen
const getAllProperties = async () => {
  try {
    return await prisma.property.findMany({
      include: {
        host: true,
        amenities: true,
        bookings: true,
        reviews: true,
      },
    });
  } catch (error) {
    console.error('Fout bij ophalen van accommodaties:', error);
    throw new Error('Fout bij ophalen van accommodaties');
  }
};

// Functie om gefilterde accommodaties op te halen op basis van queryparameters
const getFilteredProperties = async (query) => {
  try {
    return await prisma.property.findMany(query);
  } catch (error) {
    console.error('Fout bij ophalen van accommodaties met zoekparameters:', error);
    throw new Error('Fout bij ophalen van accommodaties met zoekparameters');
  }
};

// Functie om accommodatie op te halen via ID
const getPropertyById = async (id) => {
  try {
    return await prisma.property.findUnique({
      where: { id },
      include: {
        host: true,
        amenities: true,
        bookings: true,
        reviews: true,
      },
    });
  } catch (error) {
    console.error('Fout bij ophalen van accommodatie via ID:', error);
    throw new Error('Fout bij ophalen van accommodatie via ID');
  }
};

// Functie om een nieuwe accommodatie aan te maken
const createProperty = async (hostId, propertyData) => {
  try {
    // Controleer of de host bestaat met het gegeven hostId
    const host = await prisma.host.findUnique({
      where: { id: hostId },
    });

    // Als de host niet bestaat, gooi dan een duidelijke foutmelding
    if (!host) {
      throw new Error(`Host met id ${hostId} bestaat niet in de database.`);
    }

    // Maak de nieuwe accommodatie aan als de host gevonden is
    const newProperty = await prisma.property.create({
      data: {
        title: propertyData.title,
        description: propertyData.description,
        location: propertyData.location,
        pricePerNight: propertyData.pricePerNight,
        bedroomCount: propertyData.bedroomCount,
        bathRoomCount: propertyData.bathRoomCount,
        maxGuestCount: propertyData.maxGuestCount,
        rating: propertyData.rating || 0,  // Als geen rating, stel standaard op 0
        host: {
          connect: { id: hostId },  // Verbind de accommodatie met de host
        },
      },
    });

    return newProperty;  // Retourneer de nieuwe accommodatie
  } catch (error) {
    console.error('Fout bij het aanmaken van accommodatie:', error);
    throw new Error(`Fout bij aanmaken van accommodatie: ${error.message}`);
  }
};

// Functie om een accommodatie bij te werken
const updateProperty = async (id, hostId, propertyData) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (property && property.hostId === hostId) {
      // Update de accommodatie als de hostId klopt
      const updatedProperty = await prisma.property.update({
        where: { id },
        data: {
          title: propertyData.title,
          description: propertyData.description,
          location: propertyData.location,
          pricePerNight: propertyData.pricePerNight,
          bedroomCount: propertyData.bedroomCount,
          bathRoomCount: propertyData.bathRoomCount,
          maxGuestCount: propertyData.maxGuestCount,
          rating: propertyData.rating || 0,
        },
      });

      return updatedProperty;
    } else {
      throw new Error('Accommodatie niet gevonden of geen rechten');
    }
  } catch (error) {
    console.error('Fout bij updaten van accommodatie:', error);
    throw new Error(`Fout bij updaten van accommodatie: ${error.message}`);
  }
};

// Functie om een accommodatie te verwijderen
const deleteProperty = async (id, hostId) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (property && property.hostId === hostId) {
      // Verwijder de accommodatie als de hostId klopt
      const deletedProperty = await prisma.property.delete({
        where: { id },
      });

      return deletedProperty;
    } else {
      throw new Error('Accommodatie niet gevonden of geen rechten');
    }
  } catch (error) {
    console.error('Fout bij verwijderen van accommodatie:', error);
    throw new Error(`Fout bij verwijderen van accommodatie: ${error.message}`);
  }
};

export default {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFilteredProperties,  // Zorg ervoor dat deze wordt geëxporteerd
};
