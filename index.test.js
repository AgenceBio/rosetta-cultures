import { describe, test } from 'node:test'
import { deepEqual } from 'node:assert/strict'
import { fromCodeCpf, fromCodePac, isOrganicProductionCode } from './index.js'

const expectation = {
  code_cpf_bio: '01.11.20',
  code_groupe_pac: '4',
  code_pac: 'CPZ',
  groupe: 'Grandes Cultures',
  sous_groupe: 'Céréales',
  libelle_code_cpf_bio: 'Maïs grain (yc maïs doux)',
  libelle_code_pac: 'Autre céréale de printemps de genre Zea',
  libelle_groupe_pac: 'Autres céréales'
}

describe('isOrganicProductionCode', () => {
  test('this is an organic production code', () => {
    deepEqual(isOrganicProductionCode('01.11'), true)
    deepEqual(isOrganicProductionCode('01.11.20'), true)
    deepEqual(isOrganicProductionCode('02.4'), true)
    deepEqual(isOrganicProductionCode('02.40.10'), true)
  })

  test('this is not an organic production code', () => {
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
  test('returns a matching code object', () => {
    deepEqual(fromCodeCpf('01.11.20'), expectation)
  })

  test('returns nothing if not matching', () => {
    deepEqual(fromCodeCpf('999.99'), undefined)
  })

  test('returns nothing if filtered out', () => {
    deepEqual(fromCodeCpf('10.12.99'), undefined)
  })
})

describe('fromCodePac', () => {
  test('returns a matching code object', () => {
    deepEqual(fromCodePac('CPZ'), expectation)
  })

  test('returns nothing if not matching', () => {
    deepEqual(fromCodePac('ZZZ'), undefined)
  })
})
