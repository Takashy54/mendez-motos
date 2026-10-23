// ⚠️ REEMPLAZA ESTA URL CON TU URL REAL DE RENDER (ej. https://mendez-motos-api.onrender.com)
const API_URL = 'https://mendez-motos.onrender.com'; 

let esModoRegistro = false;

const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const btnSubmit = document.getElementById('btn-submit');
const toggleAuth = document.getElementById('toggle-auth');
const toggleText = document.getElementById('toggle-text');

// Alternar entre Login y Registro
if (toggleAuth) {
  toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    esModoRegistro = !esModoRegistro;

    if (esModoRegistro) {
      authTitle.textContent = 'Crear Cuenta';
      btnSubmit.textContent = 'Registrarse';
      toggleText.textContent = '¿Ya tienes una cuenta?';
      toggleAuth.textContent = 'Inicia sesión aquí';
    } else {
      authTitle.textContent = 'Iniciar Sesión';
      btnSubmit.textContent = 'Entrar';
      toggleText.textContent = '¿No tienes cuenta?';
      toggleAuth.textContent = 'Regístrate aquí';
    }
  });
}

// Enviar datos a la API de Render
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    const ruta = esModoRegistro ? '/registro' : '/login';

    try {
      const respuesta = await fetch(`${API_URL}${ruta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      });

      const datos = await respuesta.json();

      if (datos.exito) {
        alert(datos.mensaje);
        if (esModoRegistro) {
          toggleAuth.click(); // Cambiar a modo Login tras registrarse con éxito
        } else {
          localStorage.setItem('usuarioLogueado', datos.usuario);
          alert('¡Sesión iniciada con éxito!');
        }
      } else {
        alert(datos.mensaje);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('No se pudo conectar con el servidor backend.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener el usuario guardado tras el Login
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    const infoCliente = document.getElementById('info-cliente');
    const btnWhatsapp = document.getElementById('checkout-whatsapp-btn');

    // 2. Si el usuario está registrado, mostrar su nombre en el resumen
    if (usuarioLogueado && infoCliente) {
        infoCliente.innerHTML = `<strong>Cliente autenticado:</strong> ${usuarioLogueado}`;
    }

    // 3. Enviar mensaje personalizado por WhatsApp
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', () => {
            const cliente = usuarioLogueado ? usuarioLogueado : 'Cliente no registrado';
            const total = document.getElementById('cart-grand-total')?.textContent || '$0';

            const numeroTelefono = '573209626370'; // Tu número de atención
            const mensaje = encodeURIComponent(`Hola MENDEZ MOTOS, soy ${cliente}. Me gustaría realizar la compra de mi carrito. Total a pagar: ${total}`);

            // Abrir WhatsApp con el pedido listo
            window.open(`https://wa.me/${numeroTelefono}?text=${mensaje}`, '_blank');
        });
    }
});




















