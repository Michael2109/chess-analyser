<script setup lang="ts">
import {onMounted, ref, Ref, watch} from 'vue'
import axios from "axios";
import GamesDto from "../common/games-dto.ts";
import {BoardApi, TheChessboard} from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
import GameEvaluator from "../common/evaluation/game-evaluator.ts";
import MoveEvaluation from "../common/evaluation/move-evaluation.ts";
import GameAnalyser from "../common/analysis/game-analyser.ts";
import GamesAnalyses from "../common/analysis/games-summary.ts";
import GamesAnalyser from "../common/analysis/games-analyser.ts";
import GameAnalysis from "../common/analysis/game-analysis.ts";
import GameEvaluation from "../common/evaluation/game-evaluation.ts";


const boardAPI: Ref<BoardApi | undefined> = ref(undefined);

// access the boardAPI in the onMounted hook

const gamesDto: Ref<GamesDto> = ref<GamesDto | undefined>(undefined);

const isAnalysisComplete: Ref<boolean> = ref<boolean>(false);
const currentMove: Ref<number> = ref<number>(0);
const moves: Ref<Array<string>> = ref<Array<string>>([]);
const gameAnalyses: Ref<Array<GameAnalysis>> = ref([])
const gamesAnalyses: Ref<GamesAnalyses | undefined> = ref(undefined)

onMounted(async () => {

  const username = "magnuscarlsen"

  gamesDto.value = (await axios.get<GamesDto>(`https://api.chess.com/pub/player/${username}/games/2024/11`)).data
  const games = gamesDto.value.games.filter(game => game.time_class === "blitz")

  console.log(`Processing ${games.length} games`)

  const taskQueue: Promise<GameEvaluation>[] = [];

  const maxParallel = navigator.hardwareConcurrency;


  console.log(maxParallel)
  for (let i = 0; i < games.length; i++) {


    console.log(`Processing game ${i + 1}`)
    const game = games[i];

    if (!game.white) {
      continue
    }

    const isWhite = username === game.white.username

    if (!isWhite) {
      boardAPI.value?.toggleOrientation()
    }

    const gameEvaluationTask: Promise<GameEvaluation> =GameEvaluator.evaluateGame(game, isWhite, () => {})
    gameEvaluationTask.then(gameEvaluation => gameAnalyses.value.push(GameAnalyser.analyseGame(gameEvaluation)))

    taskQueue.push(gameEvaluationTask);

    // If the queue size reaches the maximum allowed, wait for one to finish
    if (taskQueue.length >= maxParallel) {
      await Promise.race(taskQueue);
      // Remove completed tasks from the queue
      taskQueue.splice(0, taskQueue.findIndex(t => t === gameEvaluationTask));
    }
  }

  await Promise.all(taskQueue);

  gamesAnalyses.value = GamesAnalyser.summariseGames(gameAnalyses.value)

  console.log(gameAnalyses.value)
})

</script>

<template>

  <div>
    <div>
<!--
      <TheChessboard @board-created="(api) => (boardAPI = api)"/>
-->


      <!--      <game-evaluation-graph v-if="gameEvaluations.length > 0 && gameEvaluations[gameEvaluations.length-1]"
                                   :game-evaluation="gameEvaluations[gameEvaluations.length-1]"></game-evaluation-graph>-->

      {{ gamesAnalyses }}
    </div>
  </div>


</template>

<style scoped>

</style>
