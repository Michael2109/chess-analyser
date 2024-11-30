<script setup lang="ts">
import { PropType, ref } from "vue";
import VueApexCharts from "vue3-apexcharts";
import GameEvaluation from "../common/evaluation/game-evaluation.ts";

const props = defineProps({
  gameEvaluation: {
    type: Object as PropType<GameEvaluation>,
    required: true,
  },
});

const series = ref([
  {
    name: "Evaluation",
    data: props.gameEvaluation?.moveEvaluations.map(
      (moveEvaluation) => moveEvaluation.score / 100,
    ), // Evaluation data for each move
  },
]);

// Chart options
const chartOptions = ref({
  chart: {
    width: 350,
    height: "250px",
    type: "area",
    zoom: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "straight",
    width: 8,
  },
  fill: {
    type: "solid", // Use a gradient to make the bottom black
    colors: ["black"],
  },
  title: {
    text: "Chess Game Analysis",
    align: "left",
  },
  xaxis: {
    categories: props.gameEvaluation?.moveEvaluations.map(
      (move) => move.index + 1,
    ), // Labels for moves
  },
  yaxis: {
    title: {
      text: "Evaluation",
    },
    min: -8,
    max: 8,
    forceNiceScale: true,
  },
  tooltip: {
    y: {
      formatter: (val) => `${val} pawns`, // Tooltip format
    },
  },
});
</script>

<template>
  <div>
    <VueApexCharts type="line" :options="chartOptions" :series="series" />
  </div>
</template>

<style scoped></style>
