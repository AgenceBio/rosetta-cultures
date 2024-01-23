declare module "index" {
    /**
     * @typedef UnifiedCulture
     * @property {String} code_cpf
     * @property {String} libelle_code_cpf
     * @property {String} code_cpf_alias
     * @property {String?} code_bureau_veritas
     * @property {Boolean} is_selectable
     * @property {String} groupe
     * @property {String} sous_groupe
     * @property {Array.<PacCulture>} cultures_pac
     */
    /**
     * @typedef PacCulture
     * @property {String} code
     * @property {String} libelle
     * @property {Boolean} requires_precision
     */
    /**
     * @deprecated since version 1.4.0
     * @param {String} code
     * @returns {?UnifiedCulture}
     */
    export function fromCodePac(code: string): UnifiedCulture | null;
    /**
     * @param {String} code
     * @returns {?UnifiedCulture}
     */
    export function fromCodePacStrict(code: string): UnifiedCulture | null;
    /**
     * @param {String} code
     * @returns {?UnifiedCulture}
     */
    export function fromCodePacFirst(code: string): UnifiedCulture | null;
    /**
     * @param {String} code
     * @returns {UnifiedCulture[]}
     */
    export function fromCodePacAll(code: string): UnifiedCulture[];
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
    /**
     * Returns a JavaScript boolean from an Excel string value of '0' or '1'
     *
     * @param {String} excelLikeBoolean
     * @returns {Boolean}
     */
    export function toBoolean(excelLikeBoolean: string): boolean;
    /**
     *
     * @param {UnifiedCulture[]} cultures
     * @returns {function(String):UnifiedCulture[]}
     */
    export function createCpfResolver(cultures: UnifiedCulture[]): (arg0: string) => UnifiedCulture[];
    export type UnifiedCulture = {
        code_cpf: string;
        libelle_code_cpf: string;
        code_cpf_alias: string;
        code_bureau_veritas: string | null;
        is_selectable: boolean;
        groupe: string;
        sous_groupe: string;
        cultures_pac: Array<PacCulture>;
    };
    export type PacCulture = {
        code: string;
        libelle: string;
        requires_precision: boolean;
    };
}
declare module "cepages" {
    export function cepageCategorieCpf(categorie: any): any;
    export function fromCepageCode(code: any): any;
    export namespace CepageCouleur {
        const BLANC: string;
        const INDETERMINÉ: string;
        const NOIR: string;
        const ROUGE: string;
        const ROSÉ: string;
    }
    export namespace CepageCatégorie {
        const Cuve: string;
        const Multiplication: string;
        const Table: string;
        const Mixte: string;
        const Interdit: string;
    }
    export type Cepage = {
        code: string;
        libelle: string;
        couleur: {
            BLANC: string;
            INDETERMINÉ: string;
            NOIR: string;
            ROUGE: string;
            ROSÉ: string;
        };
        code_cpf: string | null;
        is_selectable: boolean;
    };
}
