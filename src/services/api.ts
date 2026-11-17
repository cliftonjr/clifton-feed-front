import type { Post, User } from '../types'

export const BASE_URL = 'https://jsonplaceholder.typicode.com'

export async function getUsers(signal?: AbortSignal): Promise<User[]> {
  const response = await fetch(`${BASE_URL}/users`, { signal })

  if (!response.ok) {
    throw new Error(
      `Error ${response.status}: no se pudieron obtener los usuarios (${response.statusText || 'Error en la petición'})`
    )
  }

  return response.json() as Promise<User[]>
}

export async function getPostsByUser(
  userId: number,
  signal?: AbortSignal
): Promise<Post[]> {
  const response = await fetch(`${BASE_URL}/posts?userId=${userId}`, { signal })

  if (!response.ok) {
    throw new Error(
      `Error ${response.status}: no se pudieron obtener las publicaciones (${response.statusText || 'Error en la petición'})`
    )
  }

  return response.json() as Promise<Post[]>
}

export async function createPost(payload: Omit<Post, 'id'>): Promise<Post> {
  const response = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(
      `Error ${response.status}: no se pudo crear la publicación (${response.statusText || 'Error en la petición'})`
    )
  }

  return response.json() as Promise<Post>
}
