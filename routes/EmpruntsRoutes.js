const express = require('express');
const router = express.Router();
const empruntsController = require('../controllers/EmpruntsControllers');

router.post('/emprunt', empruntsController.createEmprunt);
router.put('/emprunt/:id', empruntsController.updateEmprunt);

module.exports = router;
