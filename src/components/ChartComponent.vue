<template>
  <canvas ref="chart"></canvas>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  data: Object, // { temp: Number, rainfall: Number }
});

const chart = ref(null);
let chartInstance = null;

onMounted(() => {
  chartInstance = new Chart(chart.value, {
    type: 'bar',
    data: {
      labels: ['Температура', 'Осадки'],
      datasets: [
        {
          label: 'Показатели',
          data: [props.data.temp, props.data.rainfall],
          backgroundColor: ['#f00', '#00f'], // <- убедись, что массив правильный
        }
      ]
    },
    options: {
      responsive: true
    }
  });
});

watch(() => props.data, (newData) => {
  if (chartInstance) {
    chartInstance.data.datasets[0].data = [newData.temp, newData.rainfall];
    chartInstance.update();
  }
});
</script>
