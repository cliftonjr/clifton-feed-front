import { useEffect, useState } from 'react'
import type { Post, User } from './types'
import { getPostsByUser, getUsers } from './services/api'
import { UserList } from './components/UserList'
import { PostList } from './components/PostList'
import './App.css'

export default function App() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [usersRetryKey, setUsersRetryKey] = useState<number>(0)

  // Publicaciones obtenidas de la API para el usuario seleccionado
  const [apiPosts, setApiPosts] = useState<Post[]>([])
  // Publicaciones creadas en memoria durante la sesión organizadas por userId
  const [createdPostsByUser, setCreatedPostsByUser] = useState<Record<number, Post[]>>({})
  const [isPostsLoading, setIsPostsLoading] = useState<boolean>(false)
  const [postsError, setPostsError] = useState<string | null>(null)
  const [postsRetryKey, setPostsRetryKey] = useState<number>(0)

  // Carga inicial y reintento de usuarios
  useEffect(() => {
    const controller = new AbortController()

    getUsers(controller.signal)
      .then((data) => {
        setUsers(data)
        setUsersError(null)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Ocurrió un error inesperado al cargar los usuarios'
        setUsersError(message)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingUsers(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [usersRetryKey])

  // Carga de publicaciones por usuario seleccionado con cancelación reactiva
  useEffect(() => {
    if (selectedUserId === null) {
      return
    }

    const controller = new AbortController()

    getPostsByUser(selectedUserId, controller.signal)
      .then((data) => {
        setApiPosts(data)
        setPostsError(null)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al cargar las publicaciones del usuario'
        setPostsError(message)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsPostsLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [selectedUserId, postsRetryKey])

  const handleRetryUsers = () => {
    setIsLoadingUsers(true)
    setUsersError(null)
    setUsersRetryKey((prev) => prev + 1)
  }

  const handleSelectUser = (user: User) => {
    if (selectedUserId === user.id) {
      return
    }
    setSelectedUserId(user.id)
    setApiPosts([])
    setIsPostsLoading(true)
    setPostsError(null)
  }

  const handleRetryPosts = () => {
    setIsPostsLoading(true)
    setPostsError(null)
    setPostsRetryKey((prev) => prev + 1)
  }

  const handlePostCreated = (newPost: Post) => {
    if (!selectedUserId) {
      return
    }
    const postWithUniqueId: Post = {
      ...newPost,
      id: Date.now(),
    }
    setCreatedPostsByUser((prev) => ({
      ...prev,
      [selectedUserId]: [postWithUniqueId, ...(prev[selectedUserId] ?? [])],
    }))
  }

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null

  // Combina los posts creados localmente para selectedUserId delante de los posts de la API
  const localPosts =
    selectedUserId !== null ? createdPostsByUser[selectedUserId] ?? [] : []
  const displayedPosts = [...localPosts, ...apiPosts]

  return (
    <div className="app-layout-wrapper">
      <header className="app-header">
        <h1 className="app-title">Directorio de Usuarios y Publicaciones</h1>
        <p className="app-subtitle">
          Explora los usuarios, consulta sus publicaciones y crea nuevo contenido
        </p>
      </header>

      <main className="app-main">
        <div className="app-two-column-layout">
          <section
            className="app-column app-column-sidebar"
            aria-label="Sección de usuarios"
          >
            <UserList
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
              isLoading={isLoadingUsers}
              error={usersError}
              onRetry={handleRetryUsers}
            />
          </section>

          <section
            className="app-column app-column-detail"
            aria-label="Panel de detalle"
          >
            <div className="detail-panel">
              <PostList
                user={selectedUser}
                posts={displayedPosts}
                isLoading={isPostsLoading}
                error={postsError}
                onRetry={handleRetryPosts}
                onPostCreated={handlePostCreated}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
