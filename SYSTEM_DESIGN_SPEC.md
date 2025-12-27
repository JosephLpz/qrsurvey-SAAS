# QRSurvey - Especificación de Diseño Completa

Este documento contiene la definición completa del sistema de diseño y la estructura de la landing page de QRSurvey, diseñado para ser utilizado como referencia maestra en plataformas de diseño y optimización UI/UX.

---

## 1. Identidad de Marca y Tokens (Brand Identity)

### Colores (Base: OKLCH / HEX)
- **Primario (Marca)**: `#FF7A00` (Naranja Vibrante) - `oklch(0.7 0.15 45)`
- **Acento**: `#FFB74D` (Naranja Suave) - `oklch(0.8 0.1 50)`
- **Fondo**: `#FFFFFF` (Claro) / `#1A1A1A` (Oscuro)
- **Superficie (Card)**: Blanco con sombras sutiles y bordes redondeados (`radius: 0.5rem`).

### Colores de Gráficos (Premium Palette)
- **Principal (Tendencias)**: `#3B82F6` (Azul Indigo)
- **Positivo (Satisfacción)**: `#10B981` (Esmeralda)
- **Neutro**: `#F59E0B` (Ámbar)
- **Alerta/Bajo**: `#F43F5E` (Rosa/Rojo suave)

### Tipografía
- **Headings (Títulos)**: Tipografía Sans-Serif moderna (Inter/Geist), peso Bold (700) o Black (900).
- **Body (Cuerpo)**: Sans-Serif, peso Regular (400), buena legibilidad.

---

## 2. Estructura de la Landing Page

La landing page sigue un flujo de conversión clásico centrado en la facilidad de uso.

### Secciones Principales:
1.  **Header**: Navbar transparente/blanco, logo a la izquierda, botones de "Login" y "Empezar Gratis" (Primario).
2.  **Hero Section**:
    *   *Título*: "Crea encuestas, imprime el QR y mide todo en un solo lugar"
    *   *Subtítulo*: "Genera encuestas en minutos, imprime tu póster con QR y sigue resultados en tiempo real."
    *   *CTA*: Botones "Probar gratis" (Lleno) y "Ver demo" (Contorno).
    *   *Visual*: Mockup de póster con QR + Dashboard de analíticas simplificado.
3.  **Cómo Funciona (Step-by-Step)**:
    - 1. Crea tu encuesta personalizada.
    - 2. Genera y descarga tu código QR.
    - 3. Escucha a tus clientes en el local.
    - 4. Analiza datos en tiempo real.
4.  **Características (Features Grid)**:
    - Editor de encuestas (NPS, Likert, Texto).
    - Generador de pósters personalizados.
    - Dashboard interactivo.
    - Gestión multi-sede.
5.  **Pricing (Planes)**:
    - **Gratis**: 1 Sede, 50 respuestas.
    - **Pro**: Sedes ilimitadas, AI Insights, Exportación CSV.
    - **Enterprise**: Custom branding y soporte prioritario.

---

## 3. Especificación del Sistema (Dashboard & UI)

### Componentes Core:
*   **Sidebar (Navegación)**:
    - Fondo blanco, borde derecho sutil.
    - Items con iconos (Lucide-React) y estados activos en naranja primario (`#FF7A00`).
*   **Top Bar**:
    - Selector de Sede (Dropdown).
    - Perfil de usuario con Avatar y menú de Ajustes/Cerrar sesión.
*   **Tarjetas de KPI**: Estilo minimalista, valor en grande (Primary), icono arriba a la derecha.
*   **Sistema de Gráficos**:
    - **Area Charts**: Gradiente suave bajo la línea, bordes redondeados.
    - **Bar Charts**: Sin bordes en los ejes, colores vibrantes locales para evitar renders en negro.

### UX Patterns:
- **Empty States**: Ilustraciones minimalistas o mensajes en cursiva.
- **Carga (Loading)**: Spinners temáticos en color primario.
- **Feedback**: Toasts (Sonner) para confirmación de acciones.

---

## 4. Prompt Maestro para Generación / Mejora
> "Rediseña una plataforma SaaS de encuestas físicas (QRSurvey) que utiliza códigos QR. La marca es naranja vibrante (#FF7A00). El diseño debe ser 'Glassmorphic/Clean', con bordes redondeados de 12px, sombras suaves y una paleta de analíticas en Azul Indigo y Esmeralda. Incluye una landing page con Hero, Features y Pricing, y un dashboard administrativo con sidebar lateral blanco e items de navegación con iconos minimalistas."
