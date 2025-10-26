// reservas.js - Sistema de reservas SIMPLE

document.addEventListener('DOMContentLoaded', function() {
    console.log('📅 Sistema de reservas iniciado');
    inicializarReservas();
});

function inicializarReservas() {
    const reservationForm = document.getElementById('reservationForm');
    
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            hacerReserva();
        });
    }
    
    // Configurar fecha (hoy como mínimo)
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.min = hoy;
        fechaInput.value = hoy; // Por defecto hoy
    }
    
    // Configurar hora por defecto (14:00)
    const horaInput = document.getElementById('hora');
    if (horaInput) {
        horaInput.value = '14:00';
    }
}

function hacerReserva() {
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const personas = document.getElementById('personas').value;
    
    console.log('📝 Datos reserva:', { nombre, telefono, fecha, hora, personas });
    
    // Validaciones básicas
    if (!nombre || !telefono || !fecha || !hora || !personas) {
        alert('❌ Por favor complete todos los campos');
        return;
    }
    
    if (nombre.length < 2) {
        alert('❌ El nombre debe tener al menos 2 caracteres');
        return;
    }
    
    // Verificar si el usuario está logueado
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    
    if (usuario) {
        // Usuario logueado - guardar reserva completa
        guardarReservaUsuario({
            nombre: nombre,
            telefono: telefono,
            fecha: fecha,
            hora: hora,
            personas: personas
        }, usuario);
    } else {
        // Usuario no logueado - guardar reserva básica
        guardarReservaInvitado({
            nombre: nombre,
            telefono: telefono,
            fecha: fecha,
            hora: hora,
            personas: personas
        });
    }
}

function guardarReservaUsuario(datos, usuario) {
    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    
    const nuevaReserva = {
        id: Date.now(),
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombre,
        ...datos,
        estado: 'confirmada',
        tipo: 'usuario',
        fechaCreacion: new Date().toISOString(),
        codigo: generarCodigoReserva()
    };
    
    reservas.push(nuevaReserva);
    localStorage.setItem('reservas', JSON.stringify(reservas));
    
    mostrarConfirmacionReserva(nuevaReserva);
    programarRecordatorio(nuevaReserva);
}

function guardarReservaInvitado(datos) {
    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    
    const nuevaReserva = {
        id: Date.now(),
        ...datos,
        estado: 'confirmada',
        tipo: 'invitado',
        fechaCreacion: new Date().toISOString(),
        codigo: generarCodigoReserva()
    };
    
    reservas.push(nuevaReserva);
    localStorage.setItem('reservas', JSON.stringify(reservas));
    
    mostrarConfirmacionReserva(nuevaReserva);
}

function generarCodigoReserva() {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = '0123456789';
    let codigo = '';
    
    // 3 letras + 3 números (ej: ABC123)
    for (let i = 0; i < 3; i++) {
        codigo += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    for (let i = 0; i < 3; i++) {
        codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
    }
    
    return codigo;
}

function mostrarConfirmacionReserva(reserva) {
    const mensaje = `
✅ ¡RESERVA CONFIRMADA!

📋 Código: ${reserva.codigo}
👤 Nombre: ${reserva.nombre}
📞 Teléfono: ${reserva.telefono}
📅 Fecha: ${formatearFecha(reserva.fecha)}
⏰ Hora: ${reserva.hora}
👥 Personas: ${reserva.personas}

¡Te esperamos en Phoenix Zone!
    `.trim();
    
    alert(mensaje);
    
    // Limpiar formulario
    document.getElementById('reservationForm').reset();
    
    // Volver a inicializar valores por defecto
    inicializarReservas();
}

function formatearFecha(fecha) {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

function programarRecordatorio(reserva) {
    const fechaReserva = new Date(reserva.fecha + 'T' + reserva.hora);
    const ahora = new Date();
    
    // Recordatorio 2 horas antes (solo si la reserva es futura)
    const recordatorioTiempo = fechaReserva - ahora - (2 * 60 * 60 * 1000);
    
    if (recordatorioTiempo > 0) {
        setTimeout(() => {
            mostrarRecordatorio(reserva);
        }, recordatorioTiempo);
        
        console.log('⏰ Recordatorio programado para:', new Date(ahora.getTime() + recordatorioTiempo));
    }
}

function mostrarRecordatorio(reserva) {
    const mensaje = `🔔 Recordatorio: Tienes una reserva hoy a las ${reserva.hora} para ${reserva.personas} personas. Código: ${reserva.codigo}`;
    alert(mensaje);
}

// Función para ver reservas del usuario (se usará en perfil.html)
function obtenerReservasUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuario) return [];
    
    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    return reservas.filter(r => r.usuarioId === usuario.id);
}