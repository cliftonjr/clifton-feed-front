import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import * as api from './services/api'
import type { Post, User } from './types'

const mockUsers: User[] = [
  { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
  { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' },
]

const mockPosts: Post[] = [
  { id: 1, userId: 1, title: 'Post Existente 1', body: 'Cuerpo del post 1' },
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
    vi.spyOn(api, 'getPostsByUser').mockResolvedValue(mockPosts)
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

    expect(
      detailScope.getByRole('heading', { name: 'Leanne Graham', level: 2 })
    ).toBeInTheDocument()
    expect(detailScope.getByText(/@Bret/i)).toBeInTheDocument()
    expect(
      detailScope.getByRole('link', { name: 'Sincere@april.biz' })
    ).toBeInTheDocument()

    // Espera a que carguen las publicaciones
    await waitFor(() => {
      expect(detailScope.getByText('Post Existente 1')).toBeInTheDocument()
    })
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

  it('crea una nueva publicación y la agrega al principio de la lista', async () => {
    vi.spyOn(api, 'getUsers').mockResolvedValue(mockUsers)
    vi.spyOn(api, 'getPostsByUser').mockResolvedValue(mockPosts)
    const createPostSpy = vi.spyOn(api, 'createPost').mockResolvedValue({
      id: 101, // JSONPlaceholder standard id
      userId: 1,
      title: 'Post Creado Recientemente',
      body: 'Contenido recién publicado',
    })

    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /leanne graham/i }))

    await waitFor(() => {
      expect(screen.getByText('Post Existente 1')).toBeInTheDocument()
    })

    // Rellenar y enviar el formulario de nueva publicación
    const titleInput = screen.getByLabelText(/^título$/i)
    const bodyInput = screen.getByLabelText(/texto \/ contenido/i)
    const submitBtn = screen.getByRole('button', { name: /publicar/i })

    await user.type(titleInput, 'Post Creado Recientemente')
    await user.type(bodyInput, 'Contenido recién publicado')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(createPostSpy).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Post Creado Recientemente')).toBeInTheDocument()
      expect(screen.getByText('Contenido recién publicado')).toBeInTheDocument()
    })

    // Verificar que aparece antes del post existente
    const postTitles = screen.getAllByRole('heading', { level: 4 })
    expect(postTitles[0]).toHaveTextContent('Post Creado Recientemente')
    expect(postTitles[1]).toHaveTextContent('Post Existente 1')
  })

  it('limpia el contenido del formulario al cambiar de usuario y conserva en sesión las publicaciones creadas previamente', async () => {
    vi.spyOn(api, 'getUsers').mockResolvedValue(mockUsers)
    vi.spyOn(api, 'getPostsByUser').mockImplementation(async (userId) => {
      if (userId === 1) {
        return [{ id: 10, userId: 1, title: 'Post API Usuario 1', body: 'Cuerpo 1' }]
      }
      return [{ id: 20, userId: 2, title: 'Post API Usuario 2', body: 'Cuerpo 2' }]
    })

    vi.spyOn(api, 'createPost').mockResolvedValue({
      id: 101,
      userId: 1,
      title: 'Post Local de Usuario 1',
      body: 'Cuerpo creado en sesión',
    })

    const user = userEvent.setup()
    render(<App />)

    // 1. Espera a que carguen los usuarios y selecciona Usuario 1
    await waitFor(() => {
      expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /leanne graham/i }))

    await waitFor(() => {
      expect(screen.getByText('Post API Usuario 1')).toBeInTheDocument()
    })

    // 2. Escribe y publica un post para Usuario 1
    const titleInput = screen.getByLabelText(/^título$/i)
    const bodyInput = screen.getByLabelText(/texto \/ contenido/i)
    const submitBtn = screen.getByRole('button', { name: /publicar/i })

    await user.type(titleInput, 'Post Local de Usuario 1')
    await user.type(bodyInput, 'Cuerpo creado en sesión')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Post Local de Usuario 1')).toBeInTheDocument()
    })

    // 3. Escribe un borrador sin enviar en el formulario del Usuario 1
    await user.type(titleInput, 'Borrador sin publicar')
    expect(titleInput).toHaveValue('Borrador sin publicar')

    // 4. Cambia a Usuario 2 (Ervin Howell)
    await user.click(screen.getByRole('button', { name: /ervin howell/i }))

    await waitFor(() => {
      expect(screen.getByText('Post API Usuario 2')).toBeInTheDocument()
    })

    // Verifica que el formulario se reinició (key={user.id} limpia el borrador)
    const titleInputUser2 = screen.getByLabelText(/^título$/i)
    expect(titleInputUser2).toHaveValue('')

    // Verifica que los posts de Usuario 1 no están visibles mientras Usuario 2 está activo
    expect(screen.queryByText('Post Local de Usuario 1')).not.toBeInTheDocument()

    // 5. Vuelve a Usuario 1 (Leanne Graham)
    await user.click(screen.getByRole('button', { name: /leanne graham/i }))

    // Espera a que recargue Usuario 1
    await waitFor(() => {
      expect(screen.getByText('Post API Usuario 1')).toBeInTheDocument()
    })

    // Verifica que la publicación creada en memoria para Usuario 1 sigue visible
    expect(screen.getByText('Post Local de Usuario 1')).toBeInTheDocument()

    // Verifica que el formulario de Usuario 1 está limpio al seleccionarlo nuevamente
    expect(screen.getByLabelText(/^título$/i)).toHaveValue('')
  })
})
