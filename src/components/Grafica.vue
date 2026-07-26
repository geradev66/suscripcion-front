<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Pie } from 'vue-chartjs'

const props = defineProps({
  grafica: {
    type: Object,
    default: () => ({ labels: [], datasets: [{ data: [] }] }),
  },
});

// 1. Registrar los componentes necesarios de Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement)

// 2. Definir los datos del gráfico (reactivo: se recalcula si "grafica" cambia)
const chartData = computed(() => ({
  labels: props.grafica?.labels ?? [],
  datasets: [
    {
      backgroundColor: props.grafica?.datasets?.[0]?.backgroundColor ?? ['#ec003f', '#00a63e', '#fdc700', '#011627', '#00a6f4'],
      data: props.grafica?.datasets?.[0]?.data ?? []
    }
  ]
}))

// 3. Definir las opciones del gráfico
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  }
}

const plugins = [
  {
    legend: {
      display: true,
      position: 'bottom'
    }
  }
]
</script>
<template>
    <div>
        <div class="bg-neutral-primary-soft flex items-center justify-center w-full h-full p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium">
          <div style="width: 400px; height: 400px;">
            <Pie :data="chartData" :options="chartOptions" :plugins="plugins"/>
          </div>
        </div>
    </div>
</template>
