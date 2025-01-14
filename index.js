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

// Webhook ruta za provjeru dostupnosti trenera
app.post('/check_trainer_availability', async (req, res) => {
  console.log('Primljen zahtjev:', req.body);

  const { date, time } = req.body.queryResult.parameters;
  const requestedDateTime = `${date}T${time}`;

  try {
    // Referenca na Firebase
    const trainersRef = db.ref('trainers'); // Pretpostavimo da su treneri u "trainers" čvoru
    const snapshot = await trainersRef.once('value');
    const trainers = snapshot.val();

    let availableTrainer = null;

    // Prolazimo kroz sve trenere iz baze
    for (const trainerKey of Object.keys(trainers)) {
      const trainer = trainers[trainerKey];
      if (trainer.available && trainer.available.includes(requestedDateTime)) {
        availableTrainer = trainer.name;
        break; // Prekinite petlju kad pronađete prvog dostupnog trenera
      }
    }

    let botResponse;

    if (availableTrainer) {
      botResponse = `Trener ${availableTrainer} je dostupan u ${time} na datum ${date}.`;
    } else {
      botResponse = `Nažalost, nijedan trener nije dostupan u ${time} na datum ${date}. Molimo pokušajte s drugim terminom.`;
    }

    res.json({
      fulfillmentText: botResponse,
    });
  } catch (error) {
    console.error('Greška pri pristupu Firebase-u:', error);
    res.status(500).json({
      fulfillmentText: 'Došlo je do greške prilikom proveravanja dostupnosti. Molimo pokušajte ponovo.',
    });
  }
});

app.listen(app.get('port'), () => {
  console.log(`Server pokrenut na portu ${app.get('port')}`);
});
