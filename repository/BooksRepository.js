const db = require('../db');
const authorRepository = require('./AuthorsRepository');

exports.getAllBooks = () => {
  return db('livres').select('*');
};

exports.getBookById = (id) => {
  return db('livres').where({ id }).first();
};

exports.createBook = async ({ titre, annee_publication, quantite, auteurs }) => {
  const trx = await db.transaction();
  try {
    const [bookId] = await trx('livres').insert({ titre, annee_publication, quantite });
    for (const authorId of auteurs) {
      const author = await authorRepository.getAuthorById(authorId, trx);
      if (!author) {
        throw new Error(`Author with id ${authorId} not found`);
      }
      await trx('auteur_livre').insert({ id_livre: bookId, id_auteur: authorId });
    }
    await trx.commit();
    return bookId;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

exports.updateBook = async (id, { titre, annee_publication, auteurs }) => {
  const trx = await db.transaction();
  try {
    await trx('livres').where({ id }).update({ titre, annee_publication });
    await trx('auteur_livre').where({ id_livre: id }).del();
    for (const authorId of auteurs) {
      const author = await authorRepository.getAuthorById(authorId, trx);
      if (!author) {
        throw new Error(`Author with id ${authorId} not found`);
      }
      await trx('auteur_livre').insert({ id_livre: id, id_auteur: authorId });
    }
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

exports.getBookQuantity = async (id) => {
  const livre = await db('livres').where({ id }).first();
  const emprunts = await db('emprunt').where({ id_livre: id, date_retour: null });
  const quantiteDisponible = livre.quantite - emprunts.length;
  return { quantiteTotale: livre.quantite, quantiteDisponible };
};

exports.updateBookQuantity = async (id, quantite) => {
  const emprunts = await db('emprunt').where({ id_livre: id, date_retour: null });
  if (quantite < emprunts.length) {
    throw new Error('New quantity is less than the number of ongoing loans');
  }
  await db('livres').where({ id }).update({ quantite });
};

exports.deleteBook = async (id) => {
  const emprunts = await db('emprunt').where({ id_livre: id, date_retour: null });
  if (emprunts.length > 0) {
    throw new Error('Cannot delete book with ongoing loans');
  }
  await db('livres').where({ id }).del();
};
