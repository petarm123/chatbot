const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('port', process.env.PORT || 5000);

// Obrada JSON podataka
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicijalizacija Firebase-a
const serviceAccount = require('./path-to-your-firebase-adminsdk.json'); // Zameni sa svojom datotekom

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-database-name.firebaseio.com', // Zameni sa URL-om tvoje baze
});

const db = admin.database(); // Referenca na Realtime Database

// Webhook ruta za prikaz slobodnih termina trenera
app.post('/check_trainer_availability', async (req, res) => {
  console.log('Primljen zahtjev:', req.body);

  const trainerName = req.body.queryResult.parameters.trainer; // Pretpostavljamo da se unosi ime trenera

  try {
    // Referenca na Firebase
    const trainersRef = db.ref('trainers'); // Pretpostavimo da su treneri u "trainers" čvoru
    const snapshot = await trainersRef.once('value');
    const trainers = snapshot.val();

    let trainer = null;

    // Pronađite trenera prema imenu
    for (const trainerKey of Object.keys(trainers)) {
      if (trainers[trainerKey].name.toLowerCase() === trainerName.toLowerCase()) {
        trainer = trainers[trainerKey];
        break;
      }
    }

    if (trainer) {
      const availableSlots = trainer.available || [];

      if (availableSlots.length > 0) {
        // Prikaz slobodnih termina u formatu čitljivom za korisnike
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
    console.error('Greška pri pristupu Firebase-u:', error);
    res.status(500).json({
      fulfillmentText: 'Došlo je do greške prilikom obrade zahtjeva. Molimo pokušajte ponovo.',
    });
  }
});

app.listen(app.get('port'), () => {
  console.log(`Server pokrenut na portu ${app.get('port')}`);
});
