# 📊 CRM Comercial — Dashboard de Seguimiento

Dashboard fullstack con **Nuxt 3**, **Firebase Firestore** y **TailwindCSS** para el seguimiento comercial de proyectos.

---

## 🚀 Stack

| Tecnología             | Versión | Uso                                      |
| ---------------------- | ------- | ---------------------------------------- |
| Nuxt 3                 | ^3.11   | Framework SSR/SSG                        |
| Vue 3                  | ^3.4    | Composición reactiva                     |
| Firebase               | ^10.9   | Base de datos en tiempo real (Firestore) |
| TailwindCSS            | ^3.x    | Estilos y responsive design              |
| Chart.js + vue-chartjs | ^4.4    | Gráficas interactivas                    |
| @vueuse/core           | ^10.9   | Composables utilitarios                  |

---

## ⚙️ Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Firebase
cp .env.example .env
# Edita .env con tus credenciales de Firebase

# 3. Ejecutar en desarrollo
npm run dev

# 4. Build para producción
npm run build
```

---

## 🔥 Configuración de Firebase

### 1. Crear proyecto en Firebase Console

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crear nuevo proyecto
3. Ir a **Firestore Database** → Crear base de datos (modo producción o prueba)

### 2. Obtener credenciales

-   Ve a **Configuración del proyecto** (ícono de engranaje)
-   Sección **"Tus aplicaciones"** → Agregar app web
-   Copia la configuración al archivo `.env`

### 3. Reglas de Firestore (desarrollo)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ Solo para desarrollo
    }
  }
}
```

> **Nota:** La primera vez que inicies la app, los 50 proyectos del CSV se cargarán automáticamente en Firestore. Si Firebase no está configurado, la app funciona con datos locales.

> **Producción:** antes de usar datos reales, configura Firebase Auth y reemplaza las reglas abiertas por reglas basadas en usuario, rol u organización.

---

## 📁 Estructura del Proyecto

```
comercial-dashboard/
├── assets/
│   └── css/main.css          # Estilos globales + Tailwind
├── components/
│   ├── Charts.vue             # Gráficas (donut, bar, line, horizontal bars)
│   ├── ProjectModal.vue       # Modal CRUD para proyectos
│   ├── StatCard.vue           # Tarjeta KPI con animación de contador
│   └── StatusBadge.vue        # Badge de estado con colores
├── composables/
│   └── useProjects.ts         # Lógica de negocio + Firebase + stats
├── pages/
│   └── index.vue              # Landing principal con todo el dashboard
├── plugins/
│   └── firebase.client.ts     # Inicialización de Firebase
├── app.vue
├── nuxt.config.ts
├── tailwind.config.js
└── .env.example
```

---

## ✨ Funcionalidades

-   **Dashboard KPIs** — Total, activos, entregados, cerrados con contadores animados
-   **4 tipos de gráficas** — Donut (estados), barras (países), línea (mensual), horizontal (encargados)
-   **Tabla interactiva** — Ordenamiento por columna, responsive (cards en móvil, tabla en desktop)
-   **Filtros** — Por estado, país, encargado + búsqueda en tiempo real
-   **Paginación** — 10 registros por página
-   **CRUD completo** — Crear, editar, eliminar proyectos con validación
-   **Firebase Realtime** — `onSnapshot` para actualizaciones en tiempo real
-   **Fallback local** — Funciona sin Firebase con datos del CSV cargados en memoria
-   **Animaciones** — Scroll reveal, contadores, micro-interacciones, transiciones de modal
-   **Diseño oscuro premium** — Paleta obsidian + acid green, tipografía Syne + Space Mono

---

## 🎨 Paleta de Colores

| Nombre       | Hex       | Uso                    |
| ------------ | --------- | ---------------------- |
| Obsidian 950 | `#0a0a0d` | Fondo principal        |
| Obsidian 900 | `#15151a` | Cards                  |
| Acid 400     | `#005571` | Acento principal, CTAs |
| Blue 400     | `#74b9ff` | Estado Programado      |
| Emerald 400  | `#00b894` | Estado Instalado       |
| Purple 400   | `#a29bfe` | Estado Entregado       |
| Coral 400    | `#ff6b6b` | Acciones destructivas  |

---

## 🗃️ Estados del Pipeline

```
Prospecto → Cotizado → Aprobado → Programado → En instalación → Instalado → Entregado
                                                                           ↓
                                                                        Cerrado
```
