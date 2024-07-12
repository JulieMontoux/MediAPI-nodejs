const db = require("../db");
const { generateETag } = require("../etag");

// POST
exports.createEmprunt = async ({ id_livre, email, nom, prenom }) => {
  const trx = await db.transaction();
  try {
    const livre = await trx("livres").where({ id: id_livre }).first();
    const empruntsEnCours = await trx("emprunt")
      .where({ id_livre, date_retour: null })
      .count();
    const quantiteDisponible = livre.quantite - empruntsEnCours[0]["count(*)"];

    if (quantiteDisponible <= 0) {
      throw new Error(
        "Le livre n'est pas empruntable (quantité disponible = zéro)"
      );
    }

    let personne = await trx("personnes").where({ email }).first();
    if (!personne) {
      const [personneId] = await trx("personnes").insert({
        email,
        nom,
        prenom,
      });
      personne = { id: personneId };
    } else {
      await trx("personnes").where({ email }).update({ nom, prenom });
    }

    const date_emprunt = new Date().getTime();
    await trx("emprunt").insert({
      id_livre,
      id_personne: personne.id,
      date_emprunt,
    });

    await trx.commit();

    const empruntId = await db.raw("SELECT last_insert_rowid() as id");
    const emprunt = await db("emprunt").where({ id: empruntId[0].id }).first();
    console.log("Emprunt ID:", empruntId[0].id);
    console.log("Emprunt data:", emprunt);
    if (!emprunt) {
      throw new Error("Erreur lors de la récupération de l'emprunt créé");
    }
    const etag = generateETag(emprunt);
    emprunt.etag = etag;
    console.log(`Generated ETag: '${etag}'`);
    return emprunt;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

// PUT
exports.updateEmprunt = async (id, ifMatch) => {
  const trx = await db.transaction();
  try {
    const emprunt = await trx("emprunt").where({ id }).first();
    if (!emprunt) {
      throw new Error("Emprunt non trouvé");
    }

    console.log("Emprunt data before update:", emprunt);
    const currentETag = generateETag(emprunt);
    console.log(`Stored ETag: '${currentETag}'`);
    console.log(`If-Match header: '${ifMatch}'`);

    if (currentETag !== ifMatch) {
      throw new Error("ETag non correspondant");
    }

    const date_retour = new Date().getTime();
    await trx("emprunt").where({ id }).update({ date_retour });
    await trx.commit();

    const updatedEmprunt = await db("emprunt").where({ id }).first();
    console.log("Updated Emprunt data:", updatedEmprunt);
    updatedEmprunt.etag = currentETag;
    console.log(`Returned ETag: '${currentETag}'`);
    return updatedEmprunt;
  } catch (error) {
    await trx.rollback();
    console.error("Erreur lors de la mise à jour de l'emprunt:", error);
    throw new Error("Erreur lors de la mise à jour de l'emprunt");
  }
};
