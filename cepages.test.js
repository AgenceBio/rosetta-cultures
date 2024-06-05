import { describe, it } from 'node:test'
import { deepEqual } from 'node:assert/strict'
import { CepageCouleur, fromCepageCode } from './cepages.js'


describe('fromCepageCode()', () => {
  it('should return null when code is not found', () => {
    deepEqual(fromCepageCode(null), null)
    deepEqual(fromCepageCode('0'), null)
  })

  it('should work with an input being either a string or a number', () => {
    deepEqual(fromCepageCode(2251), fromCepageCode('2251'))
  })

  it('should return a known cepage (Raisin as it is not available anymore)', () => {
    const expectation = {
      code: '2251',
      code_cpf: '01.21.1',
      couleur: CepageCouleur.NOIR,
      libelle: 'LIMBERGER',
      is_selectable: false
    }

    deepEqual(fromCepageCode('2251'), expectation)
  })

  it('should return a RAISIN DE CUVE cpf code', () => {
    const expectation = {
      code: '1161',
      code_cpf: '01.21.12',
      couleur: CepageCouleur.BLANC,
      libelle: 'CHENIN',
      is_selectable: true
    }

    deepEqual(fromCepageCode('1161'), expectation)
  })

  it('should return a RAISIN DE TABLE cpf code', () => {
    const expectation = {
      code: '797',
      code_cpf: '01.21.11',
      couleur: CepageCouleur.ROSÉ,
      libelle: 'IGNEA',
      is_selectable: false
    }

    deepEqual(fromCepageCode('797'), expectation)
  })
})
