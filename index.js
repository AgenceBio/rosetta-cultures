export * from './src/converters.js'
export * from './src/resolvers.js'
export * from './src/cepages.js'

/**
 * @typedef UnifiedCulture
 * @property {String} code_cpf
 * @property {String} libelle_code_cpf
 * @property {String} code_cpf_alias
 * @property {String=} code_bureau_veritas
 * @property {String[]} codes_geofolia
 * @property {Boolean} is_selectable
 * @property {String} groupe
 * @property {String} sous_groupe
 * @property {Array.<PacCulture>} cultures_pac
 */

/**
 * @typedef {Omit<UnifiedCulture, 'cultures_pac'> & {
 *   cultures_pac: Array<Array<string>>
 * }} CPFCulture
 */

/**
 * @typedef PacCulture
 * @property {String} code
 * @property {String} precision
 * @property {String} libelle
 * @property {Boolean} requires_precision
 */

/**
 * @typedef Cepage
 * @property {String} code
 * @property {String} libelle
 * @property {import('./src/cepages.js').CepageCouleur} couleur
 * @property {String=} code_cpf
 * @property {Boolean} is_selectable
 */

