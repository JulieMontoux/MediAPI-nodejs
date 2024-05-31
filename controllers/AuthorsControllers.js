const authorRepository = require('../repository/AuthorsRepository');

exports.getAllAuthors = async (req, res) => {
  try {
    const authors = await authorRepository.getAllAuthors();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

exports.getAuthorById = async (req, res) => {
  const { id } = req.params;
  try {
    const author = await authorRepository.getAuthorById(id);
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({ error: 'Auteur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

exports.createAuthor = async (req, res) => {
  const { nom, prenom, annee_naissance } = req.body;
  if (!nom || !prenom || !annee_naissance) {
    return res.status(400).json({ error: "Les champs 'nom', 'prenom' et 'annee_naissance' sont obligatoires" });
  }

  try {
    const authorId = await authorRepository.createAuthor({ nom, prenom, annee_naissance });
    res.status(201).json({ id: authorId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateAuthor = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, annee_naissance } = req.body;

  if (!nom || !prenom || !annee_naissance) {
    return res.status(400).json({ error: "Les champs 'nom', 'prenom' et 'annee_naissance' sont obligatoires" });
  }

  try {
    await authorRepository.updateAuthor(id, { nom, prenom, annee_naissance });
    const updatedAuthor = await authorRepository.getAuthorById(id);
    res.json({ success: true, data: updatedAuthor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAuthor = async (req, res) => {
  const { id } = req.params;
  try {
    await authorRepository.deleteAuthor(id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
