# Guía de Arquitectura y Migración (Firebase a Postgres)

Este documento describe la estructura actual de datos y cómo abordar una futura migración a una base de datos relacional (Postgres/Supabase) para optimizar costos y escalabilidad.

## Cuándo te empezará a cobrar Firebase (Plan Spark)

Firebase es gratuito hasta que superes estos límites **diarios**:
- **Lecturas en Firestore:** 50,000 al día.
- **Escrituras en Firestore:** 20,000 al día.
- **Almacenamiento:** 1 GB total.
- **Autenticación:** 50,000 usuarios activos mensuales.

> [!TIP]
> Si tu app tiene 100 usuarios y cada uno hace 10 acciones al día, estarás MUY lejos de pagar. Empezarás a pagar cuando tengas miles de usuarios activos diarios o si haces consultas muy ineficientes.

---

## Esquema Actual de Datos (Firestore)

Para migrar a SQL, estas colecciones se convertirán en tablas:

### 1. Colección `users` -> Tabla `users`
| Campo | Tipo | Nota |
|-------|------|------|
| `uid` | String (PK) | Mantener el ID de Firebase Auth si se sigue usando. |
| `name` | String | |
| `email` | String | |
| `role` | String | "user" o "admin". |
| `plan` | String | "free" o "pro". |
| `flowCustomerId` | String | ID de orden de Flow. |
| `subscriptionStatus` | String | "active", "canceled", etc. |
| `createdAt` | Timestamp | |

### 2. Colección `surveys` -> Tabla `surveys`
| Campo | Tipo | Nota |
|-------|------|------|
| `id` | String (PK) | |
| `ownerId` | String (FK) | Relación con `users.uid`. |
| `title` | String | |
| `responses` | Number | Contador (en SQL se puede calcular con `COUNT`). |
| `createdAt` | Timestamp | |

### 3. Colección `responses` (o subcolección) -> Tabla `responses`
| Campo | Tipo | Nota |
|-------|------|------|
| `id` | String (PK) | |
| `surveyId` | String (FK) | Relación con `surveys.id`. |
| `data` | JSONB | Las respuestas a las preguntas. |
| `createdAt` | Timestamp | |

---

## Pasos para la Migración

### 1. Preparar la Base de Datos
- Crear un proyecto en **Supabase** o una instancia de **Postgres**.
- Definir el esquema usando un ORM como **Prisma** o **Drizzle**.

### 2. Implementar Capa de Adaptación
- En `lib/services/`, crea versiones de los archivos (ej. `users.pg.ts`) que usen SQL.
- El frontend no debería notar el cambio porque llamará a las mismas funciones (`getUserProfile`, `updateUserPlan`).

### 3. Script de Migración
```typescript
// Ejemplo de lógica de migración
const migrate = async () => {
  const firebaseUsers = await getAllFirebaseUsers();
  for (const user of firebaseUsers) {
    await prisma.user.create({ data: user });
  }
}
```

### 4. Actualizar Variables de Env
- Reemplazar las llaves de Firebase por `DATABASE_URL`.

---

## Recomendaciones de Desarrollo
Para facilitar este cambio en el futuro:
1. **Evita consultas complejas directamente en los componentes**: Mantén toda la lógica de datos dentro de `lib/services/`.
2. **Usa Typscript**: Ya lo estamos haciendo. Las interfaces en `lib/services/users.ts` definen el "contrato" que Postgres deberá cumplir.
