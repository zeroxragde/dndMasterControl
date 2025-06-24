const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config.json');

function guardarConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = { guardarConfig };