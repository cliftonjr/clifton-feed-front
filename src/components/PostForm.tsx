import { useState } from 'react'
import type { Post } from '../types'
import { createPost } from '../services/api'

export interface PostFormProps {
  userId: number
  onPostCreated: (newPost: Post) => void
  onSubmitPost?: (payload: Omit<Post, 'id'>) => Promise<Post>
}

interface FormErrors {
  title?: string
  body?: string
}

export function PostForm({
  userId,
  onPostCreated,
  onSubmitPost,
}: PostFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}

    if (!title.trim()) {
      nextErrors.title = 'El título es obligatorio.'
    }

    if (!body.trim()) {
      nextErrors.body = 'El texto / contenido es obligatorio.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitAction = onSubmitPost ?? createPost
      const newPost = await submitAction({
        userId,
        title: title.trim(),
        body: body.trim(),
      })

      onPostCreated(newPost)
      setTitle('')
      setBody('')
      setErrors({})
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al intentar crear la publicación.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="post-form"
      aria-label="Formulario para crear publicación"
    >
      <h3 className="post-form-title">Nueva publicación</h3>

      {submitError && (
        <div role="alert" className="form-submit-error">
          {submitError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="post-title" className="form-label">
          Título
        </label>
        <input
          id="post-title"
          name="title"
          type="text"
          className={`form-input ${errors.title ? 'is-invalid' : ''}`}
          placeholder="Título de la publicación"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: undefined }))
            }
          }}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'post-title-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.title && (
          <span id="post-title-error" role="alert" className="field-error">
            {errors.title}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="post-body" className="form-label">
          Texto / Contenido
        </label>
        <textarea
          id="post-body"
          name="body"
          rows={3}
          className={`form-textarea ${errors.body ? 'is-invalid' : ''}`}
          placeholder="Escribe el contenido aquí..."
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            if (errors.body) {
              setErrors((prev) => ({ ...prev, body: undefined }))
            }
          }}
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? 'post-body-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.body && (
          <span id="post-body-error" role="alert" className="field-error">
            {errors.body}
          </span>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </form>
  )
}
