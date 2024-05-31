const db = require('../db');
const bookRepository = require('../repository/BooksRepository');

const generateETag = (data) => {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await bookRepository.getAllBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

exports.getBookById = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await bookRepository.getBookById(id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: 'Livre non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

exports.createBook = async (req, res) => {
  const { titre, annee_publication, quantite = 1, auteurs } = req.body;
  try {
    const bookId = await bookRepository.createBook({ titre, annee_publication, quantite, auteurs });
    res.status(201).json({ id: bookId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBookQuantity = async (req, res) => {
  const { id } = req.params;
  try {
    const { quantiteTotale, quantiteDisponible } = await bookRepository.getBookQuantity(id);
    res.json({ quantiteTotale, quantiteDisponible });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

exports.deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    await bookRepository.deleteBook(id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.searchBooks = async (req, res) => {
  const { mots } = req.params;
  try {
    const books = await bookRepository.searchBooks(mots);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
