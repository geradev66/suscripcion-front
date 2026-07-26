<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import { initFlowbite } from 'flowbite'
import Grafica from '../components/Grafica.vue'
import CamposSuscripciones from '../components/CamposSuscripciones.vue'
import ListaSuscripciones from '../components/ListaSuscripciones.vue'
import { useForm } from '../composable/useForm'
import { useRouter } from 'vue-router'

const router = useRouter();

// invocar el useForm
const { form, submit, presupuestoDisponible, fetchPresupuesto, suscripciones } = useForm();

// clase de color según qué tan alto/bajo esté el presupuesto disponible
const claseCategoriaPresupuesto = computed(() => {
    if (presupuestoDisponible.value === null) return 'bg-gray-400';
    if (presupuestoDisponible.value >= 500) return 'PresupuestoAlto';
    if (presupuestoDisponible.value >= 100) return 'PresupuestoMedio';
    return 'PresupuestoBajo';
});

// texto del presupuesto disponible: si es null, cero o negativo (incluyendo residuos de
// punto flotante como -1.4210854715202004e-14 al restar precios) se muestra el mensaje
// en vez de un número extraño
const presupuestoTexto = computed(() => {
    if (presupuestoDisponible.value === null) return 'No hay presupuesto disponible';
    const monto = Math.round(presupuestoDisponible.value * 100) / 100;
    if (monto <= 0) return 'No hay presupuesto disponible';
    return `$${monto.toFixed(2)}`;
});

// color por tipo de servicio: los predefinidos usan su color de marca,
// y cualquier "otro servicio" personalizado se pinta de azul
const colorPorServicio = (servicio) => {
    switch (servicio) {
        case 'Netflix': return '#ec003f';
        case 'Spotify': return '#00a63e';
        case 'Amazon': return '#fdc700';
        case 'Apple': return '#011627';
        default: return '#00a6f4';
    }
};

// datos del gráfico de pastel: agrupa por nombre de servicio y suma sus precios,
// así una porción crece si agregas más suscripciones del mismo servicio,
// en vez de anexar otra porción del mismo color
const graficaData = computed(() => {
    const totalesPorServicio = new Map();

    suscripciones.value.forEach((s) => {
        const nombre = s.servicio || s.otrosServicios || 'Sin nombre';
        const existente = totalesPorServicio.get(nombre);
        if (existente) {
            existente.total += Number(s.precio) || 0;
        } else {
            totalesPorServicio.set(nombre, { total: Number(s.precio) || 0, servicio: s.servicio });
        }
    });

    const nombres = [...totalesPorServicio.keys()];

    return {
        labels: nombres,
        datasets: [
            {
                data: nombres.map((nombre) => totalesPorServicio.get(nombre).total),
                backgroundColor: nombres.map((nombre) => colorPorServicio(totalesPorServicio.get(nombre).servicio)),
            },
        ],
    };
});

// cargar el presupuesto guardado en el backend para que persista al recargar la página
onMounted(() => {
    fetchPresupuesto();
});

// initialize components based on data attribute selectors
onMounted(() => {
    initFlowbite();
})


const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
}

// suscripción que se está editando actualmente (null cuando el modal está cerrado)
const editando = ref(null);

// abre el modal de edición con los datos actuales de la suscripción seleccionada
const handleEditSuscripcion = (id) => {
    const suscripcion = suscripciones.value.find((s) => s.id === id);
    if (!suscripcion) return;
    editando.value = {
        id: suscripcion.id,
        precio: suscripcion.precio,
        precioAnterior: suscripcion.precio,
        servicio: suscripcion.servicio || '',
        fechaInicio: suscripcion.fechaInicio ? suscripcion.fechaInicio.slice(0, 10) : '',
        fechaFin: suscripcion.fechaFin ? suscripcion.fechaFin.slice(0, 10) : '',
        otrosServicios: suscripcion.otrosServicios || '',
        tipoSuscripcion: suscripcion.tipoSuscripcion || '',
    };
};

const cancelarEdicion = () => {
    editando.value = null;
};

// guarda los cambios: primero "deshace" la resta del precio anterior sobre el presupuesto
// disponible actual, y deja que el backend reste el nuevo precio, para no descontar dos veces
const guardarEdicion = async () => {
    if (!editando.value) return;
    try {
        const presupuestoAjustado = Math.round(((presupuestoDisponible.value ?? 0) + Number(editando.value.precioAnterior || 0)) * 100) / 100;
        await axios.put(`${import.meta.env.VITE_API_URL}/presupuesto/edit/${editando.value.id}`, {
            presupuesto: presupuestoAjustado,
            precio: editando.value.precio,
            servicio: editando.value.servicio,
            estado: 'activo',
            fechaInicio: editando.value.fechaInicio,
            fechaFin: editando.value.fechaFin,
            otrosServicios: editando.value.otrosServicios,
            tipoSuscripcion: editando.value.tipoSuscripcion,
        });
        editando.value = null;
        await fetchPresupuesto();
    } catch (error) {
        console.error(error);
    }
};

