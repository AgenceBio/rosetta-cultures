import { parse } from 'csv-parse'
import { createReadStream } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(new URL(import.meta.url)))

const EXCEPTIONS_RE = /^01.(4$|5$|6$)/
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
  // we keep only '01.'
  // and we skip animal productions ('01.4', '01.5' and '01.6')
  if (CODE.startsWith('01.') && !EXCEPTIONS_RE.test(CODE)) {
    CPF.set(CODE, {
      code_cpf_bio: CODE,
      libelle_code_cpf_bio: libelle,
      groupe: Groupe,
      sous_groupe: Sous_groupe,
      // extension PAC
      code_pac: null,
      libelle_code_pac: '',
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
  // if (!CPF.has(code_cpf_bio)) {
  //   throw new Error(`Le code PAC ${code_pac} est associé au CPF ${code_cpf_bio}… qui n'est pas connu dans le fichier nomenclature.csv`)
  // }

  CPF.set(code_cpf_bio, {
    ...CPF.get(code_cpf_bio),
    // extension PAC
    code_pac,
    libelle_code_pac: lbl_cultu,
    code_groupe_pac: code_grp_cultu,
    libelle_groupe_pac: grp_cultu,
  })
}

// 3. Write
await writeFile(DESTINATION_FILE, JSON.stringify(Array.from(CPF.values()), null, 2))
