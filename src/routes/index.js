import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import Dashboard from '../pages/Dashboard.vue';
import Login from '../components/Login.vue';
import Register from '../components/register.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Dashboard,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/login',
            component: Login,
            meta: {
                requiresAuth: false,
            },
        },
        {
            path: '/register',
            component: Register,
            meta: {
                requiresAuth: false,
            },

        },
    ],
});


// funcion para verificar si el usuario está autenticado
const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
};

// restaurar el token en axios si el usuario ya tenía una sesión (ej. al recargar la página)
const storedToken = localStorage.getItem('token');
if (storedToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

// comprobar si laguna de las rutas requiere autenticación
router.beforeEach((to) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        return '/login';
    }
});

// funcion para autenticar al usuario y guardar el token JWT para las siguientes peticiones
const authenticate = (token) => {
    localStorage.setItem('isAuthenticated', 'true');
    if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};

// funcion para cerrar sesión
const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
};

export default router;
export { authenticate, logout, isAuthenticated };