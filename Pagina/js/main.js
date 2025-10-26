// main.js - Código principal mejorado

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 PHOENIX ZONE - Página cargada');
    
    // Inicializar componentes
    inicializarNavegacion();
    actualizarEstadoRestaurante();
    inicializarMenuMobile();
    inicializarNewsletter();
    
    // Contar visita
    contarVisita();
});

// ===== NAVEGACIÓN SUAVE =====
function inicializarNavegacion() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil si está abierto
                cerrarMenuMobile();
            }
        });
    });
}

// ===== ESTADO DEL RESTAURANTE =====
function actualizarEstadoRestaurante() {
    const ahora = new Date();
    const hora = ahora.getHours();
    const estadoElement = document.getElementById('estado-texto');
    
    // Restaurante abierto de 12:00 a 23:00
    const estaAbierto = hora >= 12 && hora < 23;
    
    if (estadoElement) {
        if (estaAbierto) {
            estadoElement.textContent = '🟢 ABIERTO';
            estadoElement.className = '';
        } else {
            estadoElement.textContent = '🔴 CERRADO';
            estadoElement.classList.add('cerrado');
        }
    }
}

// ===== MENÚ MÓVIL =====
function inicializarMenuMobile() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });
    }
}

function cerrarMenuMobile() {
    const navMenu = document.querySelector('.nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (menuToggle) {
            menuToggle.textContent = '☰';
        }
    }
}

// ===== NEWSLETTER =====
function inicializarNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (validarEmail(email)) {
                // Guardar en localStorage
                const suscriptores = JSON.parse(localStorage.getItem('suscriptores')) || [];
                if (!suscriptores.find(s => s.email === email)) {
                    suscriptores.push({
                        email: email,
                        fecha: new Date().toISOString()
                    });
                    localStorage.setItem('suscriptores', JSON.stringify(suscriptores));
                }
                
                mostrarNotificacion('¡Gracias por suscribirte!', 'success');
                this.reset();
            } else {
                mostrarNotificacion('Por favor ingresa un email válido', 'error');
            }
        });
    }
}

// ===== BANNER PROMOCIONAL =====
function cerrarPromo() {
    const promoBanner = document.querySelector('.promo-banner');
    if (promoBanner) {
        promoBanner.style.display = 'none';
    }
}

// ===== CONTADOR DE VISITAS =====
function contarVisita() {
    let visitas = localStorage.getItem('visitas') || 0;
    visitas = parseInt(visitas) + 1;
    localStorage.setItem('visitas', visitas);
    
    console.log(`👋 ¡Bienvenido! Eres el visitante número ${visitas}`);
}

// ===== NOTIFICACIONES =====
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Eliminar notificaciones existentes
    document.querySelectorAll('.notificacion').forEach(notif => notif.remove());
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.remove();
        }
    }, 4000);
}

// ===== VALIDACIONES =====
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarTelefono(telefono) {
    const regex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return regex.test(telefono);
}

// ===== UTILIDADES =====
function formatearPrecio(precio) {
    return `$${parseFloat(precio).toFixed(2)}`;
}

function obtenerFechaActual() {
    return new Date().toISOString().split('T')[0];
}

// ===== DETECCIÓN DE SCROLL =====
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(47, 27, 27, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'var(--color-oscuro)';
        navbar.style.backdropFilter = 'none';
    }
});

// Actualizar estado cada minuto
setInterval(actualizarEstadoRestaurante, 60000);