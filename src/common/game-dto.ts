interface GameDto {
    url: string
    uuid: string
    pgn: string
    fen: string
    accuracies: any
    white: { username: string, result: "win" | "loss" }
    black: { username: string, result: "win" | "loss" }
    time_control: string
    time_class: string
}

export default GameDto