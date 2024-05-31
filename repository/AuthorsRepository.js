const db = require('../db');

// GET
exports.getAllAuthors = () => {
  return db('auteurs').select('*');
};

exports.getAuthorById = (id) => {
  return db('auteurs').where({ id }).first();
};

// POST
exports.createAuthor = async ({ nom, prenom, annee_naissance }) => {
  const [authorId] = await db('auteurs').insert({ nom, prenom, annee_naissance }).returning('id');
  return authorId;
};

// PUT
exports.updateAuthor = async (id, { nom, prenom, annee_naissance }) => {
  await db('auteurs').where({ id }).update({ nom, prenom, annee_naissance });
};

// DELETE
exports.deleteAuthor = async (id) => {
  const livres = await db('auteur_livre').where({ id_auteur: id });
  if (livres.length > 0) {
    throw new Error('Impossible de supprimer l\'auteur car il est associé à un ou plusieurs livres');
  }
  await db('auteurs').where({ id }).del();
};
