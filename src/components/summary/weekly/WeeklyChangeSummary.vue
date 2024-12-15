<script setup lang="ts">
import { computed, PropType } from "vue";
import GameSummary from "../../../common/analysis/games-summary.ts";
import RateChart from "../RatesChart.vue";
import RatesChart from "../RatesChart.vue";
import GameAnalysis from "../../../common/analysis/game-analysis.ts";
import gameAnalysis from "../../../common/analysis/game-analysis.ts";
import WeekChart from "./WeekChart.vue";

const props = defineProps({
  gameAnalyses: {
    type: Array as PropType<Array<GameAnalysis>>,
    required: false,
    default: undefined,
  },
});
</script>

<template>
  <week-chart
    v-if="gameAnalyses?.length > 0"
    :game-analyses="gameAnalyses"
  ></week-chart>
</template>
