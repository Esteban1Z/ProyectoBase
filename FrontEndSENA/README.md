# Papelsoft

Sistema de inventario y ventas para papelerías. El frontend React/Vite se publica en Vercel; la API Spring Boot y MySQL se alojan aparte (por ejemplo, en Railway).

## Desarrollo local

1. Crear la base `papeleria_db` ejecutando `BD/4_21_2026.sql`. Para una base existente, ejecutar también `BD/migrations/2026_11_add_gestor_role.sql`.
2. Configurar en el entorno del backend `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` y un `JWT_SECRET` aleatorio de al menos 32 caracteres.
3. Para generar el usuario inicial, definir `SEED_TEST_USER_ENABLED=true`, `SEED_TEST_USER_EMAIL=pruebas@papelsoft.com` y una contraseña fuerte en `SEED_TEST_USER_PASSWORD`. La API crea el usuario una sola vez; la contraseña se almacena con BCrypt.
4. Iniciar Spring Boot desde `backend` con `mvn spring-boot:run`.
5. Copiar `.env.example` a `.env` en `FrontEndSENA` y ejecutar allí `npm ci` y `npm run dev`. La demo está desactivada; solo actívala explícitamente con `VITE_ENABLE_DEMO=true` para desarrollo sin base de datos.

La API local usa `http://localhost:8080/api`. `GET /api/health` comprueba la conexión real con MySQL.

## Despliegue

### 1. API y base de datos en Railway

1. Crear un proyecto Railway y añadir un servicio MySQL.
2. Crear otro servicio desde este repositorio con **Root Directory** `/backend`; Railway lo construye con `backend/Dockerfile`.
3. Configurar las variables privadas del servicio API:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`: referencias a los valores `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` del servicio MySQL.
   - `DB_USE_SSL=false` para la conexión privada Railway-a-Railway.
   - `JWT_SECRET`: secreto aleatorio de al menos 32 caracteres; no reutilizar el valor local.
   - `CORS_ALLOWED_ORIGINS`: dominio Vercel publicado y, opcionalmente, `https://*.vercel.app` para previews.
   - `SEED_TEST_USER_ENABLED=true`, `SEED_TEST_USER_EMAIL=pruebas@papelsoft.com` y `SEED_TEST_USER_PASSWORD`: define la contraseña en el panel privado de Railway.
   - `DDL_AUTO=update` para que Hibernate cree/actualice las tablas al iniciar.
4. Railway expone la API en un dominio HTTPS. Verificar `https://<dominio-api>/api/health`; debe responder `{"status":"UP","database":"UP"}`.

### 2. Frontend en Vercel

1. Importar el repositorio en Vercel. Puedes dejar el **Root Directory** en `./`: el `vercel.json` de la raíz instala y compila el frontend dentro de `FrontEndSENA`. Si eliges `FrontEndSENA` como **Root Directory**, Vercel usará el `vercel.json` de esa carpeta.
2. Configurar `VITE_API_URL=https://<dominio-api>/api` y `VITE_ENABLE_DEMO=false` en las variables del proyecto.
3. Desplegar. Ambos `vercel.json` establecen el build Vite, la carpeta de salida y el fallback para rutas SPA.

El navegador usa JWT con expiración configurable (`JWT_LIFETIME_SECONDS`, 8 horas por defecto). Las rutas de datos requieren autenticación; las contraseñas nuevas usan BCrypt y las contraseñas antiguas en texto plano se convierten al iniciar sesión. La lista de usuarios no devuelve contraseñas.

No subir archivos `.env` ni secretos a Git o a Vercel como variables `VITE_*`; esas variables son públicas en el navegador.
