const db = require('../db');
const authorRepository = require('./AuthorsRepository');

exports.getAllBooks = () => {
  return db('livres').select('*');
};

exports.getBookById = (id) => {
  return db('livres').where({ id }).first();
};

exports.createBook = async ({ titre = 'Titre inconnu', annee_publication = 0, quantite = 1, auteurs = [] }) => {
  const trx = await db.transaction();
  try {
    console.log("Données du livre à insérer :", { titre, annee_publication, quantite, auteurs });

    if (!Array.isArray(auteurs)) {
      throw new Error('La liste des auteurs doit être un tableau');
    }

    for (const authorId of auteurs) {
      const author = await authorRepository.getAuthorById(authorId, trx);
      if (!author) {
        throw new Error(`L'auteur avec l'identifiant ${authorId} n'existe pas`);
      }
    }

    const [bookId] = await trx('livres').insert({ titre, annee_publication, quantite }).returning('id');
    console.log("ID du livre créé :", bookId);

    for (const authorId of auteurs) {
      await trx('auteur_livre').insert({ id_livre: bookId, id_auteur: authorId });
    }

    await trx.commit();
    console.log("Livre créé avec succès !");
    return bookId;
  } catch (error) {
    await trx.rollback();
    console.error("Erreur lors de la création du livre :", error);
    throw new Error('Erreur lors de la création du livre');
  }
};

exports.updateBook = async (id, { titre, annee_publication, auteurs }) => {
  const trx = await db.transaction();
  try {
    await trx('livres').where({ id }).update({ titre, annee_publication });
    await trx('auteur_livre').where({ id_livre: id }).del();
    if (Array.isArray(auteurs)) {
      for (const authorId of auteurs) {
        const author = await authorRepository.getAuthorById(authorId, trx);
        if (!author) {
          throw new Error(`L'auteur avec l'identifiant ${authorId} n'existe pas`);
        }
        await trx('auteur_livre').insert({ id_livre: id, id_auteur: authorId });
      }
    }
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw new Error('Erreur lors de la mise à jour du livre');
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
    throw new Error("La nouvelle quantité est inférieure au nombre d'emprunts en cours");
  }
  await db('livres').where({ id }).update({ quantite });
};

exports.deleteBook = async (id) => {
  const emprunts = await db('emprunt').where({ id_livre: id, date_retour: null });
  if (emprunts.length > 0) {
    throw new Error('Impossible de supprimer le livre avec des emprunts en cours');
  }
  await db('livres').where({ id }).del();
};
