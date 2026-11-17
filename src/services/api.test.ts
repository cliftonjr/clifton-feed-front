import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getUsers, getPostsByUser, createPost, BASE_URL } from './api'
import type { Post, User } from '../types'

describe('api service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getUsers', () => {
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

      await expect(getUsers()).rejects.toThrow(
        'Error 404: no se pudieron obtener los usuarios'
      )
    })
  })

  describe('getPostsByUser', () => {
    it('debe obtener las publicaciones del usuario indicado', async () => {
      const mockPosts: Post[] = [
        { id: 1, userId: 1, title: 'Post 1', body: 'Contenido 1' },
        { id: 2, userId: 1, title: 'Post 2', body: 'Contenido 2' },
      ]

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPosts,
      })
      vi.stubGlobal('fetch', fetchMock)

      const controller = new AbortController()
      const result = await getPostsByUser(1, controller.signal)

      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/posts?userId=1`, {
        signal: controller.signal,
      })
      expect(result).toEqual(mockPosts)
    })

    it('debe lanzar un Error descriptivo con el código de estado si response.ok es false', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(getPostsByUser(1)).rejects.toThrow(
        'Error 500: no se pudieron obtener las publicaciones'
      )
    })
  })

  describe('createPost', () => {
    it('debe enviar la petición POST con los headers adecuados y retornar el post creado', async () => {
      const payload: Omit<Post, 'id'> = {
        userId: 1,
        title: 'Nuevo Título',
        body: 'Nuevo Contenido',
      }
      const createdPost: Post = {
        id: 101,
        ...payload,
      }

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => createdPost,
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await createPost(payload)

      expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      expect(result).toEqual(createdPost)
    })

    it('debe lanzar un Error descriptivo si response.ok es false al crear post', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      })
      vi.stubGlobal('fetch', fetchMock)

      await expect(
        createPost({ userId: 1, title: 'Test', body: 'Test' })
      ).rejects.toThrow('Error 400: no se pudo crear la publicación')
    })
  })
})
