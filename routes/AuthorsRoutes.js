const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/AuthorsControllers');

router.get('/auteur', authorsController.getAllAuthors);
router.get('/auteur/:id', authorsController.getAuthorById);
router.post('/auteur', authorsController.createAuthor);
router.put('/auteur/:id', authorsController.updateAuthor);
router.delete('/auteur/:id', authorsController.deleteAuthor);

module.exports = router;
