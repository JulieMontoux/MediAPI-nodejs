const db = require('../db');

exports.getAuthorById = (id, trx = db) => {
  return trx('auteurs').where({ id }).first();
};
