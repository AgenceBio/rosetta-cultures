import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCpfResolver, isOrganicProductionCode, toBoolean } from '../src/resolvers.js'
import { cepageCategorieCpf } from '../src/cepages.js'

const here = dirname(fileURLToPath(new URL(import.meta.url)))

const CEPAGES_FILEPATH = join(here, '..', 'data', 'cepages.csv')
const CODES_FILEPATH = join(here, '..', 'data', 'nomenclature.csv')
const CORRESPONDANCE_BV_FILEPATH = join(here, '..', 'data', 'correspondance-bureau-veritas.csv')
const CORRESPONDANCE_GEOFOLIA_FILEPATH = join(here, '..', 'data', 'correspondance-geofolia.csv')
const CORRESPONDANCE_PAC_FILEPATH = join(here, '..', 'data', 'correspondance.csv')
const DESTINATION_FILE = join(here, '..', 'data', 'cpf.json')
const DESTINATION_CEPAGES_FILE = join(here, '..', 'data', 'cepages.json')

/**
 * @typedef {import('../index').UnifiedCulture} UnifiedCulture
 * @typedef {import('../index').PawcCulture} PacCulture
 * @typedef {import('../cepages').} Cepage
 */

/**
 * @type {Map<String, UnifiedCulture>}
 */
const CPF = new Map()
const PAC = new Map()

/**
 * @type {Map<String, Cepage>}
 */
const CEPAGES = new Map()

// 1. Load all CPF codes
let csvParser = createReadStream(CODES_FILEPATH).pipe(parse({
  columns: true,
  delimiter: ',',
  trim: true,
  cast: false
}))

for await (const { code_production: code_cpf, lbl_production, actif, lien_code, groupe, sous_groupe } of csvParser) {
  CPF.set(code_cpf, {
    code_cpf,
    code_cpf_alias: lien_code,
    libelle_code_cpf: lbl_production,
    groupe,
    sous_groupe,
    //
    is_selectable: toBoolean(actif),
    // mappings
    code_bureau_veritas: null,
    codes_geofolia: [],
    // extension PAC
    cultures_pac: [],
  })
}

// 2. Join PAC codes on matching CPF code
csvParser = createReadStream(CORRESPONDANCE_PAC_FILEPATH).pipe(parse({
  columns: true,
  delimiter: ',',
  trim: true,
  cast: false
}))

const resolve = createCpfResolver(Array.from(CPF.values()))

for await (const { code_pac, code_precision, lbl_pac, code_cpf, correspondance_directe } of csvParser) {
  const resolvedRecords = resolve(code_cpf)

  if (resolvedRecords.length === 0) {
    // throw new Error(`Le code PAC ${code_pac} est associé au CPF ${code_cpf}… qui n'est pas connu dans le fichier nomenclature.csv`)
    console.error(`Le code CPF ${code_cpf} associé à ${code_pac} est introuvable dans nomenclature.csv`)
  }

  /**
   * @type {PacCulture}
   */
  const new_culture = {
    code: code_pac,
    precision: code_precision ?? '',
    libelle: lbl_pac,
    requires_precision: toBoolean(correspondance_directe) === false
  }

  const code_with_precision = `${code_pac}:${code_precision}`
  PAC.set(code_with_precision, new_culture)
  resolvedRecords.forEach(({ code_cpf }) => {
    const record = CPF.get(code_cpf)
    CPF.set(code_cpf, {
      ...record,
      // extension PAC
      cultures_pac: Array.isArray(record.cultures_pac) ? [...record.cultures_pac, [code_pac, code_precision]] : [[code_pac, code_precision]]
    })
  })
}

// 3. Join BV codes on CPF code
csvParser = createReadStream(CORRESPONDANCE_BV_FILEPATH).pipe(parse({
  columns: true,
  delimiter: '\t',
  trim: true,
  cast: false
}))

for await (const { "N°DQF": code_bureau_veritas, code_production: code_cpf } of csvParser) {
  if (!code_cpf || !isOrganicProductionCode(code_cpf)) {
    continue
  }

  const resolvedRecords = resolve(code_cpf)

  if (resolvedRecords.length === 0) {
    console.error(`Le code CPF ${code_cpf} de correspondance-bureau-veritas.csv est introuvable dans nomenclature.csv`)
    continue
  }

  const record = CPF.get(code_cpf)

  if (record.code_bureau_veritas) {
    console.error(`Le code CPF ${code_cpf} est déjà associé au code BV ${record.code_bureau_veritas}.`)
  }

  CPF.set(code_cpf, { ...record, code_bureau_veritas })
}

// 4. Join Geofolia codes on CPF code
csvParser = createReadStream(CORRESPONDANCE_GEOFOLIA_FILEPATH).pipe(parse({
  columns: ['code_gf', 'code_cpf'],
  delimiter: ',',
  trim: true,
  cast: false
}))

for await (const { code_gf, code_cpf } of csvParser) {
  if (!code_cpf || !isOrganicProductionCode(code_cpf)) {
    continue
  }

  const resolvedRecords = resolve(code_cpf)

  if (resolvedRecords.length === 0) {
    console.error(`Le code CPF ${code_cpf} dans le fichier correspondance-geofolia.csv associé à ${code_gf} est introuvable dans nomenclature.csv`)
    continue
  }

  const record = CPF.get(code_cpf)
  record.codes_geofolia.push(code_gf)

  CPF.set(code_cpf, { ...record, codes_geofolia: Array.from(new Set(record.codes_geofolia)) })
}

// 10. Parse Cepages
csvParser = createReadStream(CEPAGES_FILEPATH).pipe(parse({
  columns: true,
  delimiter: ',',
  trim: true,
  cast: false
}))

const CEPAGE_LIBELLE_RE = /\s(B|RS|N|R)$/i
const CEPAGE_SELECTABLE_RE = /^supprim/i

for await (const { Code, Libellé, Couleur, Catégorie, Statut } of csvParser) {
  if (Code === '0') {
    continue
  }

  CEPAGES.set(String(Code), {
    code: String(Code),
    code_cpf: cepageCategorieCpf(Catégorie),
    couleur: Couleur,
    libelle: Libellé.replace(CEPAGE_LIBELLE_RE, ''),
    is_selectable: !CEPAGE_SELECTABLE_RE.test(Statut)
  })
}

// 99. Write
await writeFile(DESTINATION_FILE, JSON.stringify({
  "CPF": Array.from(CPF.values()),
  "PAC": Array.from(PAC.values()),
}, null, 2))
await writeFile(DESTINATION_CEPAGES_FILE, JSON.stringify(Object.fromEntries(CEPAGES.entries()), null, 2))
