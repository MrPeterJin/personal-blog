/**
 * @jest-environment node
 */

import { adjustPageProperties } from '@/lib/db/notion/getPageProperties'

jest.mock('notion-utils', () => ({
  getDateValue: jest.fn(),
  getTextContent: jest.fn()
}))

jest.mock('@/lib/db/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {
    getUsers: jest.fn()
  }
}))

describe('adjustPageProperties', () => {
  it('uses category mapping for pages only when the page category is mapped', () => {
    const NOTION_CONFIG = {
      POST_URL_PREFIX: '%category%/%year%/%month%/%day%',
      POST_URL_PREFIX_MAPPING_CATEGORY: {
        Guide: 'manual'
      },
      PSEUDO_STATIC: false
    }

    const mappedPage = {
      id: 'page-id',
      type: 'Page',
      slug: 'a-manual',
      category: 'Guide'
    }
    const plainPage = {
      id: 'plain-id',
      type: 'Page',
      slug: 'a-book',
      category: 'Book'
    }

    adjustPageProperties(mappedPage, NOTION_CONFIG)
    adjustPageProperties(plainPage, NOTION_CONFIG)

    expect(mappedPage.slug).toBe('manual/a-manual')
    expect(mappedPage.href).toBe('/manual/a-manual')
    expect(plainPage.slug).toBe('a-book')
    expect(plainPage.href).toBe('/a-book')
  })

  it('normalizes precomputed digest password to lowercase', () => {
    const digestPage = {
      id: 'digest-page',
      type: 'Post',
      slug: 'digest-post',
      password:
        'AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233445566778899'
    }

    adjustPageProperties(digestPage, {})

    expect(digestPage.password).toBe(
      'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899'
    )
  })

  it('normalizes legacy md5 password to lowercase', () => {
    const legacyPage = {
      id: 'legacy-page',
      type: 'Post',
      slug: 'legacy-post',
      password: 'AABBCCDDEEFF00112233445566778899'
    }

    adjustPageProperties(legacyPage, {})

    expect(legacyPage.password).toBe('aabbccddeeff00112233445566778899')
  })
})
