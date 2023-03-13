/**
 * @type {Array.<CodeCpf>}
 * Taken from https://docs.google.com/spreadsheets/d/12HBh_HYLGtNxHZg1gRQtxmkbOGUM0g3h/edit#gid=1619087660
 * and then, with this command:
 *
 * cat src/referentiels/correspondance-pac-cpf.csv | csvjson -i 2 > src/referentiels/correspondance-pac-cpf.json
 */
import cpf from './data/cpf.json' assert { type: 'json' }

/**
 * @typedef CodeCpf
 * @property {String} code_pac
 * @property {String} lbl_cultu
 * @property {String} code_cpf_bio
 * @property {String} libelle_code_cpf_bio
 * @property {String} code_grp_cultu
 * @property {String} grp_cultu
 */

/**
 * @param {String} code
 * @returns {CodeCpf}
 */
export function fromCodePac (code) {
  return cpf.find(({ code_pac }) => code_pac === code)
}

/**
 * @param {String} code
 * @returns {CodeCpf}
 */
export function fromCodeCpf (code) {
  return cpf.find(({ code_cpf_bio }) => code_cpf_bio === code)
}
