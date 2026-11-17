# Directorio de Usuarios y Publicaciones

Aplicación frontend desarrollada en **React + TypeScript + Vite** que consume la API pública de JSONPlaceholder para explorar usuarios, filtrar por nombre en tiempo real, consultar sus publicaciones y crear nuevas publicaciones con validación de formulario.

---

## Cómo ejecutar el proyecto

### Requisitos previos
* **Node.js** (v18 o superior recomendado)
* **npm** (v9 o superior)

### Instalación y arranque en local
1. Clona el repositorio y accede al directorio del proyecto:
   ```bash
   git clone https://github.com/cliftonjr/clifton-feed-front.git
   cd clifton-feed-front
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre la URL indicada en la terminal (por defecto `http://localhost:5173`).

### Scripts disponibles
* `npm run dev` — Inicia el servidor de desarrollo con HMR.
* `npm run build` — Verifica tipos con TypeScript (`tsc -b`) y genera el bundle de producción con Vite.
* `npm run lint` — Ejecuta ESLint sobre el proyecto.
* `npm run test` — Ejecuta Vitest en modo observación.
* `npm run test:run` — Ejecuta la suite completa de pruebas una sola vez (26 tests en 5 archivos).

---

## Arquitectura y estructura del proyecto

```text
src/
├── components/
│   ├── UserList.tsx          # Listado de usuarios con filtro por nombre y estados de carga/error/vacío
│   ├── UserList.test.tsx     # Pruebas unitarias de UserList
│   ├── PostList.tsx          # Vista de publicaciones por usuario e integración del formulario
│   ├── PostList.test.tsx     # Pruebas unitarias de PostList
│   ├── PostForm.tsx          # Formulario controlado con validación accesible y estado de envío
│   └── PostForm.test.tsx     # Pruebas unitarias de validación, envío y manejo de errores
├── services/
│   ├── api.ts                # Capa de comunicación HTTP desacoplada con validación de respuesta
│   └── api.test.ts           # Pruebas unitarias del cliente HTTP y manejo de errores
├── types/
│   └── index.ts              # Interfaces estrictas de dominio (User, Post) sin uso de `any`
├── App.tsx                   # Orquestación de estado, cancelación de peticiones y persistencia en sesión
├── App.test.tsx              # Pruebas de integración de flujos completos de usuario
├── App.css                   # Estilos responsivos con layout de dos columnas
└── setupTests.ts             # Configuración global de @testing-library/jest-dom
```

---

## Decisiones técnicas

1. **Separación de responsabilidades (SoC):**
   * Toda la lógica de comunicación con JSONPlaceholder (`getUsers`, `getPostsByUser`, `createPost`) está aislada en `src/services/api.ts`. Esto mantiene los componentes enfocados exclusivamente en renderizado e interacción, y permite mockear la capa de datos de forma limpia en los tests.
2. **Manejo defensivo de errores HTTP y cancelación de peticiones:**
   * `fetch` no rechaza promesas ante respuestas HTTP `4xx` o `5xx`; por ello cada función de servicio valida explícitamente `if (!response.ok)` antes de parsear el JSON.
   * Se utiliza `AbortController` en los `useEffect` de `App.tsx` para cancelar peticiones en vuelo si el componente se desmonta o si el usuario cambia rápidamente de perfil, evitando condiciones de carrera (*race conditions*).
3. **Reseteo limpio de formulario y persistencia en sesión:**
   * Se emplea `key={user.id}` en `<PostForm />` dentro de `PostList.tsx` para reiniciar automáticamente borradores y errores de validación al cambiar de usuario, sin necesidad de efectos imperativos.
   * Dado que JSONPlaceholder simula el `POST /posts` sin persistir datos en servidor, `App.tsx` mantiene un diccionario en memoria (`createdPostsByUser: Record<number, Post[]>`) y asigna un `id` único en cliente (`Date.now()`) para evitar colisiones de `key` en React (ya que la API siempre retorna `id: 101`).
4. **Accesibilidad (a11y) y Testing orientado al usuario:**
   * Uso de etiquetas `<label htmlFor="...">`, atributos `aria-invalid`, `aria-describedby`, `aria-pressed` y regiones vivas (`role="status"`, `role="alert"`).
   * Los tests unitarios y de integración con **Vitest + React Testing Library + user-event** consultan el DOM mediante roles y etiquetas accesibles (`getByRole`, `getByLabelText`) en lugar de detalles internos de implementación.
