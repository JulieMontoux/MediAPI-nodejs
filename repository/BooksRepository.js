const db = require('../db');
const authorRepository = require('./AuthorsRepository');

// GET
exports.getAllBooks = () => {
  return db('livres').select('*');
};

exports.getBookById = (id) => {
  return db('livres').where({ id }).first();
};

exports.getBookQuantity = async (id) => {
  const livre = await db('livres').where({ id }).first();
  const emprunts = await db('emprunt').where({ id_livre: id, date_retour: null });
  const quantiteDisponible = livre.quantite - emprunts.length;
  return { quantiteTotale: livre.quantite, quantiteDisponible };
};

// POST
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

// DELETE
exports.deleteBook = async (id) => {
  const emprunts = await db('emprunt').where({ id_livre: id, date_retour: null });
  if (emprunts.length > 0) {
    throw new Error('Impossible de supprimer le livre avec des emprunts en cours');
  }
  await db('livres').where({ id }).del();
};

// RECHERCHE
exports.searchBooks = async (mots) => {
  const words = mots.split(' ');

  const books = await db('livres')
    .leftJoin('auteur_livre', 'livres.id', 'auteur_livre.id_livre')
    .leftJoin('auteurs', 'auteur_livre.id_auteur', 'auteurs.id')
    .where(builder => {
      words.forEach(word => {
        builder.orWhere('livres.titre', 'like', `%${word}%`)
          .orWhere('auteurs.nom', 'like', `%${word}%`)
          .orWhere('auteurs.prenom', 'like', `%${word}%`);
      });
    })
    .select('livres.*', 'auteurs.nom as auteur_nom', 'auteurs.prenom as auteur_prenom');

  books.sort((a, b) => {
    const aMatches = words.reduce((acc, word) => {
      return acc + (a.titre.includes(word) ? 1 : 0) +
        (a.auteur_nom.includes(word) ? 1 : 0) +
        (a.auteur_prenom.includes(word) ? 1 : 0);
    }, 0);

    const bMatches = words.reduce((acc, word) => {
      return acc + (b.titre.includes(word) ? 1 : 0) +
        (b.auteur_nom.includes(word) ? 1 : 0) +
        (b.auteur_prenom.includes(word) ? 1 : 0);
    }, 0);

    return bMatches - aMatches;
  });

  return books;
};