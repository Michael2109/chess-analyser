<template>
  <div class="w-full flex flex-column align-items-center">
    <div>{{ title }}</div>
    <Chart
      type="pie"
      :data="chartData"
      :options="chartOptions"
      class="w-full md:w-[30rem]"
      style="height: 200px"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
  },
  winRate: {
    type: Number,
  },
  drawRate: {
    type: Number,
  },
  loseRate: {
    type: Number,
  },
});

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

watch(
  () => props.winRate,
  () => {
    chartData.value = setChartData();
  },
);

const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
  const documentStyle = getComputedStyle(document.body);

  console.log(props);
  return {
    labels: ["Win", "Draw", "Lose"],
    datasets: [
      {
        data: [props.winRate, props.drawRate, props.loseRate],
        backgroundColor: [
          documentStyle.getPropertyValue("--p-green-300"),
          documentStyle.getPropertyValue("--p-gray-500"),
          documentStyle.getPropertyValue("--p-red-500"),
        ],
        hoverBackgroundColor: [
          documentStyle.getPropertyValue("--p-green-400"),
          documentStyle.getPropertyValue("--p-gray-600"),
          documentStyle.getPropertyValue("--p-red-600"),
        ],
      },
    ],
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--p-text-color");

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          color: textColor,
        },
      },
    },
  };
};
</script>
