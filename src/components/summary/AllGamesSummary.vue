<script setup lang="ts">
import { computed, PropType } from "vue";
import GameSummary from "../../common/analysis/games-summary.ts";
import RateChart from "./RatesChart.vue";
import RatesChart from "./RatesChart.vue";

const props = defineProps({
  gamesSummary: {
    type: Object as PropType<GameSummary>,
    required: false,
    default: undefined,
  },
});

const tableData = computed(() => {
  function toRow(title: string, value: any): { title: string; value: any } {
    return { title: title, value: value };
  }

  if (props.gamesSummary) {
    const gamesSummary = props.gamesSummary;
    return [
      toRow("Total games", gamesSummary.totalGames),
      toRow(
        "Average accuracy (Good+ moves)",
        (gamesSummary.accuracy * 100).toFixed(2),
      ),
      toRow(
        "Average first inaccuracy",
        gamesSummary.averageFirstInaccuracy.toFixed(2),
      ),
      toRow(
        "Average first mistake",
        gamesSummary.averageFirstMistake.toFixed(2),
      ),
      toRow(
        "Average first blunder",
        gamesSummary.averageFirstBlunder.toFixed(2),
      ),
      toRow(
        "Average total moves",
        gamesSummary.averageTotalMovesPerGame.toFixed(2),
      ),
    ];
  } else {
    return [];
  }
});
</script>

<template>
  <div v-if="gamesSummary" class="flex flex-column align-items-center">
    <DataTable :value="tableData" tableStyle="" striped-rows>
      <Column field="title" header="Result"></Column>
      <Column field="value" header="Value"></Column>
    </DataTable>

    <div class="grid grid-nogutter mt-5">
      <div class="col-4">
        <rates-chart
          title="Rates"
          :win-rate="gamesSummary.rates.win"
          :draw-rate="gamesSummary.rates.draw"
          :lose-rate="gamesSummary.rates.lose"
        ></rates-chart>
      </div>
      <div class="col-4">
        <rates-chart
          title="White Rates"
          :win-rate="gamesSummary.whiteRates.win"
          :draw-rate="gamesSummary.whiteRates.draw"
          :lose-rate="gamesSummary.whiteRates.lose"
        ></rates-chart>
      </div>
      <div class="col-4">
        <rates-chart
          title="Black Rates"
          :win-rate="gamesSummary.blackRates.win"
          :draw-rate="gamesSummary.blackRates.draw"
          :lose-rate="gamesSummary.blackRates.lose"
        ></rates-chart>
      </div>
    </div>
  </div>
</template>
