const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('port', process.env.PORT || 5000);

// Obrada JSON podataka
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Početna ruta
app.get('/', (req, res) => {
  res.send('Gym Trainer Availability Webhook');
});

// Webhook ruta za provjeru dostupnosti trenera
app.post('/check_trainer_availability', (req, res) => {
  console.log('Primljen zahtjev:', req.body);

  const { date, time } = req.body.queryResult.parameters;

  // Simulacija baze podataka s dostupnošću trenera
  const trainers = [
    { name: 'Ana', available: ['2025-01-12T10:00:00', '2025-01-12T15:00:00'] },
    { name: 'Marko', available: ['2025-01-12T12:00:00', '2025-01-12T18:00:00'] },
  ];

  const requestedDateTime = `${date}T${time}`;
  let availableTrainer = null;

  trainers.forEach((trainer) => {
    if (trainer.available.includes(requestedDateTime)) {
      availableTrainer = trainer.name;
    }
  });

  let botResponse;

  if (availableTrainer) {
    botResponse = `Trener ${availableTrainer} je dostupan u ${time} na datum ${date}.`;
  } else {
    botResponse = `Nažalost, nijedan trener nije dostupan u ${time} na datum ${date}. Molimo pokušajte s drugim terminom.`;
  }

  res.json({
    fulfillmentText: botResponse,
  });
});

// Pokretanje servera
app.listen(app.get('port'), () => {
  console.log(`Server pokrenut na portu ${app.get('port')}`);
});
