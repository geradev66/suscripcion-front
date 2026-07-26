<script setup>
import axios from 'axios';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import * as yup from 'yup';
import { useForm, Field, ErrorMessage } from 'vee-validate';

const router = useRouter();

// 1. Definir el esquema de validación con Yup
const schema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});


// 2. Inicializar el formulario con el esquema
const {handleSubmit} = useForm({
    validationSchema: schema,
});


const register = handleSubmit(async (values) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, values);
        toast.success('Register successful', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        router.push('/login');
    } catch (error) {
        toast.error('Error al registrar', {
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
            <h1 class="text-2xl font-bold text-heading text-center">Register</h1>
            <form @submit.prevent="register">
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
                <button type="submit" class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Register</button>
            </form>
            <p class="text-body text-center">Already have an account? <a href="/login" class="text-brand hover:text-brand-strong">Login</a></p>
        </div>
    </div>
</template>
