# 📊 Compipro Ads - TikTok Analytics Dashboard

<p align="center">
  <img src="https://via.placeholder.com/1200x400/4338ca/ffffff?text=COMPIPRO+ADS+DASHBOARD" alt="Project Banner">
</p>

<p align="center">
  <strong>Dashboard Full-Stack para visualizar, analizar y comparar el rendimiento de campañas publicitarias de TikTok Ads</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Styles-Tailwind%20CSS-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Backend-Python%20Flask-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Database-Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
</p>

---

## 🎯 Sobre el Proyecto

**Compipro Ads** es una solución completa para transformar reportes de Excel de TikTok Ads en insights visuales y estratégicos. Diseñado para agencias y marketers que necesitan analizar el rendimiento de múltiples campañas publicitarias de forma rápida y eficiente.

### ✨ ¿Qué hace especial a este proyecto?

- **Convierte datos complejos en decisiones claras** mediante visualizaciones interactivas
- **Compara campañas en tiempo real** con el modo Battle para identificar los mejores performers
- **Organiza múltiples campañas** por carpetas para mantener todo estructurado
- **Desplegado en la nube** y listo para usar en producción

---

## 🚀 Características Principales

### 📂 Gestión por Campañas
Organiza tus reportes agrupándolos por nombre de campaña (ej: "Navidad", "Verano", "Black Friday"). Sube múltiples archivos Excel/CSV y mantén todo estructurado.

### 🥊 Modo Comparador (Battle Mode)
Interfaz interactiva para enfrentar diferentes grupos de anuncios o campañas:
- Comparación lado a lado de métricas clave (CPA, Gasto, Conversiones)
- Visualización instantánea del mejor performer
- Análisis de eficiencia por anuncio

### 📈 Visualizaciones Avanzadas
- **Gráficos de evolución temporal:** Seguimiento del rendimiento día a día
- **Análisis demográfico:** Distribución por grupos de edad
- **Métricas consolidadas:** KPIs principales al alcance de un vistazo
- Powered by Recharts para gráficos fluidos y responsivos

### 🔐 Seguridad
- Sistema de autenticación con contraseña
- Variables de entorno para proteger credenciales
- Configuración segura con Supabase Row Level Security

### 📱 100% Responsivo
Diseño adaptado para trabajar desde cualquier dispositivo: desktop, tablet o móvil.

---

## 🛠️ Stack Tecnológico

<table>
  <tr>
    <td align="center" width="33%">
      <h3>🎨 Frontend</h3>
      <p>React.js con Vite</p>
      <p>Tailwind CSS</p>
      <p>Recharts</p>
      <p>Axios</p>
      <p>Heroicons</p>
    </td>
    <td align="center" width="33%">
      <h3>⚙️ Backend</h3>
      <p>Python Flask</p>
      <p>Pandas</p>
      <p>Supabase-py</p>
      <p>CORS</p>
    </td>
    <td align="center" width="33%">
      <h3>💾 Base de Datos</h3>
      <p>Supabase</p>
      <p>PostgreSQL</p>
      <p>Row Level Security</p>
    </td>
  </tr>
</table>

---

## 📸 Capturas de Pantalla

<p align="center">
  <img src="https://via.placeholder.com/800x400/4338ca/ffffff?text=Dashboard+Principal" alt="Dashboard">
  <br>
  <em>Vista principal con métricas consolidadas y gráficos interactivos</em>
</p>

<p align="center">
  <img src="https://via.placeholder.com/800x400/ec4899/ffffff?text=Modo+Comparador" alt="Versus Mode">
  <br>
  <em>Modo Battle: Compara el rendimiento de diferentes campañas</em>
</p>

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (v16 o superior)
- Python 3.8+
- Cuenta en Supabase

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/compipro-ads-dashboard.git
cd compipro-ads-dashboard
```

### 2️⃣ Configurar Backend

```bash
cd api

# Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3️⃣ Configurar Frontend

```bash
# Desde la raíz del proyecto
npm install
```

### 4️⃣ Variables de Entorno

Crea un archivo `.env` en la carpeta `api/`:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_service_role_key_de_supabase
ADMIN_PASSWORD=tu_contraseña_secreta
```

### 5️⃣ Ejecutar

**Backend:**
```bash
python api/index.py
# Corre en http://localhost:5000
```

**Frontend:**
```bash
npm run dev
# Corre en http://localhost:5173
```

---

## 🌐 Despliegue en Vercel

Este proyecto está optimizado para Vercel:

1. Sube tu código a GitHub
2. Importa el proyecto en Vercel
3. Configura las variables de entorno (las mismas del archivo `.env`)
4. Deploy automático gracias al archivo `vercel.json`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 📁 Estructura del Proyecto

```
compipro-ads-dashboard/
├── api/                      # Backend Flask
│   ├── index.py             # Servidor principal
│   └── requirements.txt     # Dependencias Python
├── src/                     # Frontend React
│   ├── components/          # Componentes reutilizables
│   ├── App.jsx             # Componente principal
│   └── main.jsx            # Entry point
├── public/                  # Archivos estáticos
├── vercel.json             # Configuración de despliegue
└── package.json            # Dependencias Node.js
```

---

## 🎯 Casos de Uso

- **Agencias de Marketing Digital:** Gestiona múltiples cuentas de clientes
- **E-commerce:** Compara el rendimiento de campañas estacionales
- **Startups:** Optimiza el presupuesto publicitario con datos visuales
- **Freelancers:** Presenta reportes profesionales a tus clientes

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si tienes ideas para mejorar el proyecto:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Añade nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

---

## 👨‍💻 Autor

**Desarrollado por [Royser-S](https://github.com/Royser-S)**

<p align="center">
  <a href="https://github.com/Royser-S">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://linkedin.com/in/tu-perfil">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
</p>

<p align="center">
  <em>Hecho con mucha cafeína ☕</em>
</p>

---

<p align="center">
  ⭐ Si te gustó este proyecto, dale una estrella en GitHub
</p>
