const db = require("../db");
const authorRepository = require("./AuthorsRepository");
const { generateETag } = require("../etag");

// GET
exports.getAllBooks = () => {
  return db("livres").select("*");
};

exports.getBookById = async (id) => {
  const book = await db("livres").where({ id }).first();
  if (!book) {
    throw new Error("Livre non trouvé");
  }
  const authorsList = await db("auteur_livre")
    .join("auteurs", "auteur_livre.id_auteur", "auteurs.id")
    .where({ id_livre: id })
    .select("auteurs.id", "auteurs.nom", "auteurs.prenom");

  book.auteurs = authorsList;
  book.etag = generateETag(book);

  return book;
};

// POST
exports.createBook = async ({
  titre = "Titre inconnu",
  annee_publication = 0,
  quantite = 1,
  auteurs = [],
}) => {
  const trx = await db.transaction();
  try {
    if (!Array.isArray(auteurs)) {
      throw new Error("La liste des auteurs doit être un tableau");
    }

    for (const authorId of auteurs) {
      const author = await authorRepository.getAuthorById(authorId);
      if (!author) {
        throw new Error(`L'auteur avec l'identifiant ${authorId} n'existe pas`);
      }
    }

    const bookData = { titre, annee_publication, quantite };
    const [bookId] = await trx("livres").insert(bookData).returning("id");

    for (const authorId of auteurs) {
      await trx("auteur_livre").insert({
        id_livre: bookId,
        id_auteur: authorId,
      });
    }

    await trx.commit();
    return bookId;
  } catch (error) {
    await trx.rollback();
    throw new Error("Erreur lors de la création du livre");
  }
};

// PUT
exports.updateBook = async (
  id,
  { titre, annee_publication, auteurs },
  ifMatch
) => {
  const trx = await db.transaction();
  try {
    const book = await trx("livres").where({ id }).first();
    if (!book) {
      throw new Error("Livre non trouvé");
    }

    const authorsList = await trx("auteur_livre")
      .join("auteurs", "auteur_livre.id_auteur", "auteurs.id")
      .where({ id_livre: id })
      .select("auteurs.id", "auteurs.nom", "auteurs.prenom");
    book.auteurs = authorsList;

    const currentETag = generateETag(book);
    console.log(`Stored ETag: '${currentETag}'`);
    if (currentETag !== ifMatch) {
      throw new Error("ETag non correspondant");
    }

    if (auteurs) {
      for (const authorId of auteurs) {
        const author = await authorRepository.getAuthorById(authorId);
        if (!author) {
          throw new Error(
            `L'auteur avec l'identifiant ${authorId} n'existe pas`
          );
        }
      }
    }

    const updateData = {};
    if (titre) updateData.titre = titre;
    if (annee_publication) updateData.annee_publication = annee_publication;

    if (Object.keys(updateData).length > 0) {
      await trx("livres").where({ id }).update(updateData);
    }

    if (auteurs) {
      await trx("auteur_livre").where({ id_livre: id }).del();
      const authorPromises = auteurs.map((authorId) =>
        trx("auteur_livre").insert({ id_livre: id, id_auteur: authorId })
      );
      await Promise.all(authorPromises);
    }

    await trx.commit();

    const updatedBook = await db("livres").where({ id }).first();
    const updatedAuthorsList = await db("auteur_livre")
      .join("auteurs", "auteur_livre.id_auteur", "auteurs.id")
      .where({ id_livre: id })
      .select("auteurs.id", "auteurs.nom", "auteurs.prenom");

    updatedBook.auteurs = updatedAuthorsList;
    updatedBook.etag = generateETag(updatedBook);
    return updatedBook;
  } catch (error) {
    await trx.rollback();
    throw new Error("Erreur lors de la mise à jour du livre");
  }
};

exports.updateBookQuantity = async (id, quantite, ifMatch) => {
  const trx = await db.transaction();
  try {
    const book = await trx("livres").where({ id }).first();
    if (!book) {
      throw new Error("Livre non trouvé");
    }

    const authorsList = await trx("auteur_livre")
      .join("auteurs", "auteur_livre.id_auteur", "auteurs.id")
      .where({ id_livre: id })
      .select("auteurs.id", "auteurs.nom", "auteurs.prenom");
    book.auteurs = authorsList;

    const currentETag = generateETag(book);
    console.log(`Stored ETag: '${currentETag}'`);
    if (currentETag !== ifMatch) {
      throw new Error("ETag non correspondant");
    }

    const empruntsEnCours = await trx("emprunt")
      .where({ id_livre: id, date_retour: null })
      .count("id as empruntsCount");
    if (quantite < empruntsEnCours[0].empruntsCount) {
      throw new Error(
        "La nouvelle quantité est inférieure au nombre d’emprunts en cours"
      );
    }

    const updatedBookData = { ...book, quantite };
    const updatedETag = generateETag(updatedBookData);

    const updatedBook = await trx("livres")
      .where({ id })
      .update({ quantite })
      .returning("*")
      .transacting(trx);
    await trx.commit();
    updatedBook[0].etag = updatedETag;
    return updatedBook[0];
  } catch (error) {
    await trx.rollback();
    throw new Error("Erreur lors de la mise à jour de la quantité du livre");
  }
};

// DELETE
exports.deleteBook = async (id) => {
  const emprunts = await db("emprunt").where({
    id_livre: id,
    date_retour: null,
  });
  if (emprunts.length > 0) {
    throw new Error(
      "Impossible de supprimer le livre avec des emprunts en cours"
    );
  }
  await db("livres").where({ id }).del();
};

// RECHERCHE
exports.searchBooks = async (mots) => {
  try {
    const words = mots.split(" ");

    const books = await db("livres")
      .leftJoin("auteur_livre", "livres.id", "auteur_livre.id_livre")
      .leftJoin("auteurs", "auteur_livre.id_auteur", "auteurs.id")
      .select(
        "livres.*",
        "auteurs.nom as auteur_nom",
        "auteurs.prenom as auteur_prenom"
      );

    const booksWithScore = books.map((book) => {
      let score = 0;
      words.forEach((word) => {
        if (book.titre && book.titre.toLowerCase().includes(word.toLowerCase()))
          score += 2;
        if (
          book.auteur_nom &&
          book.auteur_nom.toLowerCase().includes(word.toLowerCase())
        )
          score += 1;
        if (
          book.auteur_prenom &&
          book.auteur_prenom.toLowerCase().includes(word.toLowerCase())
        )
          score += 1;
      });
      return { ...book, score };
    });

    const filteredBooks = booksWithScore.filter((book) => book.score > 0);

    const uniqueBooks = Array.from(
      new Set(filteredBooks.map((book) => book.id))
    ).map((id) => filteredBooks.find((book) => book.id === id));

    uniqueBooks.sort((a, b) => b.score - a.score);

    return uniqueBooks;
  } catch (error) {
    throw error;
  }
};
