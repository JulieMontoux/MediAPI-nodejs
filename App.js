const express = require('express');
const bodyParser = require('body-parser');
const bookRoutes = require('./routes/BooksRoutes');
const authorRoutes = require('./routes/AuthorsRoutes');
const empruntRoutes = require('./routes/EmpruntsRoutes');

const app = express();
const PORT = 8000;

const API_KEY = '8f94826adab8ffebbeadb4f9e161b2dc';

app.use(bodyParser.json());

app.use(function (req, res, next) {
    console.log('Time:', Date.now());
    next();
  });

const authenticate = (req, res, next) => {
  const apiKey = req.headers['authorization'];
  if (apiKey === 'Bearer ' + API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.use(authenticate);
app.use('/api', bookRoutes);
app.use('/api', authorRoutes);
app.use('/api', empruntRoutes);

app.get('/api', (req, res) => {
  const data = { message: 'Bienvenue sur MédiAPI' };
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/api/`);
});
