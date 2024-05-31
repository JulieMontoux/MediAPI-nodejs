const express = require('express');
const bodyParser = require('body-parser');
const bookRoutes = require('./routes/BooksRoutes');

const app = express();
const PORT = 8000;
const API_KEY = '8f94826adab8ffebbeadb4f9e161b2dc';

app.use(bodyParser.json());

const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.use('/api', authenticate, bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/api/`);
});
