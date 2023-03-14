/**
 * Built with `npm run build`
 * @type {Array.<UnifiedCulture>}
 */
import cpf from './data/cpf.json' assert { type: 'json' }

/**
 * @typedef UnifiedCulture
 * @property {String} code_cpf_bio
 * @property {String} libelle_code_cpf_bio
 * @property {String} groupe
 * @property {String} sous_groupe
 * @property {String} code_pac
 * @property {String} libelle_code_pac
 * @property {String} code_groupe_pac
 * @property {String} libelle_groupe_pac
 */

/**
 * @param {String} code
 * @returns {UnifiedCulture}
 */
export function fromCodePac (code) {
  return cpf.find(({ code_pac }) => code_pac === code)
}

/**
 * @param {String} code
 * @returns {UnifiedCulture}
 */
export function fromCodeCpf (code) {
  return cpf.find(({ code_cpf_bio }) => code_cpf_bio === code)
}


/**
 * @see https://mattermost.incubateur.net/betagouv/pl/nn6psexgw3bedq16yisrpj777h
 * > Oui 01 et 02 en enlevant les productions animales
 * > En enlevant 01.4, 01.5 et 01.6
 */
const CPF_ORGANIC_PRODUCTION_RE = /^(01(?!.[456][1-9]?(.\d{1,3})*).+|02(.\d{1,3})+)$/

/**
 *
 * @param {String} code
 * @returns {Boolean}
 */
export function isOrganicProductionCode (code) {
  return CPF_ORGANIC_PRODUCTION_RE.test(code)
}
