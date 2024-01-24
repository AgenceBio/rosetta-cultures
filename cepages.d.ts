export function cepageCategorieCpf(categorie: any): any;
export function fromCepageCode(code: any): any;
export namespace CepageCouleur {
    let BLANC: string;
    let INDETERMINÉ: string;
    let NOIR: string;
    let ROUGE: string;
    let ROSÉ: string;
}
export namespace CepageCatégorie {
    let Cuve: string;
    let Multiplication: string;
    let Table: string;
    let Mixte: string;
    let Interdit: string;
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
