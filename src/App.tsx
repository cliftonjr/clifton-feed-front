import { useEffect, useState } from 'react'
import type { User } from './types'
import { getUsers } from './services/api'
import { UserList } from './components/UserList'
import './App.css'

export default function App() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState<number>(0)

  useEffect(() => {
    const controller = new AbortController()

    getUsers(controller.signal)
      .then((data) => {
        setUsers(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Ocurrió un error inesperado al cargar los usuarios'
        setError(message)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [retryKey])

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    setRetryKey((prev) => prev + 1)
  }

  const handleSelectUser = (user: User) => {
    setSelectedUserId(user.id)
  }

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null

  return (
    <div className="app-layout-wrapper">
      <header className="app-header">
        <h1 className="app-title">Directorio de Usuarios</h1>
        <p className="app-subtitle">
          Selecciona un usuario para explorar sus publicaciones
        </p>
      </header>

      <main className="app-main">
        <div className="app-two-column-layout">
          <section
            className="app-column app-column-sidebar"
            aria-label="Panel de usuarios"
          >
            <UserList
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
            />
          </section>

          <section
            className="app-column app-column-detail"
            aria-label="Panel de detalle"
          >
            <div className="detail-panel">
              {selectedUser ? (
                <article className="user-detail-card">
                  <header className="detail-header">
                    <div className="detail-avatar" aria-hidden="true">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="detail-name">{selectedUser.name}</h2>
                      <p className="detail-handle">@{selectedUser.username}</p>
                    </div>
                  </header>
                  <div className="detail-body">
                    <p className="detail-email">
                      <span className="detail-label">Email:</span>{' '}
                      <a href={`mailto:${selectedUser.email}`}>{selectedUser.email}</a>
                    </p>
                    <div className="posts-placeholder-notice">
                      <p>
                        El panel de publicaciones y creación de posts se integrará
                        en el siguiente paso.
                      </p>
                    </div>
                  </div>
                </article>
              ) : (
                <div className="detail-empty-placeholder">
                  <div className="placeholder-icon" aria-hidden="true">
                    👤
                  </div>
                  <h2>Ningún usuario seleccionado</h2>
                  <p>
                    Elige un usuario de la lista izquierda para ver su perfil y sus
                    publicaciones asociadas.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
