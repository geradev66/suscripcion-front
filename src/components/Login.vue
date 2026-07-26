<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import axios from 'axios';
    import { toast } from 'vue3-toastify';
    import * as yup from 'yup';
    import { useForm, Field, ErrorMessage } from 'vee-validate';
    import { authenticate } from '../routes/index.js';

    const router = useRouter();

    /* 1. Definir el esquema de validación con Yup */
    const schema = yup.object().shape({
        email: yup.string().email('Invalid email').required('Email is required'),
        password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    });

    /* 2. Inicializar el formulario con el esquema */
    const {handleSubmit} = useForm({
        validationSchema: schema,
    });

    /* 3. Inicializar las variables de estado */
    const email = ref('');
    const password = ref('');

    /* 4. Inicializar la función de login */
    const login = handleSubmit(async (values) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, values);
            toast.success('Login successful', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            authenticate(response.data.token);
            router.push('/');
        } catch (error) {
            toast.error('Login failed', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    });
</script>


<template>
    <div class="flex justify-center items-center h-screen">
        <div class="bg-neutral-primary-soft block w-[30em] p-6 border border-default rounded-base shadow-xs">
            <h1 class="text-2xl font-bold text-heading text-center">Login</h1>
            <form @submit.prevent="login">
                <div class="mb-4">
                    <label for="email" class="block text-sm font-medium text-heading">Email</label>
                    <Field type="email" id="email" name="email" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" placeholder="Ej. ejemplo@gmail.com" />
                    <ErrorMessage name="email" class="text-red-500" />
                </div>
            
            <div class="mb-4">
                <label for="password" class="block text-sm font-medium text-heading">Password</label>
                <Field type="password" id="password" name="password" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" placeholder="Ej. *********" />
                <ErrorMessage name="password" class="text-red-500" />
            </div>
                <button type="submit" class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Login</button>
                
            </form>
                <p class="text-body text-center">Don't have an account? <a href="/register" class="text-brand hover:text-brand-strong">Register</a></p>
            </div>
    </div>
</template>
