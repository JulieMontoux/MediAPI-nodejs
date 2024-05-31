const db = require('../db');

// POST
exports.createEmprunt = async ({ id_livre, email, nom, prenom }) => {
  const trx = await db.transaction();
  try {
    // Vérifier la quantité disponible du livre
    const livre = await trx('livres').where({ id: id_livre }).first();
    const empruntsEnCours = await trx('emprunt').where({ id_livre, date_retour: null }).count();
    const quantiteDisponible = livre.quantite - empruntsEnCours[0]['count(*)'];

    if (quantiteDisponible <= 0) {
      throw new Error('Le livre n\'est pas empruntable (quantité disponible = zéro)');
    }

    // Vérifier ou créer la personne
    let personne = await trx('personnes').where({ email }).first();
    if (!personne) {
      const [personneId] = await trx('personnes').insert({ email, nom, prenom }).returning('id');
      personne = { id: personneId };
    } else {
      await trx('personnes').where({ email }).update({ nom, prenom });
    }

    // Créer l'emprunt
    const date_emprunt = new Date();
    const [empruntId] = await trx('emprunt').insert({ id_livre, id_personne: personne.id, date_emprunt }).returning('id');

    await trx.commit();
    return empruntId;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

// PUT
exports.updateEmprunt = async (id) => {
  try {
    const date_retour = new Date();
    await db('emprunt').where({ id }).update({ date_retour });
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour de l\'emprunt');
  }
};
