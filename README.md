# Planillas Belgrano

Sistema de gestión de planillas diarias, gastos, stock de productos, bicarbonatos y registros de cernida/seleccionada/machucada, con dos niveles de usuario (Administrador y Operador).

Construido con **Next.js 14** + **TypeScript** + **Tailwind CSS**.

## Funcionalidades

- 🔐 Login con dos roles: Administrador y Operador
- 📋 Carga de planilla diaria (totales del día + cernida/seleccionada)
- 💰 ABM completo de gastos (alta para todos, baja solo admin)
- 👥 ABM completo de usuarios (solo admin)
- 📦 Stock de productos con buscador
- 🍃 Bicarbonatos / sabores
- ⚖️ Cernida, Seleccionada y Machucada por precio
- 📊 Reportes con totales
- 📤 Exportación a CSV
- 💾 Persistencia local en navegador (localStorage)

## Usuarios de prueba

- `admin` / `admin` — Administrador (acceso total)
- `operador` / `operador` — Operador (sin borrar ni gestionar usuarios)

---

## 🚀 Deploy en Vercel desde GitHub

### Paso 1 — Crear el repositorio en GitHub

1. Andá a https://github.com/new
2. Nombre del repo: `planillas-belgrano` (o el que prefieras)
3. Dejalo como **público** o **privado**, da igual
4. **No** tildes "Add README" (ya tenemos uno)
5. Clic en **Create repository**

### Paso 2 — Subir el código

Abrí una terminal en la carpeta del proyecto y ejecutá:

```bash
git init
git add .
git commit -m "Primer commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/planillas-belgrano.git
git push -u origin main
```

> Reemplazá `TU_USUARIO` por tu usuario de GitHub. Si te pide login, usá tu usuario y un **Personal Access Token** (no la contraseña). Se genera en https://github.com/settings/tokens

### Paso 3 — Deploy en Vercel

1. Andá a https://vercel.com/signup e iniciá sesión con tu cuenta de GitHub
2. En el dashboard, clic en **Add New... → Project**
3. Vercel listará tus repos. Elegí `planillas-belgrano` y clic en **Import**
4. Vercel detecta Next.js automáticamente. Dejá todo por defecto y clic en **Deploy**
5. En ~1 minuto tendrás la URL pública: `https://planillas-belgrano-xxx.vercel.app`

### Paso 4 — Actualizar la app

Cada vez que cambies algo y hagas `git push`, Vercel redeploya solo. Para actualizar:

```bash
git add .
git commit -m "Lo que cambié"
git push
```

---

## 💻 Desarrollo local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

## 📁 Estructura

```
src/
├── app/
│   ├── layout.tsx       # Layout raíz
│   ├── page.tsx         # Página principal (orquesta las vistas)
│   └── globals.css      # Estilos globales + Tailwind
├── components/
│   ├── Login.tsx        # Pantalla de login
│   ├── Menu.tsx         # Menú principal con cards
│   ├── TopBar.tsx       # Barra superior
│   ├── PlanillaForm.tsx # Carga de planilla diaria
│   ├── Gastos.tsx       # ABM de gastos
│   ├── Usuarios.tsx     # ABM de usuarios
│   ├── Productos.tsx    # ABM de productos
│   ├── Bicarbonatos.tsx # ABM de bicarbonatos
│   ├── CernidaSel.tsx   # Registros de cernida/sel/machucada
│   ├── Historial.tsx    # Lista de planillas
│   ├── Reportes.tsx     # Stats y export
│   └── ui.tsx           # Componentes UI reutilizables
├── lib/
│   ├── defaults.ts      # Datos por defecto + helpers
│   └── useAppData.ts    # Hook de estado + persistencia
└── types/
    └── index.ts         # Tipos TypeScript
```

## 🔜 Próximos pasos

- Conectar a una base de datos real (Vercel Postgres, Supabase)
- Autenticación con NextAuth.js
- Exportación directa a Excel con formato
- Empaquetado como app móvil (Capacitor / PWA)
- Multi-sucursal
