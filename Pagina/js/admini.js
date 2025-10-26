// admin.js - Panel de administración

document.addEventListener('DOMContentLoaded', function() {
    verificarAdmin();
    cargarEstadisticasAdmin();
    cargarReservasRecientes();
});

function verificarAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    
    if (!usuario || usuario.rol !== 'admin') {
        alert('❌ Acceso denegado. Solo administradores pueden acceder.');
        window.location.href = 'login.html';
        return;
    }
}

function cargarEstadisticasAdmin() {
    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    const hoy = new Date().toDateString();
    
    // Estadísticas
    const totalReservas = reservas.length;
    const reservasHoy = reservas.filter(r => 
        new Date(r.fecha).toDateString() === hoy && 
        r.estado === 'confirmada'
    ).length;
    
    const totalUsuarios = usuarios.filter(u => u.rol === 'cliente').length;
    const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    
    // Actualizar UI
    document.getElementById('totalReservasAdmin').textContent = totalReservas;
    document.getElementById('reservasHoy').textContent = reservasHoy;
    document.getElementById('totalUsuarios').textContent = totalUsuarios;
    document.getElementById('pedidosPendientes').textContent = pedidosPendientes;
}

function cargarReservasRecientes() {
    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    const reservasRecientes = reservas
        .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
        .slice(0, 5); // Últimas 5 reservas
    
    const contenedor = document.getElementById('reservasRecientes');
    
    if (reservasRecientes.length === 0) {
        contenedor.innerHTML = '<p>No hay reservas recientes</p>';
    } else {
        contenedor.innerHTML = reservasRecientes.map(reserva => `
            <div class="reserva-item">
                <div class="reserva-header">
                    <h4>${reserva.nombre} - ${reserva.codigo}</h4>
                    <span class="estado ${reserva.estado}">${reserva.estado}</span>
                </div>
                <div class="reserva-info">
                    <p><strong>Fecha:</strong> ${reserva.fecha} ${reserva.hora}</p>
                    <p><strong>Personas:</strong> ${reserva.personas}</p>
                    <p><strong>Teléfono:</strong> ${reserva.telefono}</p>
                </div>
                <div class="reserva-actions">
                    <button onclick="cambiarEstadoReserva(${reserva.id}, 'confirmada')">✅ Confirmar</button>
                    <button onclick="cambiarEstadoReserva(${reserva.id}, 'cancelada')">❌ Cancelar</button>
                </div>
            </div>
        `).join('');
    }
}

// Funciones de gestión
function gestionarReservas() {
    alert('🔧 Módulo de gestión de reservas\n\n(En una aplicación completa, aquí habría una interfaz para gestionar todas las reservas)');
    
    // Mostrar todas las reservas
    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    let mensaje = '📅 TODAS LAS RESERVAS:\n\n';
    
    reservas.forEach((reserva, index) => {
        mensaje += `${index + 1}. ${reserva.nombre} - ${reserva.fecha} ${reserva.hora} - ${reserva.estado}\n`;
    });
    
    console.log(mensaje);
}

function gestionarPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    let mensaje = '🛒 GESTIÓN DE PEDIDOS:\n\n';
    
    pedidos.forEach((pedido, index) => {
        mensaje += `${index + 1}. #${pedido.numero} - ${pedido.usuarioNombre} - $${pedido.total} - ${pedido.estado}\n`;
    });
    
    const accion = prompt(mensaje + '\nIngresa el número del pedido a gestionar:');
    const pedidoIndex = parseInt(accion) - 1;
    
    if (pedidoIndex >= 0 && pedidoIndex < pedidos.length) {
        const nuevoEstado = prompt('Nuevo estado (pendiente/preparando/completado/cancelado):');
        if (nuevoEstado) {
            pedidos[pedidoIndex].estado = nuevoEstado;
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            mostrarNotificacion('✅ Estado del pedido actualizado');
        }
    }
}

function gestionarUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const clientes = usuarios.filter(u => u.rol === 'cliente');
    
    let mensaje = '👥 GESTIÓN DE USUARIOS:\n\n';
    clientes.forEach((usuario, index) => {
        mensaje += `${index + 1}. ${usuario.nombre} - ${usuario.email} - Puntos: ${usuario.puntos || 0}\n`;
    });
    
    alert(mensaje);
}

function gestionarMenu() {
    alert('📋 Módulo de gestión de menú\n\n(En una aplicación completa, aquí habría CRUD completo del menú)');
}

function verEstadisticas() {
    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    const hoy = new Date();
    const ultimaSemana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const reservasSemana = reservas.filter(r => 
        new Date(r.fechaCreacion) >= ultimaSemana
    ).length;
    
    const pedidosSemana = pedidos.filter(p => 
        new Date(p.fecha) >= ultimaSemana
    ).length;
    
    const ingresosSemana = pedidos
        .filter(p => new Date(p.fecha) >= ultimaSemana)
        .reduce((sum, p) => sum + p.total, 0);
    
    const mensaje = `
📊 ESTADÍSTICAS DETALLADAS

📅 Reservas (última semana): ${reservasSemana}
🛒 Pedidos (última semana): ${pedidosSemana}
💰 Ingresos (última semana): $${ingresosSemana.toFixed(2)}
👥 Total usuarios: ${usuarios.filter(u => u.rol === 'cliente').length}
📈 Reservas totales: ${reservas.length}
🎯 Pedidos totales: ${pedidos.length}
    `.trim();
    
    alert(mensaje);
}

function configuracionSistema() {
    const opcion = prompt(`
⚙️ CONFIGURACIÓN DEL SISTEMA

1. Limpiar datos de prueba
2. Exportar datos
3. Respaldar sistema
4. Restaurar valores por defecto

Elige una opción (1-4):
    `.trim());
    
    switch(opcion) {
        case '1':
            if (confirm('¿Estás seguro de limpiar todos los datos de prueba?')) {
                // Mantener solo usuarios admin
                const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
                const usuariosFiltrados = usuarios.filter(u => u.rol === 'admin');
                localStorage.setItem('usuarios', JSON.stringify(usuariosFiltrados));
                
                // Limpiar otros datos
                localStorage.removeItem('reservas');
                localStorage.removeItem('pedidos');
                localStorage.removeItem('carrito');
                
                mostrarNotificacion('✅ Datos de prueba limpiados');
            }
            break;
        case '2':
            exportarDatos();
            break;
        case '3':
            alert('💾 Función de respaldo activada');
            break;
        case '4':
            if (confirm('¿Restaurar valores por defecto? Esto limpiará todos los datos.')) {
                localStorage.clear();
                mostrarNotificacion('✅ Sistema restaurado');
                setTimeout(() => location.reload(), 1000);
            }
            break;
    }
}

function cambiarEstadoReserva(idReserva, nuevoEstado) {
    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    const reservaIndex = reservas.findIndex(r => r.id === idReserva);
    
    if (reservaIndex !== -1) {
        reservas[reservaIndex].estado = nuevoEstado;
        localStorage.setItem('reservas', JSON.stringify(reservas));
        mostrarNotificacion(`✅ Reserva ${nuevoEstado}`);
        cargarReservasRecientes();
    }
}

function exportarDatos() {
    const datos = {
        usuarios: JSON.parse(localStorage.getItem('usuarios')) || [],
        reservas: JSON.parse(localStorage.getItem('reservas')) || [],
        pedidos: JSON.parse(localStorage.getItem('pedidos')) || [],
        exportado: new Date().toISOString()
    };
    
    const datosStr = JSON.stringify(datos, null, 2);
    const blob = new Blob([datosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `phoenixzone-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarNotificacion('📤 Datos exportados correctamente');
}

function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    mostrarNotificacion('👋 Sesión de admin cerrada');
    setTimeout(() => window.location.href = 'index.html', 1000);
}