const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const { verifyToken, SECRET_KEY } = require('./middleware/auth');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========================
// ENDPOINTS DE AUTENTICACIÓN (Públicos)
// ========================

// POST: Registrar usuario
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Usuario y contraseña requeridos" });
    }

    try {
        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        db.run(
            "INSERT INTO usuarios (username, password_hash) VALUES (?, ?)",
            [username, password_hash],
            function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE")) {
                        return res.status(400).json({ error: "El usuario ya existe. Intenta con otro." });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: "Usuario registrado con éxito" });
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor al registrar" });
    }
});

// POST: Login y generación de JWT
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Usuario y contraseña requeridos" });
    }

    db.get("SELECT * FROM usuarios WHERE username = ?", [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });

        // Comparar contraseña plana con el hash guardado
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });

        // Generar Token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: '2h' }
        );

        res.json({ message: "Login correcto", token, username: user.username });
    });
});

// ========================
// ENDPOINTS DE PRODUCTOS (Protegidos)
// ========================

app.get('/api/productos', verifyToken, (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/productos', verifyToken, (req, res) => {
    const { nombre, precio, categoria } = req.body;

    if (!nombre || !precio || !categoria) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const sql = "INSERT INTO productos (nombre, precio, categoria) VALUES (?, ?, ?)";
    db.run(sql, [nombre, precio, categoria], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, nombre, precio, categoria });
    });
});

app.delete('/api/productos/:id', verifyToken, (req, res) => {
    const id = req.params.id;

    db.run("DELETE FROM productos WHERE id = ?", id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Producto no encontrado para eliminar" });
        res.json({ message: "Producto eliminado correctamente", id: parseInt(id) });
    });
});

// ========================
// INICIAR SERVIDOR
// ========================
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
