// perfil.js - Perfil de usuario mejorado

document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    cargarPerfil();
    cargarEstadisticas();
});

function verificarAutenticacion() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }
}

function cargarPerfil() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) return;

    // Mostrar información del usuario
    document.getElementById('perfilNombre').textContent = usuario.nombre;
    document.getElementById('perfilEmail').textContent = usuario.email;
    document.getElementById('perfilTelefono').textContent = usuario.telefono || 'No especificado';
    
    // Mostrar fecha de registro formateada
    const fechaRegistro = new Date(usuario.fechaRegistro);
    document.getElementById('perfilFecha').textContent = fechaRegistro.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Actualizar título de la página
    document.title = `Perfil - ${usuario.nombre} | PHOENIX ZONE`;
}

function cargarEstadisticas() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) return;

    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    // Filtrar por usuario
    const misReservas = reservas.filter(r => r.usuarioId === usuario.id);
    const misPedidos = pedidos.filter(p => p.usuarioId === usuario.id);
    
    // Estadísticas
    const totalReservas = misReservas.length;
    const totalPedidos = misPedidos.length;
    const pedidosPendientes = misPedidos.filter(p => p.estado === 'pendiente').length;
    const gastoTotal = misPedidos.reduce((sum, p) => sum + p.total, 0);
    
    // Actualizar UI
    document.getElementById('totalReservas').textContent = totalReservas;
    document.getElementById('totalPedidos').textContent = totalPedidos;
    document.getElementById('puntosFidelidad').textContent = usuario.puntos || 0;
    
    // Mostrar estadísticas adicionales si existen
    const statsContainer = document.querySelector('.stats');
    if (statsContainer) {
        statsContainer.innerHTML += `
            <div class="stat">
                <div class="stat-number">${pedidosPendientes}</div>
                <div class="stat-label">Pendientes</div>
            </div>
            <div class="stat">
                <div class="stat-number">$${gastoTotal.toFixed(2)}</div>
                <div class="stat-label">Total Gastado</div>
            </div>
        `;
    }
}

function editarPerfil() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) return;
    
    const nuevoNombre = prompt('Nuevo nombre:', usuario.nombre);
    const nuevoTelefono = prompt('Nuevo teléfono:', usuario.telefono || '');
    
    if (nuevoNombre && nuevoNombre !== usuario.nombre) {
        // Actualizar en localStorage
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuarioIndex = usuarios.findIndex(u => u.id === usuario.id);
        
        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex].nombre = nuevoNombre;
            usuarios[usuarioIndex].telefono = nuevoTelefono;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            // Actualizar sesión actual
            usuario.nombre = nuevoNombre;
            usuario.telefono = nuevoTelefono;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            
            mostrarNotificacion('✅ Perfil actualizado correctamente');
            cargarPerfil(); // Recargar datos
        }
    }
}

function cambiarPassword() {
    const nuevaPassword = prompt('Nueva contraseña (mínimo 6 caracteres):');
    
    if (nuevaPassword && nuevaPassword.length >= 6) {
        const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuarioIndex = usuarios.findIndex(u => u.id === usuario.id);
        
        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex].password = nuevaPassword;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            mostrarNotificacion('✅ Contraseña cambiada correctamente');
        }
    } else if (nuevaPassword) {
        alert('❌ La contraseña debe tener al menos 6 caracteres');
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('usuarioActual');
        mostrarNotificacion('👋 ¡Hasta pronto!');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Funciones de fidelidad
function canjearPuntos() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario || !usuario.puntos || usuario.puntos < 100) {
        alert('❌ Necesitas al menos 100 puntos para canjear');
        return;
    }
    
    const opciones = [
        { puntos: 100, descuento: '10% en tu próxima compra' },
        { puntos: 200, descuento: 'Postre gratis' },
        { puntos: 500, descuento: 'Cena para 2 personas' }
    ];
    
    let mensaje = '🎁 Canjear Puntos:\n\n';
    opciones.forEach((op, index) => {
        mensaje += `${index + 1}. ${op.puntos} puntos - ${op.descuento}\n`;
    });
    
    const seleccion = prompt(mensaje + '\nElige una opción (1-3):');
    const opcionElegida = opciones[parseInt(seleccion) - 1];
    
    if (opcionElegida && usuario.puntos >= opcionElegida.puntos) {
        // Actualizar puntos
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuarioIndex = usuarios.findIndex(u => u.id === usuario.id);
        
        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex].puntos -= opcionElegida.puntos;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            // Actualizar sesión
            usuario.puntos = usuarios[usuarioIndex].puntos;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            
            alert(`✅ ¡Canje exitoso! Has canjeado ${opcionElegida.puntos} puntos por: ${opcionElegida.descuento}`);
            cargarEstadisticas();
        }
    } else if (opcionElegida) {
        alert('❌ No tienes suficientes puntos para esta opción');
    }
}