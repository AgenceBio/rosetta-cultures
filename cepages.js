/**
 * Built with `npm run build`
 *
 * @type {Object.<String, Cepage>}
 */
import cepages from './data/cepages.json' assert { type: 'json' }

/**
 * @typedef Cepage
 * @property {String} code
 * @property {String} libelle
 * @property {CepageCouleur} couleur
 * @property {String=} code_cpf
 * @property {Boolean} is_selectable
 */

export const CepageCouleur = {
  BLANC: 'Blanc',
  INDETERMINÉ: 'Indéterminé',
  NOIR: 'Noir',
  ROUGE: 'Rouge',
  ROSÉ: 'Rose'
}

export const CepageCatégorie = {
  Cuve: '01.21.12',
  Multiplication: '01.21.1',
  Table: '01.21.11',
  Mixte: '01.21.1',
  Interdit: '01.21.1'
}

export function cepageCategorieCpf (categorie) {
  return CepageCatégorie[String(categorie)] ?? null
}

export function fromCepageCode (code) {
  return cepages[String(code)] ?? null
}
