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

// PUT
exports.updateBook = async (id, { titre, auteurs }) => {
  console.log(`Début de la mise à jour du livre avec ID ${id}`);
  
  if (!Array.isArray(auteurs)) {
    throw new TypeError('Auteurs doit être un tableau');
  }
  
  const trx = await db.transaction();
  try {
    // Vérifier l'existence des auteurs
    for (const authorId of auteurs) {
      const author = await authorRepository.getAuthorById(authorId, trx);
      if (!author) {
        console.log(`Auteur avec ID ${authorId} n'existe pas`);
        throw new Error(`L'auteur avec l'identifiant ${authorId} n'existe pas`);
      }
    }

    // Mettre à jour le livre
    console.log(`Mise à jour du titre du livre avec ID ${id}`);
    const updatedBook = await trx('livres').where({ id }).update({ titre }).returning('*');

    // Mettre à jour les relations auteur-livre
    console.log(`Mise à jour des relations auteur-livre pour le livre avec ID ${id}`);
    await trx('auteur_livre').where({ id_livre: id }).del();
    for (const authorId of auteurs) {
      await trx('auteur_livre').insert({ id_livre: id, id_auteur: authorId }).transacting(trx);
    }

    await trx.commit();
    console.log(`Livre avec ID ${id} mis à jour avec succès`);
    return updatedBook[0];
  } catch (error) {
    await trx.rollback();
    console.error(`Erreur lors de la mise à jour du livre avec ID ${id}:`, error);
    throw new Error('Erreur lors de la mise à jour du livre');
  }
};
exports.updateBookQuantity = async (id, quantite) => {
  console.log(`Début de la mise à jour de la quantité pour le livre avec ID ${id}`);
  const trx = await db.transaction();
  try {
    const empruntsEnCours = await trx('emprunt').where({ id_livre: id, date_retour: null }).count('id as empruntsCount');
    if (quantite < empruntsEnCours[0].empruntsCount) {
      console.log(`Nouvelle quantité ${quantite} est inférieure au nombre d'emprunts en cours pour le livre avec ID ${id}`);
      throw new Error('La nouvelle quantité est inférieure au nombre d’emprunts en cours');
    }

    console.log(`Mise à jour de la quantité pour le livre avec ID ${id}`);
    const updatedBook = await trx('livres').where({ id }).update({ quantite }).returning('*').transacting(trx);
    await trx.commit();
    console.log(`Quantité du livre avec ID ${id} mise à jour avec succès`);
    return updatedBook[0];
  } catch (error) {
    await trx.rollback();
    console.error(`Erreur lors de la mise à jour de la quantité du livre avec ID ${id}:`, error);
    throw new Error('Erreur lors de la mise à jour de la quantité du livre');
  }
};