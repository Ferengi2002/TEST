const jwt = require('jsonwebtoken');

// IMPORTANTE: En producción esta clave debe venir de una variable de entorno (.env)
const SECRET_KEY = "super_secreta_clave_para_el_proyecto_legacy";

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    // Verificamos si existe el header Authorization
    if (!authHeader) {
        return res.status(403).json({ error: "Token requerido. ¡Inicia sesión primero!" });
    }

    // El header viene con formato: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: "Token mal formateado." });
    }

    try {
        // Verificamos y decodificamos el token
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Guardamos los datos del usuario en la request
        next(); // Continuamos a la ruta original
    } catch (err) {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
}

module.exports = { verifyToken, SECRET_KEY };
