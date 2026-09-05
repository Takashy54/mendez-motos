
// --- 1. NAVEGACIÓN MOBILE ---
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
  bar.addEventListener('click', () => {
    nav.classList.add('active');
  });
}

if (close) {
  close.addEventListener('click', () => {
    nav.classList.remove('active');
  });
}

// --- 2. CONFIGURACIÓN Y GESTIÓN DEL CARRITO ---
const PHONE_NUMBER = "573028434789";

class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('mendez_cart')) || [];
  }

  save() {
    localStorage.setItem('mendez_cart', JSON.stringify(this.items));
  }

  addItem(product) {
    const existingIndex = this.items.findIndex(item => item.title === product.title);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += product.quantity;
    } else {
      this.items.push(product);
    }
    this.save();
    this.updateCartBadge();
    alert(`¡${product.title} añadido al carrito!`);
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  updateCartBadge() {
    const bagIcons = document.querySelectorAll('#lg-bag a, #mobile a[href="cart.html"]');
    const totalCount = this.getItemCount();

    bagIcons.forEach(icon => {
      let badge = icon.querySelector('.cart-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.style.cssText = 'background: #088178; color: #fff; border-radius: 50%; padding: 2px 6px; font-size: 12px; margin-left: 3px;';
        icon.appendChild(badge);
      }
      badge.innerText = totalCount > 0 ? totalCount : '';
    });
  }
}

const shoppingCart = new Cart();

// --- 3. FUNCIONES DE DIBUJADO DE LA TABLA (CART.HTML) ---
function renderCartPage() {
  const cartBody = document.getElementById('cart-items-body');
  const subtotalEl = document.getElementById('cart-subtotal');
  const grandTotalEl = document.getElementById('cart-grand-total');

  if (!cartBody) return; // Si no estamos en cart.html, salir

  const items = JSON.parse(localStorage.getItem('mendez_cart')) || [];

  if (items.length === 0) {
    cartBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 30px;">
          Tu carrito está vacío. <br><br>
          <a href="shop.html" style="background: #088178; color: #fff; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Ver productos</a>
        </td>
      </tr>
    `;
    if (subtotalEl) subtotalEl.innerText = '$0';
    if (grandTotalEl) grandTotalEl.innerText = '$0';
    return;
  }

  let totalSum = 0;

  cartBody.innerHTML = items.map((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    totalSum += itemSubtotal;
    return `
      <tr>
        <td><a href="#" onclick="removeCartItem(${index}); return false;"><i class="far fa-times-circle"></i></a></td>
        <td><img src="${item.image}" alt="${item.title}" style="width: 70px;"></td>
        <td>${item.title}</td>
        <td>$${item.price.toLocaleString('es-CO')}</td>
        <td>
          <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, this.value)" style="width: 50px; text-align: center;">
        </td>
        <td>$${itemSubtotal.toLocaleString('es-CO')}</td>
      </tr>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.innerText = `$${totalSum.toLocaleString('es-CO')}`;
  if (grandTotalEl) grandTotalEl.innerText = `$${totalSum.toLocaleString('es-CO')}`;
}

function updateCartQuantity(index, newQuantity) {
  let items = JSON.parse(localStorage.getItem('mendez_cart')) || [];
  const qty = parseInt(newQuantity);

  if (qty > 0) {
    items[index].quantity = qty;
  } else {
    items.splice(index, 1);
  }

  localStorage.setItem('mendez_cart', JSON.stringify(items));
  shoppingCart.items = items;
  shoppingCart.updateCartBadge();
  renderCartPage();
}

function removeCartItem(index) {
  let items = JSON.parse(localStorage.getItem('mendez_cart')) || [];
  items.splice(index, 1);
  localStorage.setItem('mendez_cart', JSON.stringify(items));
  shoppingCart.items = items;
  shoppingCart.updateCartBadge();
  renderCartPage();
}

// --- 4. ENVÍO A WHATSAPP ---
function sendOrderToWhatsApp() {
  const items = JSON.parse(localStorage.getItem('mendez_cart')) || [];

  if (items.length === 0) {
    alert("Tu carrito está vacío. Añade productos antes de realizar el pedido.");
    return;
  }

  let message = "🛵 *¡Hola MENDEZ MOTOS! Quisiera realizar el siguiente pedido:* \n\n";
  let total = 0;

  items.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    message += `*${index + 1}.* ${item.title}\n`;
    message += `   • Cantidad: ${item.quantity}\n`;
    message += `   • Precio Unitario: $${item.price.toLocaleString('es-CO')}\n`;
    message += `   • Subtotal: $${subtotal.toLocaleString('es-CO')}\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL A PAGAR:* $${total.toLocaleString('es-CO')}\n\n`;
  message += `Quedo atento para coordinar la dirección de envío y el método de pago.`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
}

