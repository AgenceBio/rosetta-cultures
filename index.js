/**
 * Built with `npm run build`
 *
 * @type {Array.<UnifiedCulture>}
 */
import cpf from './data/cpf.json' assert { type: 'json' }

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
 * @typedef PacCulture
 * @property {String} code
 * @property {String} precision
 * @property {String} libelle
 * @property {Boolean} requires_precision
 */

/**
 * @deprecated since version 1.4.0
 * @param {String} code
 * @param {String=} precision
 * @returns {?UnifiedCulture}
 */
export function fromCodePac (code, precision) {
  console.warn("fromCodePac is deprecated, use fromCodePacFirst instead")

  return fromCodePacFirst(code, precision)
}

/**
 * @param {String} code
 * @param {String} precision
 * @returns {?UnifiedCulture}
 */
export function fromCodePacStrict (code, precision) {
  let allMatchs = fromCodePacAll(code, precision)
  let codes = allMatchs.map(({ code_cpf }) => code_cpf)
  let commonPrefix = codes.reduce((acc, code) => {
    let i = 0
    while (code[i] === acc[i] && i < acc.length) {
      i++
    }
    return code.slice(0, i)
  }, codes[0] ?? '').replace(/\.$/, "").split(".")

  if (commonPrefix.length < 2) {
    return null;
  }

  let commonPrefixString = commonPrefix.join(".")
  return cpf.find(({ code_cpf }) => code_cpf === commonPrefixString)
}

/**
 * @param {String} code
 * @param {String} precision
 * @returns {?UnifiedCulture}
 */
export function fromCodePacFirst (code, precision) {
  return fromCodePacAll(code, precision)[0] || null
}

/**
 * Return all CPF codes associated to a given PAC code
 *
 * @param {String} code
 * @param {String=} precision
 * @returns {UnifiedCulture[]}
 */
export function fromCodePacAll (code, precision = null) {
  if (precision) {
    const cleanedPrecision = String(precision).padStart(3, '0')

    const results = cpf.filter(({ cultures_pac }) => {
      return cultures_pac.some(culture => {
        return culture.code === code && culture.precision === cleanedPrecision
      })
    })

    if (results.length) {
      return results
    }
  }

  // otherwise, and in any case, we lookup results without precision
  return cpf.filter(({ cultures_pac }) => {
    return cultures_pac.some(culture => {
      return culture.code === code && culture.precision === ''
    })
  })
}


/**
 * @param {String} code
 * @returns {UnifiedCulture}
 */
export function fromCodeCpf (code) {
  return cpf.find(({ code_cpf }) => code_cpf === code)
}

/**
 * @param {String} code
 * @returns {UnifiedCulture|null}
 */
export function fromCodeGeofolia (code) {
  if (typeof code !== 'string') {
    return null
  }

  const cleanCode = code.trim().replace(/\s+/g, ' ')
  return cpf.find(({ codes_geofolia }) => codes_geofolia.includes(cleanCode)) ?? null
}

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
