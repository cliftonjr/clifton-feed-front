import { useMemo, useState } from 'react'
import type { User } from '../types'

export interface UserListProps {
  users: User[]
  selectedUserId: number | null
  onSelectUser: (user: User) => void
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export function UserList({
  users,
  selectedUserId,
  onSelectUser,
  isLoading,
  error,
  onRetry,
}: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredUsers = useMemo(() => {
    if (!normalizedSearch) {
      return users
    }
    return users.filter((user) =>
      user.name.toLowerCase().includes(normalizedSearch)
    )
  }, [users, normalizedSearch])

  return (
    <div className="user-list-container">
      <div className="search-box">
        <label htmlFor="user-search" className="search-label">
          Buscar usuario por nombre
        </label>
        <div className="search-input-wrapper">
          <input
            id="user-search"
            type="search"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            aria-label="Buscar usuario por nombre"
            disabled={isLoading || Boolean(error)}
          />
        </div>
      </div>

      <div className="user-list-content">
        {isLoading && (
          <div role="status" aria-live="polite" className="feedback-state feedback-loading">
            <span className="spinner" aria-hidden="true" />
            <p>Cargando usuarios...</p>
          </div>
        )}

        {!isLoading && error && (
          <div role="alert" className="feedback-state feedback-error">
            <p className="error-message">{error}</p>
            <button
              type="button"
              className="retry-button"
              onClick={onRetry}
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && filteredUsers.length === 0 && (
          <div className="feedback-state feedback-empty" role="status">
            <p>
              {users.length === 0
                ? 'No hay usuarios disponibles.'
                : 'No se encontraron usuarios que coincidan con la búsqueda.'}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredUsers.length > 0 && (
          <ul className="user-list" role="list">
            {filteredUsers.map((user) => {
              const isSelected = selectedUserId === user.id
              return (
                <li key={user.id} className="user-list-item">
                  <button
                    type="button"
                    className={`user-card-button ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => onSelectUser(user)}
                    aria-pressed={isSelected}
                  >
                    <div className="user-avatar" aria-hidden="true">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <strong className="user-name">{user.name}</strong>
                      <span className="user-username">@{user.username}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