// --- 5. INICIALIZADOR GLOBAL (DOM CONTENT LOADED) ---
document.addEventListener('DOMContentLoaded', () => {
  // Actualizar indicador del badge de la bolsa
  shoppingCart.updateCartBadge();

  // Renderizar la página del carrito (si estamos en cart.html)
  renderCartPage();

  // Escuchar evento para agregar desde la página de producto individual (#prodetails)
  const detailBtn = document.querySelector('.add-to-cart-detail');
  if (detailBtn) {
    detailBtn.addEventListener('click', () => {
      const detailsContainer = document.querySelector('.single-pro-details');
      const imgElement = document.getElementById('MainImg');
      const quantityInput = document.getElementById('product-quantity');

      const rawPrice = detailsContainer.querySelector('h3').innerText;
      const cleanPrice = parseFloat(rawPrice.replace('$', '').replace(/\./g, '').trim());

      const product = {
        title: detailsContainer.querySelector('h5').innerText,
        price: cleanPrice,
        image: imgElement ? imgElement.src : '',
        quantity: quantityInput ? parseInt(quantityInput.value) || 1 : 1
      };

      shoppingCart.addItem(product);
    });
  }

  // Escuchar evento para agregar desde tarjetas (.pro-container)
  const proContainer = document.querySelector('.pro-container');
  if (proContainer) {
    proContainer.addEventListener('click', (e) => {
      const cartLink = e.target.closest('a');
      if (cartLink && cartLink.querySelector('.fa-shopping-cart')) {
        e.preventDefault();

        const card = cartLink.closest('.pro');
        const rawPrice = card.querySelector('h4').innerText;
        const cleanPrice = parseFloat(rawPrice.replace('$', '').replace(/\./g, '').trim());

        const product = {
          title: card.querySelector('.des span').innerText,
          price: cleanPrice,
          image: card.querySelector('img').src,
          quantity: 1
        };

        shoppingCart.addItem(product);
      }
    });
  }

  // Escuchar clic en el botón de WhatsApp en el carrito
  const checkoutBtn = document.getElementById('checkout-whatsapp-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sendOrderToWhatsApp();
    });
  }

  // Manejador para el formulario de contacto (Formspree)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const form = e.target;
      const data = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: data,
          headers: {
            'Accept': 'application/json' // Se corrigieron las comillas aquí
          }
        });

        if (response.ok) {
          alert('¡Gracias! Tu mensaje ha sido enviado exitosamente.');
          form.reset();
        } else {
          alert('Hubo un problema al enviar el mensaje. Inténtalo de nuevo.');
        }
      } catch (error) {
        alert('Ocurrió un error al intentar conectar con el servidor.');
      }
    });
  }
});

function renderProducts() {
  const proContainer = document.querySelector('.pro-container');
  if (!proContainer) return;

  proContainer.innerHTML = productos.map(product => {
    // 1. Lógica para el Estado de Disponibilidad
    const isAvailable = product.available;
    const badgeHTML = isAvailable 
      ? `<span class="stock-badge in-stock">Disponible</span>`
      : `<span class="stock-badge out-of-stock">Agotado</span>`;

    // 2. Lógica para Modificar Precios (Oferta / Descuento)
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const priceHTML = hasDiscount
      ? `<h4 class="price"><span class="old-price">$${product.originalPrice.toLocaleString('es-CO')}</span> $${product.price.toLocaleString('es-CO')}</h4>`
      : `<h4 class="price">$${product.price.toLocaleString('es-CO')}</h4>`;

    // 3. Botón condicional (Si está agotado, se deshabilita)
    const buttonHTML = isAvailable
      ? `<a href="#" class="add-cart-btn"><i class="fal fa-shopping-cart cart"></i></a>`
      : `<a class="add-cart-btn disabled" title="Producto agotado"><i class="fal fa-ban"></i></a>`;

    return `
      <div class="pro ${!isAvailable ? 'pro-disabled' : ''}">
        ${badgeHTML}
        <img src="${product.image}" alt="${product.title}">
        <div class="des">
          <span>MENDEZ MOTOS</span>
          <h5>${product.title}</h5>
          <div class="star">
            <i class="fas fa-star"></i><i class="fas fa-star"></i>
            <i class="fas fa-star"></i><i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
          </div>
          ${priceHTML}
        </div>
        ${buttonHTML}
      </div>
    `;
  }).join('');
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', renderProducts);

