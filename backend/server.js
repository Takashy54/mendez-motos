const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Inicializar la tabla de usuarios
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        usuario VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla de usuarios activa');
  } catch (err) {
    console.error('Error al iniciar BD:', err);
  }
};
initDb();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de MENDEZ MOTOS conectada a PostgreSQL correctamente' });
});

// 1. Ruta para Registrar un Usuario Nuevo
app.post('/api/registro', async (req, res) => {
  const { usuario, password } = req.body;
  
  if (!usuario || !password) {
    return res.status(400).json({ exito: false, mensaje: 'Por favor completa todos los campos' });
  }

  try {
    const nuevoUsuario = await pool.query(
      'INSERT INTO usuarios (usuario, password) VALUES ($1, $2) RETURNING id, usuario',
      [usuario, password]
    );
    res.json({ exito: true, mensaje: 'Usuario registrado con éxito', usuario: nuevoUsuario.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Código de duplicado en PostgreSQL
      return res.status(400).json({ exito: false, mensaje: 'El nombre de usuario ya existe' });
    }
    res.status(500).json({ exito: false, mensaje: 'Error al registrar el usuario' });
  }
});

// 2. Ruta para Iniciar Sesión
app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE usuario = $1 AND password = $2',
      [usuario, password]
    );

    if (resultado.rows.length > 0) {
      res.json({ exito: true, mensaje: '¡Bienvenido a MENDEZ MOTOS!', usuario: resultado.rows[0].usuario });
    } else {
      res.status(401).json({ exito: false, mensaje: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    res.status(500).json({ exito: false, mensaje: 'Error al iniciar sesión' });
  }
});

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

           
