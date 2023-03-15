import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isOrganicProductionCode } from '../index.js'

const here = dirname(fileURLToPath(new URL(import.meta.url)))

const CODES_FILEPATH = join(here, '..', 'data', 'nomenclature.csv')
const CORRESPONDANCE_PAC_FILEPATH = join(here, '..', 'data', 'correspondance.csv')
const DESTINATION_FILE = join(here, '..', 'data', 'cpf.json')
// 0.
const CPF = new Map()

// 1. Load all CPF codes
let csvParser = createReadStream(CODES_FILEPATH).pipe(parse({
  columns: true,
  delimiter: ',',
  trim: true,
  cast: false
}))

// CODE,libelle,Nomenclature,Activite,Groupe,Sous_groupe,Utilisé dans la notification
for await (const { CODE, libelle, Groupe, Sous_groupe } of csvParser) {
  if (isOrganicProductionCode(CODE)) {
    CPF.set(CODE, {
      code_cpf_bio: CODE,
      libelle_code_cpf_bio: libelle,
      groupe: Groupe,
      sous_groupe: Sous_groupe,
      // extension PAC
      // many codes can be linked to a single CPF element
      code_pac: [],
      libelle_code_pac: [],
      code_groupe_pac: [],
      libelle_groupe_pac: []
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

// code_pac,lbl_cultu,code_cpf_bio,libelle_code_cpf_bio,code_grp_cultu,grp_cultu
for await (const { code_pac, lbl_cultu, code_grp_cultu, grp_cultu, code_cpf_bio } of csvParser) {
  if (!CPF.has(code_cpf_bio)) {
    // throw new Error(`Le code PAC ${code_pac} est associé au CPF ${code_cpf_bio}… qui n'est pas connu dans le fichier nomenclature.csv`)
    console.error(`Le code PAC ${code_pac} est associé au CPF ${code_cpf_bio}… qui n'est pas connu dans le fichier nomenclature.csv`)
  }

  const record = CPF.get(code_cpf_bio) ?? {}

  CPF.set(code_cpf_bio, {
    ...record,
    // extension PAC
    code_pac: Array.isArray(record.code_pac) ? [...record.code_pac, code_pac] : [code_pac],
    libelle_code_pac: Array.isArray(record.libelle_code_pac) ? [...record.libelle_code_pac, lbl_cultu] : [lbl_cultu],
    code_groupe_pac: Array.isArray(record.code_groupe_pac) ? [...record.code_groupe_pac, code_grp_cultu] : [code_grp_cultu],
    libelle_groupe_pac: Array.isArray(record.libelle_groupe_pac) ? [...record.libelle_groupe_pac, grp_cultu] : [grp_cultu],
  })
}

// 3. Write
await writeFile(DESTINATION_FILE, JSON.stringify(Array.from(CPF.values()), null, 2))
