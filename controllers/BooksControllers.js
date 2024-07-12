const db = require('../db');
const bookRepository = require('../repository/BooksRepository');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await bookRepository.getAllBooks();
    res.json(books);
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


exports.getBookById = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await bookRepository.getBookById(id);
    const etag = book.etag;
    res.setHeader('ETag', etag);
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  const { id } = req.params;
  const { titre, annee_publication, auteurs } = req.body;
  const ifMatch = req.headers['if-match'];

  if (!ifMatch) {
    return res.status(400).json({ error: 'If-Match header is required' });
  }

  console.log(`If-Match header: '${ifMatch}'`);

  try {
    const book = await bookRepository.getBookById(id);
    console.log(`Current ETag: '${book.etag}'`);

    if (book.etag !== ifMatch) {
      return res.status(412).json({ error: 'ETag non correspondant' });
    }

    const updatedBook = await bookRepository.updateBook(id, { titre, annee_publication, auteurs }, ifMatch);
    res.json(updatedBook);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateBookQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantite } = req.body;
  const ifMatch = req.headers['if-match'];

  if (!ifMatch) {
    return res.status(400).json({ error: 'If-Match header is required' });
  }

  console.log(`If-Match header: '${ifMatch}'`);

  try {
    const book = await bookRepository.getBookById(id);
    console.log(`Current ETag: '${book.etag}'`);

    if (book.etag !== ifMatch) {
      return res.status(412).json({ error: 'ETag non correspondant' });
    }

    const updatedBook = await bookRepository.updateBookQuantity(id, quantite, ifMatch);
    res.json(updatedBook);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la quantité du livre:', error);
    res.status(500).json({ error: error.message });
  }
};
