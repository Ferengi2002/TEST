const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crea o conecta al archivo físico base de datos
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');

        db.serialize(() => {
            // 1. Tabla productos (Existente)
            db.run(`
                CREATE TABLE IF NOT EXISTS productos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    precio REAL NOT NULL,
                    categoria TEXT NOT NULL
                )
            `);

            // 2. Nueva tabla usuarios
            db.run(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL
                )
            `);

            // Insertar productos de prueba solo si la tabla productos está vacía
            db.get("SELECT COUNT(*) AS count FROM productos", (err, row) => {
                if (row && row.count === 0) {
                    const insert = 'INSERT INTO productos (nombre, precio, categoria) VALUES (?,?,?)';
                    db.run(insert, ["Laptop Pro", 1250.00, "Tecnología"]);
                    db.run(insert, ["Silla Ergonómica", 155.50, "Oficina"]);
                    db.run(insert, ["Teclado Mecánico", 85.00, "Tecnología"]);
                    console.log('🌱 Productos de prueba insertados por defecto.');
                }
            });
        });
    }
});

module.exports = db;
