<script setup>

const props = defineProps({
    suscripciones: {
        type: Array,
        required: true,
    },
    editarSuscripcion: {
        type: Function,
        required: true,
    },
    eliminarSuscripcion: {
        type: Function,
        required: true,
    },
});

// convierte la fecha ISO que devuelve el backend a un formato legible (dd/mm/aaaa).
// se extrae el "aaaa-mm-dd" directo del string, sin pasar por new Date()/toLocaleDateString,
// porque eso convierte la medianoche UTC guardada a la zona horaria local y retrasa el día 1.
const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const [anio, mes, dia] = String(fecha).slice(0, 10).split('-');
    if (!anio || !mes || !dia) return '-';
    return `${dia}/${mes}/${anio}`;
};



</script>
<template>
    <div v-for="suscripcion in suscripciones" :key="suscripcion.id" class="bg-neutral-primary-soft block w-full p-4 sm:p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium">
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 flex-1 min-w-0">
                <p class="text-body truncate font-bold">{{ suscripcion.servicio || suscripcion.otrosServicios || 'Sin nombre' }}</p>
                <p class="text-body truncate"><span class="font-bold">Fecha de inicio:</span> {{ formatearFecha(suscripcion.fechaInicio) }}</p>
                <p class="text-body truncate"><span class="font-bold">Fecha de fin:</span> {{ formatearFecha(suscripcion.fechaFin) }}</p>
                <p class="text-body truncate"><span class="font-bold">Precio:</span> ${{ suscripcion.precio }}</p>
                <p class="text-body truncate"><span class="font-bold">Tipo de suscripción:</span> {{ suscripcion.tipoSuscripcion || '-' }}</p>
            </div>

            <div class="flex gap-2">
                <button @click="editarSuscripcion(suscripcion.id)" class="flex-1 sm:flex-none bg-green-500 text-white px-4 py-2 rounded-base hover:bg-brand-dark cursor-pointer hover:bg-green-600 transition-all duration-300">Editar</button>
                <button @click="eliminarSuscripcion(suscripcion.id)" class="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-base hover:bg-brand-dark cursor-pointer hover:bg-red-600 transition-all duration-300">Eliminar</button>
            </div>
        </div>
    </div>
</template>
