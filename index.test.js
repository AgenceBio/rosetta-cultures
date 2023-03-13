import { describe, test } from 'node:test'
import { deepEqual } from 'node:assert/strict'
import { fromCodeCpf, fromCodePac } from './index.js'

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

describe('fromCodeCpf', () => {
  test('returns a matching code object', () => {
    deepEqual(fromCodeCpf('01.11.20'), expectation)
  })

  test('returns nothing if not matching', () => {
    deepEqual(fromCodeCpf('999.99'), undefined)
  })

  test('returns nothing if filtered out', () => {
    deepEqual(fromCodeCpf('10.12.99'), undefined)
    deepEqual(fromCodeCpf('01.4'), undefined)
    deepEqual(fromCodeCpf('01.47'), undefined)
    deepEqual(fromCodeCpf('01.47.11'), undefined)
    deepEqual(fromCodeCpf('01.6'), undefined)
    deepEqual(fromCodeCpf('01.61'), undefined)
    deepEqual(fromCodeCpf('01.61.1'), undefined)
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
