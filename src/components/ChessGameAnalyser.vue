<script setup lang="ts">

import {Ref, ref} from "vue";
import GameEvaluator from "../common/evaluation/game-evaluator.ts";
import GamesAnalyser from "../common/analysis/games-analyser.ts";
import GameAnalysis from "../common/analysis/game-analysis.ts";
import GamesSummary from "../common/analysis/games-summary.ts";
import AllGamesSummary from "./AllGamesSummary.vue";
import Chessdotcom from "../common/api/chessdotcom.ts";

const username = ref("michael2109")
const depth = ref("8")
const cores = ref("32")
const gameType = ref("rapid")
const gameTypeOptions = ref([
  {name: 'bullet'},
  {name: 'blitz'},
  {name: 'rapid'}
]);

const gamesSummary: Ref<GamesSummary | undefined> = ref(undefined)
const currentGame: Ref<number> = ref(0)
const totalGames: Ref<number> = ref(0)
const processingGames: Ref<Map<number, number>> = ref(new Map<number, number>())

async function processGames() {

  console.log(gameType.value)

  const chessDotComGames = (await Chessdotcom.getUserGames(username.value)).data
  const games = chessDotComGames.games.filter(game => game.time_class === gameType.value)

  console.log(`Processing ${games.length} games`)

  const taskQueue: Array<Promise<GameAnalysis>> = [];

  const maxParallel = navigator.hardwareConcurrency;

  const gameAnalyses: Array<GameAnalysis> = []

  console.log(maxParallel)

  totalGames.value = games.length;

  for (let i = 0; i < games.length; i++) {

    console.log(`Processing game ${i + 1}`)
    const game = games[i];


    if (!game.white) {
      continue
    }

    const isWhite = username.value === game.white.username

    const gameAnalysisTask: Promise<GameAnalysis> = GameEvaluator.evaluateGame(game, isWhite, (evaluationStatus) => {

      if (evaluationStatus.currentMove === evaluationStatus.totalMoves) {
        processingGames.value.delete(i)
      } else {
        processingGames.value.set(i, evaluationStatus.currentMove / (evaluationStatus.totalMoves - 1))
      }
    })

    gameAnalysisTask.then(gameAnalysis => {
          currentGame.value = currentGame.value + 1;
          gameAnalyses.push(gameAnalysis)
        }
    )

    taskQueue.push(gameAnalysisTask);

    // If the queue size reaches the maximum allowed, wait for one to finish
    if (taskQueue.length >= maxParallel) {
      await Promise.race(taskQueue);
      // Remove completed tasks from the queue
      taskQueue.splice(0, taskQueue.findIndex(t => t === gameAnalysisTask));
    }
  }

  await Promise.all(taskQueue);

  gamesSummary.value = GamesAnalyser.summariseGames(gameAnalyses)

  console.log(gamesSummary)

}

</script>

<template>
  <div class="grid justify-center">
    <div class="col-12 md-6">
      <!-- Form Container -->
      <div class="card p-p-4">
        <h3>Chess Analysis Settings</h3>
        <div class="p-fluid">
          <!-- Username Input -->
          <div class="p-field">
            <label for="username">Username</label>
            <InputText id="username" v-model="username" placeholder="Enter username"/>
          </div>

          <!-- Depth Input -->
          <div class="p-field">
            <label for="depth">Depth</label>
            <InputNumber id="depth" v-model="depth" :min="1" :max="15" placeholder="Enter depth"/>
          </div>

          <!-- Cores Input -->
          <div class="p-field">
            <label for="cores">Cores</label>
            <InputNumber id="cores" v-model="cores" :min="1" :max="32" placeholder="Enter number of cores"/>
          </div>

          <!-- Game Type Selection -->
          <div class="p-field">
            <label for="gameType">Game Type</label>
            <Select id="gameType" v-model="gameType" :options="gameTypeOptions" option-value="name" optionLabel="name"/>

          </div>

          <!-- Process Button -->
          <div class="p-field">
            <Button label="Start Analysis" icon="pi pi-play" @click="processGames"/>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ProgressBar :value="Math.floor((((currentGame) / totalGames) * 100.0))">
    <div>{{ currentGame }}/{{ totalGames }}</div>
  </ProgressBar>

  <all-games-summary :games-summary="gamesSummary"></all-games-summary>
</template>