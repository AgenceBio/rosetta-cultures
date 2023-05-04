import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCpfResolver, isOrganicProductionCode, toBoolean } from '../index.js'

const here = dirname(fileURLToPath(new URL(import.meta.url)))

const CODES_FILEPATH = join(here, '..', 'data', 'nomenclature.csv')
const CORRESPONDANCE_PAC_FILEPATH = join(here, '..', 'data', 'correspondance.csv')
const CORRESPONDANCE_BV_FILEPATH = join(here, '..', 'data', 'correspondance-bureau-veritas.csv')
const DESTINATION_FILE = join(here, '..', 'data', 'cpf.json')

/**
 * @typedef {import('../index.js').UnifiedCulture} UnifiedCulture
 * @typedef {import('../index.js').PacCulture} PacCulture
 * @type {Map<String, UnifiedCulture>}
 */
const CPF = new Map()

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

for await (const { code_pac, lbl_pac, code_cpf, lbl_cpf, correspondance_directe } of csvParser) {
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
    libelle: lbl_pac,
    requires_precision: toBoolean(correspondance_directe) === false
  }

  resolvedRecords.forEach(({ code_cpf }) => {
    const record = CPF.get(code_cpf)
    CPF.set(code_cpf, {
      ...record,
      // extension PAC
      cultures_pac: Array.isArray(record.cultures_pac) ? [...record.cultures_pac, new_culture] : [new_culture]
    })
  })
}

// 3. Join BV codes on CPF code
csvParser = createReadStream(CORRESPONDANCE_BV_FILEPATH).pipe(parse({
  columns: true,
  delimiter: ',',
  trim: true,
  cast: false
}))

for await (const { PAB_CODE_DQF: code_bureau_veritas, CODE_CPF: code_cpf } of csvParser) {
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

// 99. Write
await writeFile(DESTINATION_FILE, JSON.stringify(Array.from(CPF.values()), null, 2))
