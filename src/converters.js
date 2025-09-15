/**
 * Built with `npm run build`
 *
 * @type {{
 *   CPF: Array<CPFCulture>,
 *   PAC: Array<PacCulture>
 * }}
 */
import cpf from '../data/cpf.json' with { type: 'json' }

/**
 * @typedef {import('../index.js').Cepage} Cepage
 */

/**
 * Built with `npm run build`
 *
 * @type {Object.<String, Cepage>}
 */
import cepages from '../data/cepages.json' with { type: 'json' }

/**
 * @typedef {import('../index.js').UnifiedCulture} UnifiedCulture
 * @typedef {import('../index.js').PacCulture} PacCulture
 * @typedef {import('../index.js').CPFCulture} CPFCulture
 */



export function getCulturePAC(codePac, precisionPac = '') {
  const cleanCodePac = typeof codePac === 'string' ? codePac.trim() : codePac
  const cleanPrecisionpac  = typeof precisionPac === 'string' ? precisionPac.trim() : precisionPac

  return cpf.PAC.find(({ code, precision }) => code === cleanCodePac && precision === cleanPrecisionpac)
} 

/**
 * @param {CPFCulture?} culture
 * @return {UnifiedCulture|undefined|null}
 */
export function attachPAC(culture) {
  if (culture === null) return null
  if (!culture) return

  return {
    ...culture,
    cultures_pac: culture.cultures_pac.map(([codePac, codePrecision]) => {
      const culture_pac = getCulturePAC(codePac, codePrecision)

      if (!culture_pac) {
        throw new TypeError(`Missing PAC culture ${codePac} with precision ${codePrecision}`)
      }

      return culture_pac
    })
  }
}

/**
 * @param {String} code
 * @param {String=} precision
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
  return attachPAC(cpf.CPF.find(({ code_cpf }) => code_cpf === commonPrefixString))
}

/**
 * @param {String} code
 * @param {String=} precision
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
  const cleanCode = typeof code === 'string' ? code.trim() : code

  if (precision) {
    const cleanedPrecision = String(precision).trim().padStart(3, '0')

    const results = cpf.CPF.filter(({ cultures_pac }) => {
      return cultures_pac.some(([code_pac, code_precision]) => {
        return code_pac === cleanCode && code_precision === cleanedPrecision
      })
    })

    if (results.length) {
      return results.map(attachPAC)
    }
  }

  // otherwise, and in any case, we lookup results without precision
  return cpf.CPF.filter(({ cultures_pac }) => {
    return cultures_pac.some(([code_pac, code_precision]) => {
      return code_pac === cleanCode && code_precision === ''
    })
  }).map(attachPAC)
}


/**
 * @param {String} code
 * @returns {UnifiedCulture}
 */
export function fromCodeCpf (code) {
  const cleanCode = typeof code === 'string' ? code.trim() : code

  return attachPAC(cpf.CPF.find(({ code_cpf }) => code_cpf === cleanCode))
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
  return attachPAC(cpf.CPF.find(({ codes_geofolia }) => codes_geofolia.includes(cleanCode)) ?? null)
}

export function fromCepageCode (code) {
  return cepages[String(code)] ?? null
}
