import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';  // Voeg de authMiddleware toe
import propertyService from '../services/propertyService.js';

const router = express.Router();

// ✅ Haal alle accommodaties op (zonder authenticatie)
router.get('/', async (req, res) => {
  try {
    const properties = await propertyService.getAllProperties();
    res.json(properties);  // Stuur de lijst met accommodaties terug
  } catch (error) {
    console.error('Fout bij ophalen van accommodaties:', error);
    res.status(500).json({ message: 'Fout bij ophalen van accommodaties', error: error.message });
  }
});

// ✅ Haal een specifieke accommodatie op via ID (zonder authenticatie)
router.get('/:id', async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Accommodatie niet gevonden' });
    }
    
    res.json(property);  // Stuur de accommodatie terug als JSON
  } catch (error) {
    console.error('Fout bij ophalen van accommodatie:', error);
    res.status(500).json({ message: 'Fout bij ophalen van accommodatie', error: error.message });
  }
});

// ✅ Maak een nieuwe accommodatie aan (met authenticatie)
router.post('/', authMiddleware, async (req, res) => {  // authMiddleware toegevoegd
  console.log("Ontvangen data voor nieuwe accommodatie:", req.body); // Log de ontvangen gegevens

  try {
    const { title, description, location, pricePerNight, bedroomCount, bathRoomCount, maxGuestCount, rating, hostId } = req.body;

    // Zorg ervoor dat alle vereiste velden aanwezig zijn
    if (!title || !description || !location || !pricePerNight || !bedroomCount || !bathRoomCount || !maxGuestCount || !hostId) {
      return res.status(400).json({ message: 'Vereiste velden ontbreken' });
    }

    console.log(`HostId ontvangen: ${hostId}`); // Log de hostId voor debuggen

    const newProperty = await propertyService.createProperty(hostId, req.body);
    res.status(201).json(newProperty);  // Stuur succesantwoord terug
  } catch (error) {
    console.error('Fout bij aanmaken van accommodatie:', error);
    res.status(500).json({ message: 'Fout bij aanmaken van accommodatie', error: error.message });
  }
});

// ✅ Werk een bestaande accommodatie bij (PUT) (met authenticatie)
router.put('/:id', authMiddleware, async (req, res) => {  // authMiddleware toegevoegd
  try {
    const { hostId } = req.body;  // Verkrijg de hostId vanuit de body
    const updatedProperty = await propertyService.updateProperty(req.params.id, hostId, req.body);
    res.json(updatedProperty);  // Stuur de bijgewerkte accommodatie terug
  } catch (error) {
    console.error('Fout bij bijwerken van accommodatie:', error);
    res.status(500).json({ message: 'Fout bij bijwerken van accommodatie', error: error.message });
  }
});

// ✅ Verwijder een accommodatie (DELETE) (met authenticatie)
router.delete('/:id', authMiddleware, async (req, res) => {  // authMiddleware toegevoegd
  const { hostId } = req.body;  // Verkrijg de hostId vanuit de body
  try {
    const deleted = await propertyService.deleteProperty(req.params.id, hostId);
    res.json({ message: 'Accommodatie verwijderd', property: deleted });  // Bevestig dat de accommodatie verwijderd is
  } catch (error) {
    console.error('Fout bij verwijderen van accommodatie:', error);
    res.status(500).json({ message: 'Fout bij verwijderen van accommodatie', error: error.message });
  }
});

export default router;  // Exporteer de router zodat deze gebruikt kan worden in je hoofdapplicatie
