import type { Post, User } from '../types'
import { PostForm } from './PostForm'

export interface PostListProps {
  user: User | null
  posts: Post[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onPostCreated: (newPost: Post) => void
}

export function PostList({
  user,
  posts,
  isLoading,
  error,
  onRetry,
  onPostCreated,
}: PostListProps) {
  if (!user) {
    return (
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
    )
  }

  return (
    <div className="post-list-wrapper">
      <article className="user-detail-card">
        <header className="detail-header">
          <div className="detail-avatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="detail-name">{user.name}</h2>
            <p className="detail-handle">@{user.username}</p>
          </div>
        </header>
        <div className="detail-body">
          <p className="detail-email">
            <span className="detail-label">Email:</span>{' '}
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </p>
        </div>
      </article>

      <div className="post-form-section">
        <PostForm key={user.id} userId={user.id} onPostCreated={onPostCreated} />
      </div>

      <section className="posts-display-section" aria-label="Publicaciones del usuario">
        <h3 className="posts-section-title">
          Publicaciones {posts.length > 0 && !isLoading ? `(${posts.length})` : ''}
        </h3>

        {isLoading && (
          <div role="status" aria-live="polite" className="feedback-state feedback-loading">
            <span className="spinner" aria-hidden="true" />
            <p>Cargando publicaciones...</p>
          </div>
        )}

        {!isLoading && error && (
          <div role="alert" className="feedback-state feedback-error">
            <p className="error-message">{error}</p>
            <button type="button" className="retry-button" onClick={onRetry}>
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div role="status" className="feedback-state feedback-empty">
            <p>Este usuario aún no tiene publicaciones registradas.</p>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <ul className="posts-list" role="list">
            {posts.map((post) => (
              <li key={post.id} className="post-item">
                <article className="post-card">
                  <h4 className="post-title">{post.title}</h4>
                  <p className="post-body">{post.body}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