5. **Pragmatismo sin sobre-ingeniería:**
   * Se optó por estado local de React (`useState` + `useEffect`) y CSS modular limpio sin añadir librerías externas innecesarias (como Redux, React Query o frameworks UI pesados) para un alcance acotado de dos recursos.

---


## Qué haría con más tiempo

* **Librería de componentes UI:** Integrar una librería moderna como Material UI (MUI) o Tailwind CSS para lograr una interfaz más pulida, consistente y escalable, manteniendo un alto estándar de accesibilidad.
* **Ampliación de filtros de búsqueda:** Extender el buscador actual para filtrar también por `username`, `email` o ciudad.
* **Caché de datos y sincronización:** Implementar caché en memoria para las consultas `GET /posts?userId=...` ya visitadas para evitar peticiones redundantes al alternar entre usuarios.
* **Paginación o scroll virtual:** Incorporar paginación o virtualización si el volumen de usuarios o publicaciones creciera significativamente.

---

## Uso de Inteligencia Artificial

Durante el desarrollo se utilizaron asistentes de IA (un agente de codificación integrado en el editor para generación incremental de código/tests y un asistente conversacional para planificación arquitectónica, revisión de código y redacción de prompts).

### Qué se pidió (Prompts y consultas realizadas)
1. **Planificación y configuración inicial:** Diseño de una arquitectura limpia por capas y configuración de Vite + TypeScript + Vitest + JSDOM + Testing Library sin mezclar lógica de negocio en el primer paso.
2. **Implementación de usuarios y búsqueda:** Definición de interfaces estrictas (`User`, `Post`), creación del servicio `getUsers` con validación de errores HTTP y componente `UserList` accesible con filtro por nombre y estados de carga/error/vacío.
3. **Implementación de publicaciones y formulario validado:** Creación de `getPostsByUser` y `createPost`, componente `PostForm` con validación de espacios en blanco (`.trim()`), feedback accesible y listado `PostList` integrado en `App.tsx`.
4. **Auditoría y refinamiento de UX/estado:** Revisión crítica de la primera versión funcional de `App.tsx` y `PostForm.tsx` para corregir el arrastre de estado entre usuarios y la pérdida de posts creados al navegar entre perfiles.
5. **Documentación:** Revisión y estructuración de este `README.md` y del historial de decisiones.

### Qué se aceptó de la IA
* La estructura de carpetas (`types/`, `services/`, `components/`) y la separación limpia entre `PostForm` y `PostList`.
* La inyección opcional de `onSubmitPost` en `PostForm` para facilitar pruebas unitarias deterministas sobre estados asíncronos (`Publicando...` y deshabilitado del botón).
* El uso de `AbortController` en los efectos de carga de datos y la estructura semántica accesible (`role="alert"`, `role="status"`, `aria-describedby`, `aria-pressed`).
* La base de las pruebas unitarias y de integración con `userEvent` y `vi.fn()`.

### Qué se corrigió o ajustó manualmente

- **Bloqueo al instalar dependencias:** Durante la configuración inicial, el agente se quedó colgado más de 10 minutos ejecutando `npm install` en segundo plano. Tuve que cancelar el proceso manualmente, instalar las librerías de testing directamente desde mi terminal (`--no-audit --no-fund`) y continuar desde ahí.
- **Simplificación de la arquitectura:** Al pedirle sugerencias iniciales, la IA propuso añadir Redux/Zustand y varias rutas con `react-router`. Descarté esas opciones porque complicaban innecesariamente el proyecto para el alcance real de la prueba, optando por una vista directa de dos columnas con estado local bien estructurado.
- **Publicaciones desaparecían al cambiar de usuario (`App.tsx`):** Al probar la app manualmente, noté que si creaba un post para un usuario, pasaba a otro y volvía al primero, la publicación nueva se perdía porque todo se guardaba en un único estado plano. Cambié esa lógica a un mapa indexado por usuario (`createdPostsByUser: Record<number, Post[]>`) para conservar los posts creados durante toda la sesión.
- **Formulario arrastraba datos entre perfiles (`PostList.tsx`):** También detecté que, si dejaba texto a medias o un error de validación en el formulario y cambiaba de usuario, esos datos seguían ahí. Lo solucioné agregando `key={user.id}` en `<PostForm />` para reiniciar su estado al cambiar de perfil y añadí un test que cubre este caso.
- **IDs repetidos al crear más de un post:** Como JSONPlaceholder siempre responde con `id: 101` al simular un `POST`, al crear dos publicaciones seguidas React lanzaba advertencias de claves duplicadas. Aseguré que en el cliente se asigne un identificador único (`Date.now()`) antes de guardar el post en el estado.