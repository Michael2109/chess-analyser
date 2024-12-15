<script setup lang="ts">
import { Ref, ref } from "vue";
import GameEvaluator from "../common/evaluation/game-evaluator.ts";
import GamesAnalyser from "../common/analysis/games-analyser.ts";
import GameAnalysis from "../common/analysis/game-analysis.ts";
import GamesSummary from "../common/analysis/games-summary.ts";
import AllGamesSummary from "./summary/AllGamesSummary.vue";
import Chessdotcom from "../common/api/chessdotcom.ts";
import WeeklyChangeSummary from "./summary/weekly/WeeklyChangeSummary.vue";

const username = ref("michael2109");
const depth = ref("8");
const cores = ref(String(navigator.hardwareConcurrency));
const gameType = ref("rapid");
const gameTypeOptions = ref([
  { name: "bullet" },
  { name: "blitz" },
  { name: "rapid" },
]);

const gamesSummary: Ref<GamesSummary | undefined> = ref(undefined);
const currentGame: Ref<number> = ref(0);
const totalGames: Ref<number> = ref(0);
const processingGames: Ref<Map<number, number>> = ref(
  new Map<number, number>(),
);

const gameAnalyses: Ref<Array<GameAnalysis>> = ref([]);

async function processGames() {
  currentGame.value = 0;

  const chessDotComGames = await Chessdotcom.getUserGames(username.value);
  const games = chessDotComGames.games.filter(
    (game) => game.time_class === gameType.value,
  );

  const taskQueue: Array<Promise<GameAnalysis>> = [];

  totalGames.value = games.length;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];

    if (!game.white) {
      continue;
    }

    const isWhite =
      username.value.toLowerCase() === game.white.username.toLowerCase();

    const gameAnalysisTask: Promise<GameAnalysis> = GameEvaluator.evaluateGame(
      game,
      isWhite,
      (evaluationStatus) => {
        if (evaluationStatus.currentMove === evaluationStatus.totalMoves) {
          processingGames.value.delete(i);
        } else {
          processingGames.value.set(
            i,
            evaluationStatus.currentMove / (evaluationStatus.totalMoves - 1),
          );
        }
      },
    );

    gameAnalysisTask.then((gameAnalysis) => {
      currentGame.value = currentGame.value + 1;
      gameAnalyses.value.push(gameAnalysis);
    });

    taskQueue.push(gameAnalysisTask);

    // If the queue size reaches the maximum allowed, wait for one to finish
    if (taskQueue.length >= Number(cores.value)) {
      await Promise.race(taskQueue);
      // Remove completed tasks from the queue
      taskQueue.splice(
        0,
        taskQueue.findIndex((t) => t === gameAnalysisTask),
      );
    }
  }

  await Promise.all(taskQueue);

  gameAnalyses.value = [...gameAnalyses.value];

  gamesSummary.value = GamesAnalyser.summariseGames(gameAnalyses.value);
}
</script>

<template>
  <div
    class="w-full flex flex-column gap-5 justify-content-center align-items-center flex-column"
  >
    <!-- Form Container -->

    <h3>Chess.com Analyser</h3>

    <!-- Username Input -->
    <FloatLabel>
      <InputText id="username" v-model="username" />
      <label for="username">Username</label>
    </FloatLabel>

    <!-- Depth Input -->
    <FloatLabel>
      <InputNumber
        id="depth"
        v-model="depth"
        :min="1"
        :max="15"
        show-buttons
        placeholder="Enter depth"
      />
      <label for="depth">Depth</label>
    </FloatLabel>

    <!-- Cores Input -->
    <FloatLabel>
      <InputNumber id="cores" v-model="cores" :min="1" :max="32" show-buttons />
      <label for="cores">Cores</label>
    </FloatLabel>

    <!-- Game Type Selection -->
    <FloatLabel style="width: 220px">
      <Select
        class="w-full"
        input-class="w-full"
        style="width: 100%"
        id="gameType"
        v-model="gameType"
        :options="gameTypeOptions"
        option-value="name"
        optionLabel="name"
      />
      <label for="gameType">Game Type</label>
    </FloatLabel>

    <!-- Process Button -->
    <div class="p-field">
      <Button label="Start Analysis" icon="pi pi-play" @click="processGames" />
    </div>
  </div>

  <div v-if="currentGame !== totalGames">
    Processing games
    <ProgressBar
      style="width: 100%"
      :show-value="false"
      :value="Math.floor((currentGame / totalGames) * 100.0)"
    >
      <div>{{ currentGame }}/{{ totalGames }}</div>
    </ProgressBar>
  </div>

  <all-games-summary :games-summary="gamesSummary"></all-games-summary>
  <weekly-change-summary :game-analyses="gameAnalyses"></weekly-change-summary>
</template>