// eliminar una suscripción/presupuesto existente
const handleDeleteSuscripcion = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/presupuesto/delete/${id}`);
      // no se vuelve a llamar fetchPresupuesto(): el dinero ya restado por esta suscripción
      // no debe "regresar" al presupuesto disponible, solo se quita de la lista y la gráfica.
      // El presupuesto solo debe crecer cuando se agregue una nueva cantidad explícitamente.
      suscripciones.value = suscripciones.value.filter((s) => s.id !== id);
    } catch (error) {
      console.error(error);
    }
}




</script>
<template>
 <main class="container mx-auto sm:px-6 lg:px-8">
  <div class="flex justify-end mt-5">
    <button @click="logout" class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Logout</button>
  </div>
  <section class="text-center mt-10">
    <h1 class="text-2xl font-bold text-gray-700">Gestor de suscripciones</h1>
  </section>
  <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-10">
    <!-- Presupuesto disponible -->
    <div :class="claseCategoriaPresupuesto" class="text-white text-center block w-full p-4 sm:p-6 border border-default rounded-base shadow-xs transition-colors duration-300">
      <p class="font-bold text-2xl">{{ presupuestoTexto }}</p>
    </div>
    <!--Modal de presupuesto-->
    <div class="bg-white text-white text-center block w-full p-4 sm:p-6 border border-default rounded-base shadow-xs">
        <!-- Modal toggle -->
        <button data-modal-target="default-modal" data-modal-toggle="default-modal" class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none" type="button">
          Agregar presupuesto
        </button>

        
              <!-- Main modal -->
        <div id="default-modal" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div class="relative p-4 w-full max-w-2xl max-h-full">
                <!-- Modal content -->
                <div class="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
                    <!-- Modal header -->
                    <div class="flex items-center justify-between border-b border-default pb-4 md:pb-5">
                        <h3 class="text-lg font-medium text-heading">
                            Agregar presupuesto
                        </h3>
                        <button type="button" class="text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
                            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <!-- Modal body -->
                    <form @submit.prevent="submit">
                    <div class="space-y-4 md:space-y-6 py-4 md:py-6">
                        <input v-model="form.presupuesto" type="number" id="presupuesto" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" placeholder="Ej. $1000" required />
                    <button type="submit" class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Agregar presupuesto</button>
                      </div>
                    </form>
                    
                </div>
            </div>
        </div>
    </div>
  </section>
       <!-- Gráfica -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-10">
        <Grafica :grafica="graficaData" />

        <!-- Información de la suscripción -->
        <CamposSuscripciones :presupuesto-disponible="presupuestoDisponible" @suscripcion-agregada="fetchPresupuesto" />
    </div>
    <div class="mt-10">
      <h2 class="text-2xl font-bold text-gray-700">Lista de suscripciones</h2>
    </div>
    <!-- Lista de suscripciones -->
    <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 mt-10">
      <ListaSuscripciones :suscripciones="suscripciones" :editar-suscripcion="handleEditSuscripcion" :eliminar-suscripcion="handleDeleteSuscripcion" />
    </div>

    <!-- Modal de edición de suscripción -->
    <div v-if="editando" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6 w-full max-w-lg">
            <div class="flex items-center justify-between border-b border-default pb-4 md:pb-5">
                <h3 class="text-lg font-medium text-heading">Editar suscripción</h3>
                <button type="button" @click="cancelarEdicion" class="text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center">
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
                    <span class="sr-only">Cerrar</span>
                </button>
            </div>
            <form @submit.prevent="guardarEdicion" class="space-y-4 py-4 md:py-6">
                <div>
                    <label class="block mb-2.5 text-sm font-medium text-heading">Servicio</label>
                    <input v-model="editando.servicio" type="text" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" />
                </div>
                <div>
                    <label class="block mb-2.5 text-sm font-medium text-heading">Precio</label>
                    <input v-model="editando.precio" type="number" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" />
                </div>
                <div class="flex gap-4">
                    <div class="flex-1">
                        <label class="block mb-2.5 text-sm font-medium text-heading">Fecha de inicio</label>
                        <input v-model="editando.fechaInicio" type="date" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" />
                    </div>
                    <div class="flex-1">
                        <label class="block mb-2.5 text-sm font-medium text-heading">Fecha de fin</label>
                        <input v-model="editando.fechaFin" type="date" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" />
                    </div>
                </div>
                <div>
                    <label class="block mb-2.5 text-sm font-medium text-heading">Otros servicios</label>
                    <input v-model="editando.otrosServicios" type="text" class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" />
                </div>
                <div class="flex justify-end gap-2">
                    <button type="button" @click="cancelarEdicion" class="text-heading bg-neutral-secondary-medium box-border border border-default hover:bg-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Cancelar</button>
                    <button type="submit" class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Guardar cambios</button>
                </div>
            </form>
        </div>
    </div>

 </main>
</template>

<style scoped>
.PresupuestoAlto{
  background-color: #00a63e;
}
.PresupuestoMedio{
  background-color: #fdc700;
  color: #000;
}
.PresupuestoBajo{
  background-color: #ec003f;
}
</style>
