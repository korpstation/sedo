const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

// Charge le contrat OpenAPI vivant (chemin ancré sur __dirname : indépendant du cwd).
const openapiDocument = YAML.load(path.join(__dirname, '../../openapi.yaml'));

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(openapiDocument, { customSiteTitle: 'SÈDO API' }),
};
