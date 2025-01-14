const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.set('port', process.env.PORT || 5000);

// Obrada JSON podataka 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Učitaj podatke iz lokalnog JSON-a
const trainersData = JSON.parse(fs.readFileSync('./treneri.json', 'utf-8'));

// Webhook ruta za prikaz slobodnih termina trenera
app.post('/check_trainer_availability', (req, res) => {
  console.log('Primljen zahtjev:', req.body);

  const trainerName = req.body.queryResult.parameters.trainers; // Ime trenera iz korisničkog unosa

  try {
    // Pronađite trenera prema imenu
    const trainer = trainersData.trainers.find(t => t.name.toLowerCase() === trainerName.toLowerCase());

    if (trainer) {
      const availableSlots = trainer.available_slots || [];

      if (availableSlots.length > 0) {
        // Prikaz slobodnih termina u čitljivom formatu
        const slotsList = availableSlots
          .map((slot) => new Date(slot).toLocaleString('hr-HR'))
          .join(', ');

        res.json({
          fulfillmentText: `Trener ${trainerName} ima sljedeće slobodne termine: ${slotsList}.`,
        });
      } else {
        res.json({
          fulfillmentText: `Nažalost, trener ${trainerName} trenutno nema slobodnih termina.`,
        });
      }
    } else {
      res.json({
        fulfillmentText: `Trener ${trainerName} nije pronađen u našoj bazi. Molimo pokušajte ponovno s drugim imenom.`,
      });
    }
  } catch (error) {
    console.error('Greška prilikom obrade zahtjeva:', error);
    res.status(500).json({
      fulfillmentText: 'Došlo je do greške prilikom obrade zahtjeva. Molimo pokušajte ponovo.',
    });
  }
});

app.listen(app.get('port'), () => {
  console.log(`Server pokrenut na portu ${app.get('port')}`);
});
