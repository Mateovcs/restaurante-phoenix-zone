// carrito.js - Sistema de carrito SIMPLE

// Estado global del carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ===== FUNCIONES PRINCIPALES =====
function toggleCarrito() {
    const carritoElement = document.getElementById('carrito');
    carritoElement.classList.toggle('abierto');
}

function agregarAlCarrito(id, nombre, precio) {
    // Buscar si ya está en el carrito
    const itemExistente = carrito.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: parseFloat(precio),
            cantidad: 1
        });
    }
    
    guardarCarrito();
    actualizarCarrito();
    mostrarNotificacion(`✅ ${nombre} agregado al carrito`);
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito();
    actualizarCarrito();
    mostrarNotificacion('❌ Producto eliminado');
}

function actualizarCantidad(id, cambio) {
    const item = carrito.find(item => item.id === id);
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(id);
        } else {
            guardarCarrito();
            actualizarCarrito();
        }
    }
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ===== ACTUALIZAR INTERFAZ =====
function actualizarCarrito() {
    const carritoItems = document.getElementById('carrito-items');
    const carritoTotal = document.getElementById('carrito-total');
    const carritoCount = document.getElementById('carrito-count');
    
    // Actualizar contador
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (carritoCount) {
        carritoCount.textContent = totalItems;
        carritoCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Actualizar items del carrito
    if (carrito.length === 0) {
        carritoItems.innerHTML = `
            <div class="carrito-vacio">
                <p>🛒 Tu carrito está vacío</p>
                <p>¡Agrega algunos platos deliciosos!</p>
            </div>
        `;
    } else {
        carritoItems.innerHTML = carrito.map(item => `
            <div class="item-carrito">
                <div class="item-info">
                    <h4>${item.nombre}</h4>
                    <p>$${item.precio.toFixed(2)} c/u</p>
                    <p>Cantidad: ${item.cantidad}</p>
                </div>
                <div class="item-controls">
                    <button onclick="actualizarCantidad(${item.id}, -1)">-</button>
                    <button onclick="actualizarCantidad(${item.id}, 1)">+</button>
                    <button onclick="eliminarDelCarrito(${item.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    }
    
    // Actualizar total
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    if (carritoTotal) {
        carritoTotal.textContent = total.toFixed(2);
    }
}

// ===== REALIZAR PEDIDO =====
function realizarPedido() {
    if (carrito.length === 0) {
        mostrarNotificacion('❌ El carrito está vacío', 'error');
        return;
    }
    
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    
    if (!usuario) {
        mostrarNotificacion('🔐 Debes iniciar sesión para pedir', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Confirmar pedido
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    if (!confirm(`¿Confirmar pedido?\n\nTotal: $${total.toFixed(2)}`)) {
        return;
    }
    
    // Guardar pedido
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const nuevoPedido = {
        id: Date.now(),
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombre,
        items: [...carrito],
        total: total,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        numero: pedidos.length + 1
    };
    
    pedidos.push(nuevoPedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    
    // Limpiar carrito
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
    toggleCarrito();
    
    mostrarNotificacion(`✅ Pedido #${nuevoPedido.numero} realizado`);
    
    // Redirigir al perfil
    setTimeout(() => {
        window.location.href = 'perfil.html';
    }, 2000);
}

// ===== FUNCIONES EXTRA SIMPLES =====
function vaciarCarrito() {
    if (carrito.length === 0) return;
    
    if (confirm('¿Vaciar todo el carrito?')) {
        carrito = [];
        guardarCarrito();
        actualizarCarrito();
        mostrarNotificacion('🗑️ Carrito vaciado');
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Sistema de carrito iniciado');
    actualizarCarrito();
    
    // Cerrar carrito al hacer click fuera
    document.addEventListener('click', function(e) {
        const carritoElement = document.getElementById('carrito');
        const carritoBtn = document.querySelector('.carrito-btn');
        
        if (carritoElement.classList.contains('abierto') && 
            !carritoElement.contains(e.target) && 
            !carritoBtn.contains(e.target)) {
            toggleCarrito();
        }
    });
});

// ===== NOTIFICACIONES SIMPLES =====
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear notificación simple
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'error' ? '#ff4444' : '#28a745'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.remove();
        }
    }, 3000);
}