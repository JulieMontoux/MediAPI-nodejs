const empruntRepository = require("../repository/EmpruntsRepository");

exports.createEmprunt = async (req, res) => {
  const { id_livre, email, nom, prenom } = req.body;

  if (!id_livre || !email || !nom || !prenom) {
    return res
      .status(400)
      .json({
        error:
          "Les champs 'id_livre', 'email', 'nom' et 'prenom' sont obligatoires",
      });
  }

  try {
    const emprunt = await empruntRepository.createEmprunt({
      id_livre,
      email,
      nom,
      prenom,
    });
    console.log("Created Emprunt:", emprunt);
    res.setHeader("ETag", emprunt.etag);
    res.status(201).json({ id: emprunt.id, etag: emprunt.etag });
  } catch (error) {
    console.error("Erreur lors de la création de l'emprunt:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateEmprunt = async (req, res) => {
  const { id } = req.params;
  const ifMatch = req.headers["if-match"];

  if (!ifMatch) {
    return res.status(400).json({ error: "If-Match header is required" });
  }

  console.log(`If-Match header: '${ifMatch}'`);

  try {
    const emprunt = await empruntRepository.updateEmprunt(id, ifMatch);
    console.log(`Returned ETag: '${emprunt.etag}'`);
    res.setHeader("ETag", emprunt.etag);
    res
      .status(200)
      .json({
        success: true,
        message: "Date de retour mise à jour",
        data: emprunt,
      });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'emprunt:", error);
    res.status(400).json({ error: error.message });
  }
};
