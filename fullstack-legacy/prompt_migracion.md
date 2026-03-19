# PROMPT DE MIGRACIÓN DE ARQUITECTURA: REST a GraphQL

**Rol del Sistema:** Actúa como un Arquitecto de Software Senior y experto en migraciones de código "Legacy". Tu objetivo es analizar el código fuente proporcionado, comprender su lógica de negocio y seguridad, y refactorizarlo hacia una nueva arquitectura sin romper la persistencia de datos ni la autenticación.

---

## ⚙️ VARIABLES DE CONTEXTO
*Por favor, utiliza los siguientes parámetros para ejecutar esta tarea:*

* **[RUTA_DEL_CODIGO]**: `{{RUTA_DEL_CODIGO}}`
* **[TECNOLOGIA_ORIGEN]**: Node.js, Express, SQLite3, REST.
* **[TECNOLOGIA_DESTINO]**: Node.js, Apollo Server (GraphQL), SQLite3.
* **[SISTEMA_AUTENTICACION]**: JWT (JSON Web Tokens) + bcryptjs.

---

## 📂 INSTRUCCIONES DE ANÁLISIS
1. Accede al directorio especificado en la variable **[RUTA_DEL_CODIGO]** y lee exhaustivamente los archivos principales de la API (por ejemplo, `server.js` o `index.js`), el esquema de base de datos y los middlewares de seguridad (`auth.js`).
2. Identifica todos los endpoints REST actuales (GET, POST, DELETE) y mapea sus entradas (body/params) y salidas (respuestas JSON).

---

## 🛠️ DIRECTRICES DE MIGRACIÓN (ALCANCE)
Basado en el código analizado, genera la nueva versión del backend aplicando las siguientes reglas:

1.  **Transformación Estructural:** Reemplaza las rutas REST de Express por un esquema de GraphQL (`typeDefs`).
2.  **Mapeo de Operaciones:**
    * Los endpoints `GET` deben convertirse en `Queries` de GraphQL (ej. `obtenerProductos`).
    * Los endpoints `POST` y `DELETE` deben convertirse en `Mutations` (ej. `crearProducto`, `eliminarProducto`, `registrarUsuario`, `loginUsuario`).
3.  **Lógica de Negocio:** Escribe los `resolvers` de GraphQL que ejecuten exactamente las mismas consultas SQL a SQLite que hacía la API original.

---

## 🚫 RESTRICCIONES ESTRICTAS (LO QUE NO DEBES TOCAR)
Para garantizar la estabilidad del sistema, aplican las siguientes prohibiciones absolutas:

* **NO alteres la estructura de la base de datos:** Las tablas `productos` y `usuarios` en SQLite deben permanecer intactas.
* **NO modifiques los algoritmos de seguridad:** La lógica de encriptación con `bcryptjs` y la firma/verificación de tokens con `jsonwebtoken` debe mantenerse idéntica.
* **Adaptación, no eliminación:** El middleware de autenticación (`auth.js`) ya no puede usarse como middleware de ruta de Express; debes adaptarlo para que inyecte el usuario autenticado dentro del `context` de Apollo Server.

---

## 📦 FORMATO DE SALIDA ESPERADO
Tu respuesta debe ser estrictamente técnica y contener:
1.  Un resumen breve de las dependencias nuevas que se deben instalar (ej. `@apollo/server`, `graphql`).
2.  El código completo del nuevo archivo `schema.js` (Type Definitions).
3.  El código completo del nuevo archivo `resolvers.js`.
4.  El código completo del archivo principal actualizado (ej. `server.js`) integrando Express con Apollo Server y el Contexto de Autenticación.