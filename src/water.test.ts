import { describe, expect, it } from 'vitest'
import { progress, total } from './water'

describe('water', () => {
  it('counts glasses in ml', () => expect(total(3)).toBe(750))
  it('caps progress at 1', () => expect(progress(20, 2000)).toBe(1))
})
