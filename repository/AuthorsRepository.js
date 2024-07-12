const db = require('../db');
const { generateETag } = require('../etag');

// GET
exports.getAllAuthors = async () => {
  const authors = await db('auteurs').select('*');
  return authors.map(author => {
    author.etag = generateETag(author);
    return author;
  });
};

exports.getAuthorById = async (id) => {
  const author = await db('auteurs').where({ id }).first();
  if (author) {
    author.etag = generateETag(author);
  }
  return author;
};

// POST
exports.createAuthor = async ({ nom, prenom, annee_naissance }) => {
  const [authorId] = await db('auteurs').insert({ nom, prenom, annee_naissance }).returning('id');
  return authorId;
};

// PUT
exports.updateAuthor = async (id, { nom, prenom, annee_naissance }, ifMatch) => {
  const trx = await db.transaction();
  try {
    const author = await trx('auteurs').where({ id }).first();
    if (!author) {
      throw new Error('Auteur non trouvé');
    }

    const currentETag = generateETag(author);
    console.log(`Stored ETag: '${currentETag}'`);
    console.log(`If-Match header: '${ifMatch}'`);

    if (currentETag !== ifMatch) {
      throw new Error('ETag non correspondant');
    }

    const updateData = { nom, prenom, annee_naissance };
    await trx('auteurs').where({ id }).update(updateData);
    await trx.commit();

    const updatedAuthor = await db('auteurs').where({ id }).first();
    updatedAuthor.etag = generateETag(updatedAuthor);
    return updatedAuthor;
  } catch (error) {
    await trx.rollback();
    console.error('Erreur lors de la mise à jour de l\'auteur:', error);
    throw new Error('Erreur lors de la mise à jour de l\'auteur');
  }
};

// DELETE
exports.deleteAuthor = async (id) => {
  const livres = await db('auteur_livre').where({ id_auteur: id });
  if (livres.length > 0) {
    throw new Error('Impossible de supprimer l\'auteur car il est associé à un ou plusieurs livres');
  }
  await db('auteurs').where({ id }).del();
};
