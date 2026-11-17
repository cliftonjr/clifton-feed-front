import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { UserList } from './UserList'
import type { User } from '../types'

const mockUsers: User[] = [
  { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
  { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' },
  { id: 3, name: 'Clementine Bauch', username: 'Samantha', email: 'Nathan@yesenia.net' },
]

describe('UserList component', () => {
  it('renderiza el estado de carga con role="status" y texto descriptivo', () => {
    render(
      <UserList
        users={[]}
        selectedUserId={null}
        onSelectUser={vi.fn()}
        isLoading={true}
        error={null}
        onRetry={vi.fn()}
      />
    )

    const loadingElement = screen.getByRole('status')
    expect(loadingElement).toBeInTheDocument()
    expect(screen.getByText(/cargando usuarios/i)).toBeInTheDocument()
  })

  it('renderiza el estado de error con role="alert", mensaje y botón de reintento funcional', async () => {
    const handleRetry = vi.fn()
    const user = userEvent.setup()

    render(
      <UserList
        users={[]}
        selectedUserId={null}
        onSelectUser={vi.fn()}
        isLoading={false}
        error="Error 500: Fallo en el servidor"
        onRetry={handleRetry}
      />
    )

    const alertElement = screen.getByRole('alert')
    expect(alertElement).toBeInTheDocument()
    expect(screen.getByText('Error 500: Fallo en el servidor')).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: /reintentar/i })
    await user.click(retryButton)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('renderiza la lista de usuarios y permite seleccionar con aria-pressed', async () => {
    const handleSelectUser = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <UserList
        users={mockUsers}
        selectedUserId={null}
        onSelectUser={handleSelectUser}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()

    const firstUserButton = screen.getByRole('button', { name: /leanne graham/i })
    expect(firstUserButton).toHaveAttribute('aria-pressed', 'false')

    await user.click(firstUserButton)
    expect(handleSelectUser).toHaveBeenCalledWith(mockUsers[0])

    // Al estar seleccionado
    rerender(
      <UserList
        users={mockUsers}
        selectedUserId={1}
        onSelectUser={handleSelectUser}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /leanne graham/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('filtra usuarios en tiempo real ignorando mayúsculas/minúsculas y espacios extremos', async () => {
    const user = userEvent.setup()

    render(
      <UserList
        users={mockUsers}
        selectedUserId={null}
        onSelectUser={vi.fn()}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />
    )

    const searchInput = screen.getByLabelText(/buscar usuario por nombre/i)

    // Búsqueda con espacios extremos y mayúsculas
    await user.type(searchInput, '   ERVIN   ')

    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
    expect(screen.queryByText('Leanne Graham')).not.toBeInTheDocument()
    expect(screen.queryByText('Clementine Bauch')).not.toBeInTheDocument()
  })

  it('muestra estado vacío cuando ningún usuario coincide con el filtro de búsqueda', async () => {
    const user = userEvent.setup()

    render(
      <UserList
        users={mockUsers}
        selectedUserId={null}
        onSelectUser={vi.fn()}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />
    )

    const searchInput = screen.getByLabelText(/buscar usuario por nombre/i)
    await user.type(searchInput, 'NombreInexistente')

    expect(
      screen.getByText(/no se encontraron usuarios que coincidan con la búsqueda/i)
    ).toBeInTheDocument()
  })
})
