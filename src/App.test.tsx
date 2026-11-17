import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import * as api from './services/api'
import type { User } from './types'

const mockUsers: User[] = [
  { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
  { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' },
]

describe('App component (Integration)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('carga y renderiza la lista de usuarios correctamente', async () => {
    vi.spyOn(api, 'getUsers').mockResolvedValue(mockUsers)

    render(<App />)

    // Inicialmente muestra estado de carga
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Espera a que se carguen los usuarios
    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
      expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
    })
  })

  it('permite seleccionar un usuario y muestra el detalle preliminar en la columna derecha', async () => {
    vi.spyOn(api, 'getUsers').mockResolvedValue(mockUsers)
    const user = userEvent.setup()

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })

    // Inicialmente no hay usuario seleccionado
    expect(screen.getByText(/ningún usuario seleccionado/i)).toBeInTheDocument()

    // Selecciona el primer usuario
    const userButton = screen.getByRole('button', { name: /leanne graham/i })
    await user.click(userButton)

    // Se actualiza el panel de detalle
    const detailSection = screen.getByLabelText('Panel de detalle')
    const detailScope = within(detailSection)

    expect(detailScope.getByRole('heading', { name: 'Leanne Graham', level: 2 })).toBeInTheDocument()
    expect(detailScope.getByText(/@Bret/i)).toBeInTheDocument()
    expect(detailScope.getByRole('link', { name: 'Sincere@april.biz' })).toBeInTheDocument()
  })

  it('gestiona errores de red y permite reintentar', async () => {
    const getUsersSpy = vi
      .spyOn(api, 'getUsers')
      .mockRejectedValueOnce(new Error('Error 500: Server error'))
      .mockResolvedValueOnce(mockUsers)

    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Error 500: Server error')).toBeInTheDocument()
    })

    // Clic en reintentar
    const retryBtn = screen.getByRole('button', { name: /reintentar/i })
    await user.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })

    expect(getUsersSpy).toHaveBeenCalledTimes(2)
  })
})
