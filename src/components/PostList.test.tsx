import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PostList } from './PostList'
import type { Post, User } from '../types'

const mockUser: User = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
}

const mockPosts: Post[] = [
  { id: 1, userId: 1, title: 'Primer Post', body: 'Contenido del primer post' },
  { id: 2, userId: 1, title: 'Segundo Post', body: 'Contenido del segundo post' },
]

describe('PostList component', () => {
  it('muestra estado inicial invitando a seleccionar un usuario si user es null', () => {
    render(
      <PostList
        user={null}
        posts={[]}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
        onPostCreated={vi.fn()}
      />
    )

    expect(screen.getByText(/ningún usuario seleccionado/i)).toBeInTheDocument()
    expect(
      screen.getByText(/elige un usuario de la lista/i)
    ).toBeInTheDocument()
  })

  it('muestra la cabecera del usuario y el formulario de creación si hay un usuario seleccionado', () => {
    render(
      <PostList
        user={mockUser}
        posts={mockPosts}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
        onPostCreated={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Leanne Graham', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/@Bret/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sincere@april.biz' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: /crear publicación/i })).toBeInTheDocument()
  })

  it('muestra el estado de carga con role="status" y texto descriptivo', () => {
    render(
      <PostList
        user={mockUser}
        posts={[]}
        isLoading={true}
        error={null}
        onRetry={vi.fn()}
        onPostCreated={vi.fn()}
      />
    )

    const loadingStatus = screen.getByRole('status')
    expect(loadingStatus).toBeInTheDocument()
    expect(screen.getByText(/cargando publicaciones\.\.\./i)).toBeInTheDocument()
  })

  it('muestra el estado de error con role="alert" y botón para reintentar', async () => {
    const handleRetry = vi.fn()
    const user = userEvent.setup()

    render(
      <PostList
        user={mockUser}
        posts={[]}
        isLoading={false}
        error="Error 500: Fallo de servidor"
        onRetry={handleRetry}
        onPostCreated={vi.fn()}
      />
    )

    const alertElement = screen.getByRole('alert')
    expect(alertElement).toBeInTheDocument()
    expect(screen.getByText('Error 500: Fallo de servidor')).toBeInTheDocument()

    const retryBtn = screen.getByRole('button', { name: /reintentar/i })
    await user.click(retryBtn)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('muestra estado vacío si el usuario no tiene publicaciones', () => {
    render(
      <PostList
        user={mockUser}
        posts={[]}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
        onPostCreated={vi.fn()}
      />
    )

    expect(
      screen.getByText(/este usuario aún no tiene publicaciones registradas/i)
    ).toBeInTheDocument()
  })

  it('renderiza la lista de publicaciones con sus títulos y contenidos', () => {
    render(
      <PostList
        user={mockUser}
        posts={mockPosts}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
        onPostCreated={vi.fn()}
      />
    )

    expect(screen.getByText('Primer Post')).toBeInTheDocument()
    expect(screen.getByText('Contenido del primer post')).toBeInTheDocument()
    expect(screen.getByText('Segundo Post')).toBeInTheDocument()
    expect(screen.getByText('Contenido del segundo post')).toBeInTheDocument()
  })
})
