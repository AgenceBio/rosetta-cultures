import { describe, it } from 'node:test'
import { ok, deepEqual } from 'node:assert/strict'
import {
  createCpfResolver,
  fromCodeCpf,
  fromCodeGeofolia,
  fromCodePacStrict,
  fromCodePacFirst,
  isOrganicProductionCode,
  fromCodePacAll
} from './index.js'
import cultures from './data/cpf.json' assert { type: 'json' };

/**
 * @type {UnifiedCulture}
 */
const partialExpectation = {
  "code_cpf": "01.11.20.1",
  "code_cpf_alias": "",
  "libelle_code_cpf": "Maïs doux",
  "groupe": "Légumes",
  "sous_groupe": "Légumes à feuilles ou tiges",
  "is_selectable": true,
  "code_bureau_veritas": "1147",
  "cultures_pac": [
    {
      "code": "MID",
      "libelle": "Maïs doux",
      "requires_precision": false
    }
  ]
}

describe('isOrganicProductionCode', () => {
  it('this is an organic production code', () => {
    deepEqual(isOrganicProductionCode('01.11'), true)
    deepEqual(isOrganicProductionCode('01.11.20'), true)
    deepEqual(isOrganicProductionCode('01.11.20.1'), true)
    deepEqual(isOrganicProductionCode('02.4'), true)
    deepEqual(isOrganicProductionCode('02.40.10'), true)
    deepEqual(isOrganicProductionCode('08.93.1'), true)
  })

  it('this is not an organic production code', () => {
    deepEqual(isOrganicProductionCode('10.12.99'), false)
    deepEqual(isOrganicProductionCode('01.4'), false)
    deepEqual(isOrganicProductionCode('01.47'), false)
    deepEqual(isOrganicProductionCode('01.47.11'), false)
    deepEqual(isOrganicProductionCode('01.6'), false)
    deepEqual(isOrganicProductionCode('01.61'), false)
    deepEqual(isOrganicProductionCode('01.61.1'), false)
  })
})

describe('fromCodeCpf', () => {
  it('returns a matching code object', () => {
    deepEqual(fromCodeCpf('01.11.20.1').code_cpf, partialExpectation.code_cpf)
  })

  it('returns nothing if not matching', () => {
    deepEqual(fromCodeCpf('999.99'), undefined)
  })

  it('returns nothing if filtered out', () => {
    deepEqual(fromCodeCpf('10.12.99'), undefined)
  })
})

describe('fromCodePacFirstSelectable', () => {
  it('returns a matching code object', () => {
    const record = fromCodePacFirst('MID')
    deepEqual(record.code_cpf, partialExpectation.code_cpf)
    ok(record.cultures_pac.find(({code}) => code === 'MID'))

    ok(fromCodePacFirst('PTR'))
    ok(fromCodePacFirst('MRS'))
  })

  it('returns null if code does not exists', () => {
    deepEqual(fromCodePacFirst('Z@Z'), null)
  })

  it('returns the first match', () => {
    deepEqual(fromCodePacFirst('ZZZ').code_cpf, "01.1") // Cultures non permanentes
    deepEqual(fromCodePacFirst('AGR').code_cpf, "01.23.11") // Pomelos et pamplemousses
  })
})

describe('fromCodePacStrict', () => {
  it('returns returns the smallest full match', () => {
    deepEqual(fromCodePacStrict('AGR').code_cpf, "01.23.1") // Agrumes
  })


  it('returns nothing for codes with no match', () => {
    deepEqual(fromCodePacStrict('ZZZ'), null)
    deepEqual(fromCodePacStrict('@@@'), null)
    deepEqual(fromCodePacStrict(''), null)
    deepEqual(fromCodePacStrict(undefined), null)
    deepEqual(fromCodePacStrict(NaN), null)
    deepEqual(fromCodePacStrict({}), null)
  })
})

describe('fromCodePacAll', () => {
  it('returns all applicable cultures in all mode', () => {
    deepEqual(
      fromCodePacAll('AGR').map(({ code_cpf }) => code_cpf),
      ["01.23.11", "01.23.12", "01.23.13", "01.23.14", "01.23.19"]
    )
  })
})

