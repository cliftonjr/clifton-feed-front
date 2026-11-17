import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getUsers, BASE_URL } from './api'
import type { User } from '../types'

describe('api service - getUsers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('debe obtener la lista de usuarios correctamente', async () => {
    const mockUsers: User[] = [
      { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
      { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' },
    ]

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    })
    vi.stubGlobal('fetch', fetchMock)

    const controller = new AbortController()
    const result = await getUsers(controller.signal)

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/users`, {
      signal: controller.signal,
    })
    expect(result).toEqual(mockUsers)
  })

  it('debe lanzar un Error descriptivo con el código de estado si response.ok es false', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getUsers()).rejects.toThrow('Error 404: no se pudieron obtener los usuarios')
  })
})
