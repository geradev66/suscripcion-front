import axios from 'axios';
import { ref } from 'vue';

export const useForm = () => {
    const form = ref({
        presupuesto: 0,
        precio: 0,
        servicio: '',
        estado: 'activo',
        fechaInicio: new Date(),
        fechaFin: new Date(),
        otrosServicios: '',
        tipoSuscripcion: '',
    });

    // solo se actualiza con lo que devuelve el backend al crear o consultar un presupuesto
    const presupuestoDisponible = ref(null);

    // lista de suscripciones/presupuestos guardados en el backend (misma tabla "presupuesto")
    const suscripciones = ref([]);

    // consulta los presupuestos/suscripciones guardados en el backend (para persistir al recargar la página)
    const fetchPresupuesto = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/presupuesto/get`);
            const presupuestos = response.data.presupuestos;
            // la tabla mezcla dos tipos de fila: los "abonos" del modal Agregar presupuesto
            // (sin servicio ni otrosServicios) y las suscripciones reales. Solo estas últimas,
            // y que no estén eliminadas (borrado lógico), deben mostrarse en la lista y la gráfica.
            suscripciones.value = (presupuestos || []).filter(
                (p) => (p.servicio || p.otrosServicios) && p.estado !== 'eliminado'
            );
            // el presupuesto disponible se calcula sobre TODAS las filas (incluidas las
            // eliminadas), para no perder la "foto" histórica del presupuesto: si se
            // ignoraran las eliminadas, borrar una suscripción haría que la última fila
            // restante fuera una anterior con un monto más alto, "regresando" dinero ya gastado.
            if (presupuestos && presupuestos.length > 0) {
                const ultimoPresupuesto = presupuestos[presupuestos.length - 1];
                presupuestoDisponible.value = ultimoPresupuesto.presupuesto;
            }
        } catch (error) {
            console.error(error);
        }
    };

    // suma el monto ingresado al presupuesto disponible actual (no lo reemplaza),
    // y no se ve afectado por el "precio" que pueda haber quedado del formulario de suscripciones
    const submit = async () => {
        try {
            // redondeado a 2 decimales para evitar residuos de punto flotante
            const nuevoPresupuesto = Math.round(((presupuestoDisponible.value ?? 0) + Number(form.value.presupuesto || 0)) * 100) / 100;
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/presupuesto/create`, {
                presupuesto: nuevoPresupuesto,
                precio: 0,
                servicio: form.value.servicio,
                estado: form.value.estado,
                fechaInicio: form.value.fechaInicio,
                fechaFin: form.value.fechaFin,
                otrosServicios: form.value.otrosServicios,
            });
            presupuestoDisponible.value = response.data.newPresupuesto.presupuesto;
            form.value.presupuesto = 0;
        } catch (error) {
            console.error(error);
        }
    };
    return { form, submit, presupuestoDisponible, fetchPresupuesto, suscripciones };
};