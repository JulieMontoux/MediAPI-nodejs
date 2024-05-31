const empruntRepository = require('../repository/EmpruntsRepository');

exports.createEmprunt = async (req, res) => {
  const { id_livre, email, nom, prenom } = req.body;

  if (!id_livre || !email || !nom || !prenom) {
    return res.status(400).json({ error: "Les champs 'id_livre', 'email', 'nom' et 'prenom' sont obligatoires" });
  }

  try {
    const empruntId = await empruntRepository.createEmprunt({ id_livre, email, nom, prenom });
    res.status(201).json({ id: empruntId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateEmprunt = async (req, res) => {
  const { id } = req.params;

  try {
    await empruntRepository.updateEmprunt(id);
    res.status(200).json({ success: true, message: 'Date de retour mise à jour' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
