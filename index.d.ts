/**
 * @typedef UnifiedCulture
 * @property {String} code_cpf_bio
 * @property {String} libelle_code_cpf_bio
 * @property {String} groupe
 * @property {String} sous_groupe
 * @property {Array.<String>} code_pac
 * @property {Array.<String>} libelle_code_pac
 * @property {Array.<String>} code_groupe_pac
 * @property {Array.<String>} libelle_groupe_pac
 */
/**
 * @param {String} code
 * @returns {UnifiedCulture}
 */
export function fromCodePac(code: string): UnifiedCulture;
/**
 * @param {String} code
 * @returns {UnifiedCulture}
 */
export function fromCodeCpf(code: string): UnifiedCulture;
/**
 *
 * @param {String} code
 * @returns {Boolean}
 */
export function isOrganicProductionCode(code: string): boolean;
export type UnifiedCulture = {
    code_cpf_bio: string;
    libelle_code_cpf_bio: string;
    groupe: string;
    sous_groupe: string;
    code_pac: Array<string>;
    libelle_code_pac: Array<string>;
    code_groupe_pac: Array<string>;
    libelle_groupe_pac: Array<string>;
};
