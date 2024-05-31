const express = require('express');
const router = express.Router();
const bookController = require('../controllers/BooksControllers');

router.get('/livres', bookController.getAllBooks);
router.get('/livres/:id', bookController.getBookById);
router.get('/livres/:id/quantite', bookController.getBookQuantity);

router.post('/livres', bookController.createBook);

//router.put('/livres/:id', bookController.updateBook);
//router.put('/livres/:id/quantite', bookController.updateBookQuantity);

router.delete('/livres/:id', bookController.deleteBook);

module.exports = router;
