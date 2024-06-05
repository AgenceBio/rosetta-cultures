/**
 * @typedef {import('../index.js').UnifiedCulture} UnifiedCulture
 * @typedef {import('../index.js').PacCulture} PacCulture
 */

/**
 * @see https://mattermost.incubateur.net/betagouv/pl/nn6psexgw3bedq16yisrpj777h
 * > Oui 01 et 02 en enlevant les productions animales
 * > En enlevant 01.4, 01.5 et 01.6
 * > En ajoutant `08.93.1` (équivalent PAC de `MRS`/Marais salant)
 */
const CPF_ORGANIC_PRODUCTION_RE = /^(01(?!.[456][1-9]?(.\d{1,3})*).+|02(.\d{1,3})+|08.93.1)$/

/**
 *
 * @param {String} code
 * @returns {Boolean}
 */
export function isOrganicProductionCode (code) {
  return CPF_ORGANIC_PRODUCTION_RE.test(code)
}

/**
 * Returns a JavaScript boolean from an Excel string value of '0' or '1'
 *
 * @param {String} excelLikeBoolean
 * @returns {Boolean}
 */
export function toBoolean (excelLikeBoolean) {
  return Boolean(parseInt(excelLikeBoolean, 10))
}

/**
 *
 * @param {UnifiedCulture[]} cultures
 * @returns {function(String):UnifiedCulture[]}
 */
export function createCpfResolver (cultures) {
  const HAS_MANY_RE = /,/g
  const HAS_GLOB_RE = /\*/g

  const filterByValues = (parts) => (code_cpf) => parts.includes(code_cpf)
  const filterByGlob = (parts) => (code_cpf) => parts.some(part => {
    if (part.search(HAS_GLOB_RE) !== -1) {
      return code_cpf.startsWith(part.split(HAS_GLOB_RE).at(0))
    }
    else {
      return code_cpf === part
    }
  })

  /**
   * We have multiple resolution strategies
   * 1. one-to-one (xx.yy.zz)
   * 2. one-to-explicit-many (xx.yy.z1, xx.yy.z2)
   * 3. one-to-range-of-many (xx.yy.*) - correspondance_cartobio = 0
   * 4. lists of all of the above (xx.yy.z1, xx.aa.*, zz.*)
   *
   * @param {String} selector
   * @param {String=} precision
   * @returns {UnifiedCulture[]}
   */
  return function cpfResolver (selector, precision = null) {
    const parts = selector.split(HAS_MANY_RE).map(maybeSelector => maybeSelector.trim())
    const hasGlob = selector.search(HAS_GLOB_RE) !== -1
    const strategyFn = hasGlob ? filterByGlob(parts) : filterByValues(parts)

    return cultures.filter(({ code_cpf }) => strategyFn(code_cpf))
  }
}
