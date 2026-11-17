import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PostForm } from './PostForm'
import type { Post } from '../types'

describe('PostForm component', () => {
  it('renderiza los campos con labels asociados mediante htmlFor e id', () => {
    render(<PostForm userId={1} onPostCreated={vi.fn()} />)

    const titleInput = screen.getByLabelText(/^título$/i)
    const bodyInput = screen.getByLabelText(/texto \/ contenido/i)

    expect(titleInput).toBeInTheDocument()
    expect(titleInput).toHaveAttribute('id', 'post-title')

    expect(bodyInput).toBeInTheDocument()
    expect(bodyInput).toHaveAttribute('id', 'post-body')
  })

  it('valida que los campos no estén vacíos ni contengan solo espacios en blanco y muestra errores accesibles', async () => {
    const onPostCreated = vi.fn()
    const onSubmitPost = vi.fn()
    const user = userEvent.setup()

    render(
      <PostForm
        userId={1}
        onPostCreated={onPostCreated}
        onSubmitPost={onSubmitPost}
      />
    )

    const submitBtn = screen.getByRole('button', { name: /publicar/i })
    const titleInput = screen.getByLabelText(/^título$/i)
    const bodyInput = screen.getByLabelText(/texto \/ contenido/i)

    // Intenta enviar con solo espacios en blanco
    await user.type(titleInput, '    ')
    await user.type(bodyInput, '    ')
    await user.click(submitBtn)

    // Verifica que no se envió la acción
    expect(onSubmitPost).not.toHaveBeenCalled()
    expect(onPostCreated).not.toHaveBeenCalled()

    // Comprueba atributos de accesibilidad y mensajes con role="alert"
    expect(titleInput).toHaveAttribute('aria-invalid', 'true')
    expect(titleInput).toHaveAttribute('aria-describedby', 'post-title-error')

    expect(bodyInput).toHaveAttribute('aria-invalid', 'true')
    expect(bodyInput).toHaveAttribute('aria-describedby', 'post-body-error')

    const alerts = screen.getAllByRole('alert')
    expect(alerts.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/el título es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByText(/el texto \/ contenido es obligatorio/i)).toBeInTheDocument()
  })

  it('procesa el envío exitoso, deshabilita el botón mientras envía y limpia los campos al finalizar', async () => {
    const onPostCreated = vi.fn()
    let resolveSubmit: (post: Post) => void
    const submitPromise = new Promise<Post>((resolve) => {
      resolveSubmit = resolve
    })
    const onSubmitPost = vi.fn().mockImplementation(() => submitPromise)

    const user = userEvent.setup()

    render(
      <PostForm
        userId={1}
        onPostCreated={onPostCreated}
        onSubmitPost={onSubmitPost}
      />
    )

    const titleInput = screen.getByLabelText(/^título$/i)
    const bodyInput = screen.getByLabelText(/texto \/ contenido/i)
    const submitBtn = screen.getByRole('button', { name: /publicar/i })

    await user.type(titleInput, 'Mi Nuevo Post')
    await user.type(bodyInput, 'Este es el contenido de prueba')

    await user.click(submitBtn)

    // Estado isSubmitting activo
    expect(submitBtn).toBeDisabled()
    expect(submitBtn).toHaveTextContent(/publicando\.\.\./i)

    // Resuelve la petición
    resolveSubmit!({
      id: 101,
      userId: 1,
      title: 'Mi Nuevo Post',
      body: 'Este es el contenido de prueba',
    })

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled()
      expect(submitBtn).toHaveTextContent(/publicar/i)
    })

    expect(onPostCreated).toHaveBeenCalledWith({
      id: 101,
      userId: 1,
      title: 'Mi Nuevo Post',
      body: 'Este es el contenido de prueba',
    })

    // Campos reseteados
    expect(titleInput).toHaveValue('')
    expect(bodyInput).toHaveValue('')
  })

  it('muestra mensaje de error si falla la creación del post', async () => {
    const onSubmitPost = vi
      .fn()
      .mockRejectedValue(new Error('Error de conexión con el servidor'))
    const user = userEvent.setup()

    render(
      <PostForm
        userId={1}
        onPostCreated={vi.fn()}
        onSubmitPost={onSubmitPost}
      />
    )

    await user.type(screen.getByLabelText(/^título$/i), 'Título')
    await user.type(screen.getByLabelText(/texto \/ contenido/i), 'Contenido')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Error de conexión con el servidor')
      ).toBeInTheDocument()
    })
  })
})
