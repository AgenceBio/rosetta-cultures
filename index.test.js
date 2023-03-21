import { describe, it } from 'node:test'
import { ok, deepEqual } from 'node:assert/strict'
import { createCpfResolver, fromCodeCpf, fromCodePac, isOrganicProductionCode } from './index.js'

/**
 * @typedef {import('./index.js').UnifiedCulture} UnifiedCulture
 * @type {UnifiedCulture}
 */
const partialExpectation = {
  "code_cpf": "01.11.20.1",
  "code_cpf_alias": "",
  "libelle_code_cpf": "Maïs doux",
  "groupe": "Légumes",
  "sous_groupe": "Légumes à feuilles ou tiges",
  "is_selectable": true,
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

describe('fromCodePac', () => {
  it('returns a matching code object', () => {
    const record = fromCodePac('MID')
    deepEqual(record.code_cpf, partialExpectation.code_cpf)
    ok(record.cultures_pac.find(({ code }) => code === 'MID'))

    ok(fromCodePac('PTR'))
    ok(fromCodePac('MRS'))
  })

  // we do not have a case anymore
  it.skip('returns a PAC code without CPF match', () => {
    deepEqual(fromCodePac('ZZZ'), {
      cultures_pac: [{ code: 'ZZZ', 'libelle': 'Culture inconnue', requires_precision: true }]
    })
  })

  it('returns nothing if not matching', () => {
    deepEqual(fromCodePac('Z@Z'), undefined)
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
