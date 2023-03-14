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
    code_pac: string;
    libelle_code_pac: string;
    code_groupe_pac: string;
    libelle_groupe_pac: string;
};
