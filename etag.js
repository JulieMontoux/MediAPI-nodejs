const crypto = require('crypto');

function generateETag(data) {
  const str = JSON.stringify(data);
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

module.exports = {
  generateETag,
};
