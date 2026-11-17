import type { User } from '../types'

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
