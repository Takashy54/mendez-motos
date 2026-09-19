const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de MENDEZ MOTOS funcionando correctamente' });
});

// Ruta de login (ejemplo inicial)
app.post('/api/login', (req, res) => {
  const { usuario, password } = req.body;

  // Lógica básica temporal
  if (usuario === 'admin' && password === '1234') {
    res.json({ exito: true, mensaje: 'Inicio de sesión exitoso' });
  } else {
    res.status(401).json({ exito: false, mensaje: 'Credenciales incorrectas' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


           