describe('fromCodeGeofolia', () => {
  it('returns no matching code', () => {
    deepEqual(fromCodeGeofolia(''), null)
    deepEqual(fromCodeGeofolia(null), null)
    deepEqual(fromCodeGeofolia('AAAAAAAAAAAAAA'), null)
  })

  it('returns a single matching code', () => {
    deepEqual(fromCodeGeofolia('E01').code_cpf, '01.24.23')
    deepEqual(fromCodeGeofolia('ZAG').code_cpf, '01.13.42')
    deepEqual(fromCodeGeofolia('E09').code_cpf, '01.13.42')
    deepEqual(fromCodeGeofolia('E10').code_cpf, '01.13.42')
  })

  it('returns a single matching code, even with multiple spaces', () => {
    deepEqual(fromCodeGeofolia('ZAR   ZFB').code_cpf, '01.11.12')
    deepEqual(fromCodeGeofolia('ZAR ZFB').code_cpf, '01.11.12')
    deepEqual(fromCodeGeofolia('ZAQ   ZFA').code_cpf, '01.11.11')
    deepEqual(fromCodeGeofolia('ZAQ ZFA').code_cpf, '01.11.11')
    deepEqual(fromCodeGeofolia('ZAR ZFAI01').code_cpf, '01.11.12')
    deepEqual(fromCodeGeofolia('ZAR   ZFAI01').code_cpf, '01.11.12')
  })
})

describe('data', () => {
  it('should not contain any duplicate code_cpf', () => {
    const codeCpfSet = new Set()
    cultures.forEach(({ code_cpf }) => {
      ok(!codeCpfSet.has(code_cpf))
      codeCpfSet.add(code_cpf)
    })
  })

  it('should not contain any duplicate code_pac which does not require precision', () => {
    const codePacSet = new Set()
    cultures.forEach(({ cultures_pac }) => {
      cultures_pac.forEach(({ code, requires_precision }) => {
        if (requires_precision) return

        ok(!codePacSet.has(code))
        codePacSet.add(code)
      })
    })
  })
})

describe('createCpfResolver', () => {
  const codes = [
    { code_cpf: '10' },
    { code_cpf: '10.1' },
    { code_cpf: '10.10.10' },
    { code_cpf: '10.10.10.01' },
    { code_cpf: '10.10.10.02' },
    { code_cpf: '10.11.10' },
    { code_cpf: '20.1' },
    { code_cpf: '20.10.10' },
  ]

  const resolve = createCpfResolver(codes)

  it('resolves single codes', () => {
    deepEqual(resolve('10'), [{ code_cpf: '10' }])
    deepEqual(resolve('10.1'), [{ code_cpf: '10.1' }])
    deepEqual(resolve(' 10.10.10 '), [{ code_cpf: '10.10.10' }])
  })

  it('resolves lists of single codes', () => {
    const expectation = [{ code_cpf: '10.10.10.01' }, { code_cpf: '10.10.10.02' }]
    deepEqual(resolve('10.10.10.01,10.10.10.02'), expectation)
    deepEqual(resolve(' 10.10.10.01, 10.10.10.02 '), expectation)
  })

  it('resolves patterns of codes', () => {
    const expectation = [{ code_cpf: '10.10.10.01' }, { code_cpf: '10.10.10.02' }]

    deepEqual(resolve('10.10.10.*'), expectation)
    deepEqual(resolve('10.1*'), [{ code_cpf: '10.1' }, { code_cpf: '10.10.10' }, { code_cpf: '10.10.10.01' }, { code_cpf: '10.10.10.02' }, { code_cpf: '10.11.10' },])
    deepEqual(resolve('*'), codes)
  })

  it('resolves lists of single and patterns of codes', () => {
    const expectation = [{ code_cpf: '10.10.10.01' }, { code_cpf: '10.10.10.02' }, { code_cpf: '20.1' }]
    deepEqual(resolve('10.10.10.*, 20.1'), expectation)
  })
})
