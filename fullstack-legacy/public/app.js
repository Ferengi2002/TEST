// URLs de la API
const API_URL_PRODUCTS = '/api/productos';
const API_URL_REGISTER = '/api/register';
const API_URL_LOGIN = '/api/login';

// Referencias al DOM
const authSection = document.getElementById('auth-section');
const appContent = document.getElementById('app-content');
const userInfo = document.getElementById('user-info');
const welcomeText = document.getElementById('welcome-text');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const productForm = document.getElementById('product-form');
const tableBody = document.getElementById('table-body');
const btnLogout = document.getElementById('btn-logout');

// Estado Local
let token = localStorage.getItem('jwt_token') || '';
let currentUser = localStorage.getItem('username') || '';

// ========================
// INICIALIZACIÓN Y VISTAS
// ========================
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        mostrarApp();
    } else {
        mostrarLogin();
    }
});

function mostrarLogin() {
    authSection.classList.remove('hidden');
    appContent.classList.add('hidden');
    userInfo.classList.add('hidden');
}

function mostrarApp() {
    authSection.classList.add('hidden');
    appContent.classList.remove('hidden');
    userInfo.classList.remove('hidden');
    welcomeText.innerText = ` ${currentUser}`;
    fetchProductos(); // Solo cargamos productos si hay sesión válida
}

// ========================
// LÓGICA DE REGISTRO / LOGIN
// ========================

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;

    try {
        const response = await fetch(API_URL_REGISTER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            alert('Registro exitoso. Ahora puedes iniciar sesión en el panel izquierdo.');
            registerForm.reset();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (err) {
        alert('Ocurrió un error de red al intentar registrarse.');
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    try {
        const response = await fetch(API_URL_LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            // Guardar token y usuario
            token = data.token;
            currentUser = data.username;
            localStorage.setItem('jwt_token', token);
            localStorage.setItem('username', currentUser);

            loginForm.reset();
            mostrarApp();
        } else {
            alert(` Error: ${data.error}`);
        }
    } catch (err) {
        alert('Ocurrió un error de red al intentar iniciar sesión.');
    }
});

btnLogout.addEventListener('click', () => {
    // Borrar estado global
    token = '';
    currentUser = '';
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    tableBody.innerHTML = '';
    mostrarLogin();
});

// ========================
// FETCH AUTORIZADO Y PRODUCTOS
// ========================

// Función Helper que forzosamente inyecta el Token en el header
async function fetchSeguro(url, options = {}) {
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, options);

    // Si el middleware del backend rechaza el token (401 / 403)
    if (response.status === 401 || response.status === 403) {
        alert("Tu sesión ha expirado o es inválida. Por favor, vuelve a iniciar sesión.");
        btnLogout.click(); // Forzamos el cierre de sesión visual y limpieza
        throw new Error("Token Unauthorized");
    }

    return response;
}

// Obtener los productos protegidos
async function fetchProductos() {
    try {
        const response = await fetchSeguro(API_URL_PRODUCTS);
        const productos = await response.json();
        renderTable(productos);
    } catch (err) {
        if (err.message !== "Token Unauthorized") {
            tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">Ocurrió un error al cargar la información.</td></tr>`;
        }
    }
}

// Pintar productos en la tabla
function renderTable(productos) {
    if (productos.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No hay productos en el inventario. Añade uno arriba.</td></tr>`;
        return;
    }

    tableBody.innerHTML = '';
    productos.forEach(producto => {
        const tr = document.createElement('tr');
        const precioFormateado = Number(producto.precio).toFixed(2);

        tr.innerHTML = `
            <td>#${producto.id}</td>
            <td><strong>${producto.nombre}</strong></td>
            <td>$${precioFormateado}</td>
            <td>${producto.categoria}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Crear Producto 
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        precio: parseFloat(document.getElementById('precio').value),
        categoria: document.getElementById('categoria').value
    };

    try {
        const response = await fetchSeguro(API_URL_PRODUCTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });

        if (response.ok) {
            productForm.reset();
            fetchProductos();
        } else {
            const errorData = await response.json();
            alert(`Error al guardar: ${errorData.error}`);
        }
    } catch (err) { }
});

// Eliminar un producto (se expone como window. para el onclick="")
window.eliminarProducto = async function (id) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto #${id}?`)) {
        return;
    }

    try {
        const response = await fetchSeguro(`${API_URL_PRODUCTS}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchProductos();
        } else {
            const errorData = await response.json();
            alert(`Error al eliminar: ${errorData.error}`);
        }
    } catch (err) { }
}
