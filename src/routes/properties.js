import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';  // Voeg de authMiddleware toe
import propertyService from '../services/propertyService.js';

const router = express.Router();

// ✅ Maak een nieuwe accommodatie aan (met authenticatie)
router.post('/', authMiddleware, async (req, res) => {
  console.log("Ontvangen data voor nieuwe accommodatie:", req.body);

  try {
    const {
      title,
      description,
      location,
      pricePerNight,
      bedroomCount,
      bathRoomCount,
      maxGuestCount,
      rating,
      hostId
    } = req.body;

    // Validatie van de vereiste velden
    if (!title || !description || !location || !pricePerNight || !bedroomCount || !bathRoomCount || !maxGuestCount || !hostId) {
      return res.status(400).json({ message: 'Vereiste velden ontbreken' });
    }

    // Extra validatie voor numerieke velden
    if (isNaN(pricePerNight) || isNaN(bedroomCount) || isNaN(bathRoomCount) || isNaN(maxGuestCount)) {
      return res.status(400).json({ message: 'Prijs, slaapkamer, badkamer of max. gasten moeten geldige getallen zijn.' });
    }

    const newProperty = await propertyService.createProperty(hostId, req.body);
    console.log("Nieuwe accommodatie aangemaakt:", newProperty);  // Log de aangemaakte accommodatie
    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Fout bij aanmaken van accommodatie:', error);
    res.status(500).json({ message: 'Fout bij aanmaken van accommodatie', error: error.message });
  }
});

// ✅ Haal alle accommodaties op (met queryparameters zoals location, pricePerNight, amenities)
router.get('/', async (req, res) => {
  const { location, pricePerNight, amenities } = req.query;
  console.log("Verzoek voor accommodaties ontvangen met query:", req.query);  // Log de ontvangen query

  try {
    const query = {
      include: {
        host: true,
        amenities: true,
        bookings: true,
        reviews: true,
      },
      where: {},
    };

    // Filteren op locatie
    if (location) {
      query.where.location = { contains: location };  // Verwijder de 'mode' parameter
      console.log('Location filter applied:', location);  // Log de locatiefilter
    }

    // Filteren op prijs per nacht
    if (pricePerNight) {
      query.where.pricePerNight = parseFloat(pricePerNight);  // Zorg ervoor dat de prijs een nummer is
      console.log('Price filter applied:', pricePerNight);  // Log de prijsfilter
    }

    // Filteren op amenities (voorzieningen)
    if (amenities) {
      const amenitiesArray = amenities.split(',').map(item => item.trim());  // Split de string in een array van voorzieningen
      console.log('Filtering with amenities:', amenitiesArray);  // Log de filtering van amenities

      // Voeg filter voor amenities toe
      query.where.amenities = {
        some: {
          name: { in: amenitiesArray },  // Zoek accommodaties die de genoemde voorzieningen hebben
        },
      };
    }

    console.log('Query to Prisma:', query);  // Log de volledige query die naar Prisma wordt gestuurd

    const properties = await propertyService.getFilteredProperties(query);
    console.log('Properties found:', properties);  // Log de gevonden accommodaties

    if (properties.length === 0) {
      return res.status(404).json({ message: 'Geen accommodaties gevonden' });
    }

    res.json(properties);
  } catch (error) {
    console.error('Fout bij ophalen van accommodaties:', error);
    res.status(500).json({ message: 'Fout bij ophalen van accommodaties', error: error.message });
  }
});

// ✅ Haal een specifieke accommodatie op via ID (zonder authenticatie)
router.get('/:id', async (req, res) => {
  console.log(`Verzoek om accommodatie met ID ${req.params.id} op te halen`);  // Log het ID voor ophalen van accommodatie
  try {
    const property = await propertyService.getPropertyById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Accommodatie niet gevonden' });
    }

    res.json(property);
  } catch (error) {
    console.error('Fout bij ophalen van accommodatie:', error);
    res.status(500).json({ message: 'Fout bij ophalen van accommodatie', error: error.message });
  }
});

// ✅ Werk een bestaande accommodatie bij (PUT) (met authenticatie)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { hostId } = req.body;

    // Log de ID van de accommodatie die wordt bijgewerkt
    console.log(`Verzoek om accommodatie met ID ${req.params.id} bij te werken`, req.body);

    const updatedProperty = await propertyService.updateProperty(req.params.id, hostId, req.body);

    if (!updatedProperty) {
      return res.status(404).json({ message: 'Accommodatie niet gevonden voor bijwerken' });
    }

    console.log("Accommodatie bijgewerkt:", updatedProperty);  // Log de bijgewerkte accommodatie
    res.json(updatedProperty);
  } catch (error) {
    console.error('Fout bij bijwerken van accommodatie:', error);
    res.status(500).json({ message: 'Fout bij bijwerken van accommodatie', error: error.message });
  }
});

// ✅ Verwijder een accommodatie (DELETE) (met authenticatie)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { hostId } = req.body;
  try {
    console.log(`Verzoek om accommodatie met ID ${req.params.id} te verwijderen`);  // Log het ID van de accommodatie die verwijderd wordt

    const deleted = await propertyService.deleteProperty(req.params.id, hostId);

    if (!deleted) {
      return res.status(404).json({ message: 'Accommodatie niet gevonden voor verwijdering' });
    }

    console.log("Accommodatie verwijderd:", deleted);  // Log de verwijderde accommodatie
    res.json({ message: 'Accommodatie verwijderd', property: deleted });
  } catch (error) {
    console.error('Fout bij verwijderen van accommodatie:', error);
    res.status(500).json({ message: 'Fout bij verwijderen van accommodatie', error: error.message });
  }
});

export default router;
