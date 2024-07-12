const express = require('express');
const router = express.Router();
const bookController = require('../controllers/BooksControllers');

router.get('/livre', bookController.getAllBooks);
router.get('/livre/:id', bookController.getBookById);
router.get('/livre/:id/quantite', bookController.getBookQuantity);

router.post('/livre', bookController.createBook);

router.put('/livre/:id', bookController.updateBook);
router.put('/livre/:id/quantite', bookController.updateBookQuantity);

router.delete('/livre/:id', bookController.deleteBook);

router.get('/recherche/:mots', bookController.searchBooks);

module.exports = router;
