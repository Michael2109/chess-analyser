<script setup lang="ts">
import { PropType } from "vue";
import GameSummary from "../common/analysis/games-summary.ts";

defineProps({
  gamesSummary: {
    type: Object as PropType<GameSummary>,
    required: false,
    default: undefined,
  },
});
</script>

<template>
  <div v-if="gamesSummary">{{ gamesSummary }}</div>
</template>
