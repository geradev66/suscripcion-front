<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue3-toastify';
import { useForm, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';

const props = defineProps({
    presupuestoDisponible: {
        type: Number,
        default: 0,
    },
});

const emit = defineEmits(['suscripcion-agregada']);

const servicios = ref([
    { id: 1, nombre: 'Netflix' },
    { id: 2, nombre: 'Spotify' },
    { id: 3, nombre: 'Amazon' },
    { id: 4, nombre: 'Apple' },
]);

const tipoSuscripciones = ref([
    { id: 1, nombre: 'Mensual' },
    { id: 2, nombre: 'Anual' },
]);

// esquema de validación: "otrosServicios" solo es obligatorio si se marca el checkbox
// "esOtroServicio", y "fechaFin" debe ser posterior a "fechaInicio"
const schema = yup.object({
    precio: yup
        .number()
        .typeError('El precio debe ser un número')
        .positive('El precio debe ser mayor a 0')
        .required('El precio es requerido'),
    // servicio: yup.string().required('El servicio es requerido'),
    fechaInicio: yup
        .date()
        .typeError('La fecha de inicio es requerida')
        .required('La fecha de inicio es requerida'),
    fechaFin: yup
        .date()
        .typeError('La fecha de fin es requerida')
        .required('La fecha de fin es requerida')
        .min(yup.ref('fechaInicio'), 'La fecha de fin debe ser posterior a la fecha de inicio'),
    esOtroServicio: yup.boolean().default(false),
    otrosServicios: yup.string().when('esOtroServicio', {
        is: true,
        then: (s) => s.required('Escribe el nombre del otro servicio'),
        otherwise: (s) => s.notRequired(),
    }),
    tipoSuscripcion: yup.string().required('El tipo de suscripción es requerido'),
});

const { handleSubmit, errors, values, resetForm } = useForm({
    validationSchema: schema,
    initialValues: {
        precio: null,
        servicio: '',
        fechaInicio: '',
        fechaFin: '',
        esOtroServicio: false,
        otrosServicios: '',
        tipoSuscripcion: '',
    },
});

const handleSubmitForm = handleSubmit(async (formValues) => {
    try {
        // se resta el precio de la suscripción del presupuesto disponible real
        await axios.post(`${import.meta.env.VITE_API_URL}/presupuesto/create`, {
            presupuesto: props.presupuestoDisponible ?? 0,
            precio: formValues.precio,
            servicio: formValues.servicio,
            estado: 'activo',
            fechaInicio: formValues.fechaInicio,
            fechaFin: formValues.fechaFin,
            otrosServicios: formValues.esOtroServicio ? formValues.otrosServicios : '',
            tipoSuscripcion: formValues.tipoSuscripcion,
        });
        toast.success('Suscripción agregada correctamente');
        resetForm();
        // avisar al Dashboard para que refresque el presupuesto disponible
        emit('suscripcion-agregada');
    } catch (error) {
        console.error(error);
        toast.error('Error al agregar la suscripción');
    }
});
</script>
<template>
        <div class="bg-neutral-primary-soft block w-full  p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium">
            <form class="max-w-full " @submit.prevent="handleSubmitForm">
                <label for="visitors" class="block mb-2.5 text-sm font-medium text-heading">Precio de servicio</label>
                <Field name="precio" type="number" id="visitors" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" placeholder="Ej. $100" />
                <ErrorMessage name="precio" class="text-red-500 text-sm" />

                <label for="countries" class="block mb-2.5 text-sm font-medium text-heading mt-5">Elige un servicio</label>
                <Field as="select" name="servicio" id="countries" class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body">
                    <option value="" disabled>Selecciona un servicio</option>
                    <option v-for="servicio in servicios" :key="servicio.id" :value="servicio.nombre">{{ servicio.nombre }}</option>
                </Field>
                <ErrorMessage name="servicio" class="text-red-500 text-sm" />

                <div class="flex mt-5">
                        <div class="flex-1">
                            <label for="fechaInicio" class="block mb-2.5 text-sm font-medium text-heading">Fecha de inicio</label>
                            <Field name="fechaInicio" type="date" id="fechaInicio" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" placeholder="Ej. 2026-01-01" />
                            <ErrorMessage name="fechaInicio" class="text-red-500 text-sm" />
                        </div>
                        <div class="flex-1">
                            <label for="fechaFin" class="block mb-2.5 text-sm font-medium text-heading">Fecha fin de la suscripción</label>
                            <Field name="fechaFin" type="date" id="fechaFin" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" placeholder="Ej. 2026-01-01" />
                            <ErrorMessage name="fechaFin" class="text-red-500 text-sm" />
                        </div>
                </div>

                <div class="flex items-center gap-2 mt-5">
                    <Field name="esOtroServicio" type="checkbox" id="checkbox" :value="true" :unchecked-value="false" />
                    <label for="checkbox" class="block text-sm font-medium text-heading">Otro tipo de suscripción</label>
                </div>

                <template v-if="values.esOtroServicio">
                    <Field name="otrosServicios" type="text" id="text" class="bg-neutral-secondary-medium mt-4 border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" placeholder="Ej. Nombre de la suscripción" />
                    <ErrorMessage name="otrosServicios" class="text-red-500 text-sm" />
                </template>

                <label for="select" class="block mb-2.5 text-sm font-medium text-heading mt-5">Tipo de suscripción</label>
                <div>
                    <Field as="select" name="tipoSuscripcion" id="select" class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body">
                    <option value="" disabled>Selecciona un tipo</option>
                    <option v-for="tipoSuscripcion in tipoSuscripciones" :key="tipoSuscripcion.id" :value="tipoSuscripcion.nombre">{{ tipoSuscripcion.nombre }}</option>
                
                </Field>
                <ErrorMessage name="tipoSuscripcion" class="text-red-500 text-sm" />
                </div>
         
 

                <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded-base hover:bg-brand-dark mt-5 cursor-pointer hover:bg-green-600 transition-all duration-300">Agregar suscripción</button>
        </form>
        </div>
</template>
