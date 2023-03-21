import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isOrganicProductionCode, toBoolean } from '../index.js'

const here = dirname(fileURLToPath(new URL(import.meta.url)))

const CODES_FILEPATH = join(here, '..', 'data', 'nomenclature.csv')
const CORRESPONDANCE_PAC_FILEPATH = join(here, '..', 'data', 'correspondance.csv')
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

// code_production,lbl_production,nomenclature,affichage_cartobio,lien_code,lien_lbl,groupe,sous_groupe
// @todo turn this into a testable function
for await (const { code_production: code_cpf, lbl_production, affichage_cartobio, lien_code, groupe, sous_groupe } of csvParser) {
  if (isOrganicProductionCode(code_cpf)) {
    CPF.set(code_cpf, {
      code_cpf,
      code_cpf_alias: lien_code,
      libelle_code_cpf: lbl_production,
      groupe,
      sous_groupe,
      //
      is_selectable: toBoolean(affichage_cartobio),
      // extension PAC
      cultures_pac: [],
    })
  }
}

// 2. Join on matching code
csvParser = createReadStream(CORRESPONDANCE_PAC_FILEPATH).pipe(parse({
  columns: true,
  delimiter: ',',
  trim: true,
  cast: false
}))


for await (const { code_pac, lbl_pac, code_cpf, lbl_cpf, correspondance_cartobio } of csvParser) {
  if (!CPF.has(code_cpf)) {
    // throw new Error(`Le code PAC ${code_pac} est associé au CPF ${code_cpf}… qui n'est pas connu dans le fichier nomenclature.csv`)
    console.error(`Le code PAC ${code_pac} est associé au CPF ${code_cpf}… qui n'est pas connu dans le fichier nomenclature.csv`)
  }

  const record = CPF.get(code_cpf) ?? {}

  /**
   * @type {PacCulture}
   */
  const new_culture = {
    code: code_pac,
    libelle: lbl_pac,
    requires_precision: toBoolean(correspondance_cartobio) === false
  }

  CPF.set(code_cpf, {
    ...record,
    // extension PAC
    cultures_pac: Array.isArray(record.cultures_pac) ? [...record.cultures_pac, new_culture] : [new_culture]
  })
}

// 3. Write
await writeFile(DESTINATION_FILE, JSON.stringify(Array.from(CPF.values()), null, 2))
