// login.js - Sistema de login organizado y funcional

// ===== CONFIGURACIÓN =====
const CONFIG = {
    usuarios: {
        admin: {
            email: 'admin@phoenixzone.com',
            password: 'admin123',
            nombre: 'Administrador Phoenix',
            rol: 'admin'
        },
        cliente: {
            email: 'cliente@demo.com', 
            password: 'cliente123',
            nombre: 'Cliente Demo',
            rol: 'cliente'
        }
    }
};

// ===== FUNCIONES DE USUARIOS =====
class UserManager {
    constructor() {
        this.init();
    }

    init() {
        this.crearUsuariosPorDefecto();
        this.setupEventListeners();
        console.log('✅ UserManager inicializado');
    }

    crearUsuariosPorDefecto() {
        let usuarios = this.obtenerUsuarios();
        
        // Agregar admin si no existe
        if (!usuarios.find(u => u.email === CONFIG.usuarios.admin.email)) {
            usuarios.push({
                id: 1,
                ...CONFIG.usuarios.admin,
                telefono: '+1234567890',
                fechaRegistro: new Date().toISOString()
            });
        }

        // Agregar cliente demo si no existe
        if (!usuarios.find(u => u.email === CONFIG.usuarios.cliente.email)) {
            usuarios.push({
                id: 2,
                ...CONFIG.usuarios.cliente,
                telefono: '+0987654321',
                fechaRegistro: new Date().toISOString(),
                puntos: 250
            });
        }

        this.guardarUsuarios(usuarios);
    }

    obtenerUsuarios() {
        return JSON.parse(localStorage.getItem('usuarios')) || [];
    }

    guardarUsuarios(usuarios) {
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    // ===== VALIDACIONES =====
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    validarRegistro(nombre, email, password, confirmPassword) {
        if (!nombre || !email || !password || !confirmPassword) {
            this.mostrarError('Por favor complete todos los campos');
            return false;
        }

        if (nombre.length < 2) {
            this.mostrarError('El nombre debe tener al menos 2 caracteres');
            return false;
        }

        if (!this.validarEmail(email)) {
            this.mostrarError('Por favor ingrese un email válido');
            return false;
        }

        if (password.length < 6) {
            this.mostrarError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (password !== confirmPassword) {
            this.mostrarError('Las contraseñas no coinciden');
            return false;
        }

        return true;
    }

    // ===== OPERACIONES DE USUARIO =====
    login(email, password) {
        const usuarios = this.obtenerUsuarios();
        const usuario = usuarios.find(u => u.email === email && u.password === password);

        if (usuario) {
            this.guardarSesion(usuario);
            this.mostrarExito(`¡Bienvenido ${usuario.nombre}!`);
            this.redirigirSegunRol(usuario.rol);
            return true;
        } else {
            this.mostrarError('Email o contraseña incorrectos');
            return false;
        }
    }

    registrar(nombre, email, telefono, password) {
        const usuarios = this.obtenerUsuarios();

        // Verificar si el email ya existe
        if (usuarios.find(u => u.email === email)) {
            this.mostrarError('Este email ya está registrado');
            return false;
        }

        // Crear nuevo usuario
        const nuevoUsuario = {
            id: Date.now(),
            nombre: nombre,
            email: email,
            telefono: telefono,
            password: password,
            rol: 'cliente',
            fechaRegistro: new Date().toISOString(),
            puntos: 100
        };

        usuarios.push(nuevoUsuario);
        this.guardarUsuarios(usuarios);
        this.guardarSesion(nuevoUsuario);
        
        this.mostrarExito(`¡Cuenta creada exitosamente! Bienvenido ${nombre}`);
        this.redirigirSegunRol('cliente');
        
        return true;
    }

    guardarSesion(usuario) {
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    }

    redirigirSegunRol(rol) {
        setTimeout(() => {
            if (rol === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'perfil.html';
            }
        }, 1000);
    }

    // ===== MANEJO DE FORMULARIOS =====
    setupEventListeners() {
        // Formulario Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.procesarLogin();
            });
        }

        // Formulario Registro
        const registroForm = document.getElementById('registroForm');
        if (registroForm) {
            registroForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.procesarRegistro();
            });
        }

        // Verificar parámetros URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('registro') === 'true') {
            this.mostrarRegistro();
        }
    }

    procesarLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        this.login(email, password);
    }

    procesarRegistro() {
        const nombre = document.getElementById('regNombre').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const telefono = document.getElementById('regTelefono').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('registro-confirm-password').value;

        if (this.validarRegistro(nombre, email, password, confirmPassword)) {
            this.registrar(nombre, email, telefono, password);
        }
    }

    // ===== INTERFAZ DE USUARIO =====
    mostrarLogin() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registroForm').classList.add('hidden');
        window.history.replaceState({}, '', 'login.html');
    }

    mostrarRegistro() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registroForm').classList.remove('hidden');
        window.history.replaceState({}, '', 'login.html?registro=true');
    }

    mostrarError(mensaje) {
        alert(`❌ ${mensaje}`);
    }

    mostrarExito(mensaje) {
        alert(`✅ ${mensaje}`);
    }
}

// ===== INICIALIZACIÓN =====
let userManager;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Login page cargada');
    
    userManager = new UserManager();
    
    console.log('✅ Sistema de login completamente inicializado');
});

// ===== FUNCIONES GLOBALES =====
function mostrarLogin() {
    if (userManager) userManager.mostrarLogin();
}

function mostrarRegistro() {
    if (userManager) userManager.mostrarRegistro();
}

// Función simple para recuperar contraseña
function recuperarPassword() {
    const email = prompt('Ingrese su email para recuperar contraseña:');
    if (email && userManager.validarEmail(email)) {
        alert(`📧 Se ha enviado un enlace de recuperación a: ${email}\n\n(En una aplicación real, aquí se enviaría un email)`);
    } else {
        alert('❌ Por favor ingrese un email válido');
    }
}