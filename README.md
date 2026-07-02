```md
# Frontend Ocupacional

Aplicación frontend del sistema de gestión de Salud Ocupacional, desarrollada con React, TypeScript y Vite. Esta interfaz permite administrar empresas, trabajadores, evaluaciones médicas, exámenes ocupacionales y demás procesos del sistema mediante una experiencia moderna, segura y responsive.

---

## Descripción

El proyecto implementa la capa de presentación del sistema de Salud Ocupacional, consumiendo una API REST para gestionar la información del negocio y brindar una experiencia intuitiva a los usuarios finales.

---

## Tecnologías

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router DOM
- Axios
- JWT Authentication

---

## Arquitectura del proyecto

```

src/
├── assets/
├── components/
├── hooks/
├── layouts/
├── lib/
├── pages/
├── routes/
├── services/
├── types/
├── utils/
└── main.tsx

````

Cada módulo se encuentra organizado siguiendo una arquitectura basada en componentes, promoviendo la reutilización del código, la escalabilidad y el mantenimiento del proyecto.

---

## Requisitos

Antes de ejecutar el proyecto asegúrese de contar con:

- Node.js 20 o superior
- npm
- Git

Verificar instalación:

```bash
node -v
npm -v
````

---

## Instalación

Clonar el repositorio

```bash
git clone https://github.com/Edward23-ux/frontend-ocupacional.git
```

Ingresar al directorio

```bash
cd frontend-ocupacional
```

Instalar dependencias

```bash
npm install
```

---

## Configuración

Crear un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
VITE_API_URL=http://localhost:3000/api
```

Configure la URL correspondiente al entorno donde se encuentre desplegado el backend.

---

## Ejecución

Modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:5173
```

Compilar para producción

```bash
npm run build
```

Vista previa del build

```bash
npm run preview
```

---

## Scripts disponibles

| Comando         | Descripción                              |
| --------------- | ---------------------------------------- |
| npm run dev     | Ejecuta la aplicación en modo desarrollo |
| npm run build   | Genera la versión de producción          |
| npm run preview | Ejecuta una vista previa del build       |
| npm run lint    | Analiza el código con ESLint             |

---

## Funcionalidades

* Autenticación de usuarios.
* Gestión de empresas.
* Administración de trabajadores.
* Registro y consulta de evaluaciones ocupacionales.
* Gestión de exámenes médicos.
* Consumo de servicios REST.
* Validación de formularios.
* Manejo de sesiones mediante JWT.
* Diseño responsive.

---

## Integración con Backend

Este proyecto consume los servicios expuestos por el repositorio Backend Ocupacional.

```
https://github.com/Edward23-ux/backend-ocupacional
```

---

## Buenas prácticas implementadas

* Arquitectura modular.
* Separación entre componentes, páginas y servicios.
* Tipado estricto mediante TypeScript.
* Componentes reutilizables.
* Consumo centralizado de la API.
* Código mantenible y escalable.
* Gestión de rutas protegidas.
* Variables de entorno para la configuración.

---

## Equipo de desarrollo

Proyecto desarrollado como parte del curso de Ingeniería de Software.

**Autores**

* Edward Campos Heredia
* Equipo de desarrollo

---

## Licencia

Este proyecto fue desarrollado con fines académicos y educativos.

```
```
