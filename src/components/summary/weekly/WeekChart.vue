<template>
  <div class="w-full flex flex-column align-items-center">
    <div>Week</div>
    {{ Array.from(gameAnalysesByWeek.keys()) }}
    <Chart
      type="line"
      :data="chartData"
      :options="chartOptions"
      class="w-full h-[50rem]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from "vue";
import GameAnalysis from "../../../common/analysis/game-analysis.ts";
import GameAnalyser from "../../../common/analysis/games-analyser.ts";

const props = defineProps({
  gameAnalyses: {
    type: Array as PropType<Array<GameAnalysis>>,
  },
});

watch(
  () => props.gameAnalyses,
  () => {
    chartData.value = getChartData();
  },
);

const gameAnalysesByWeek = computed(() => {
  const map: Map<string, Array<GameAnalysis>> = new Map<
    string,
    Array<GameAnalysis>
  >();

  if (props.gameAnalyses) {
    props.gameAnalyses.forEach((gameAnalysis) => {
      // Extract the value of the key
      const weekKey = JSON.stringify({
        week: gameAnalysis.date.week(),
        year: gameAnalysis.date.year(),
      });

      // Initialize the group if it doesn't exist
      if (!map.get(weekKey)) {
        map.set(weekKey, []);
      }

      // Add the item to the group
      map.get(weekKey).push(gameAnalysis);
    });
  }
  return map;
});

onMounted(() => {
  chartData.value = getChartData();
  chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();

const getChartData = () => {
  const documentStyle = getComputedStyle(document.body);

  return {
    labels: Array.from(gameAnalysesByWeek.value.keys()).map((value) => {
      const obj = JSON.parse(value);

      return obj.week + " : " + obj.year;
    }),
    datasets: [
      {
        label: "Accuracy",
        data: Array.from(gameAnalysesByWeek.value.values()).map((week) => {
          return (GameAnalyser.getAverageAccuracy(week) * 100).toFixed(0);
        }),
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
