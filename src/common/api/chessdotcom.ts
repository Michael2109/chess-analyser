import GamesDto from "../games-dto.ts";
import axios, {AxiosResponse} from "axios";

class Chessdotcom {
    static getUserGames(username: string): Promise<AxiosResponse<GamesDto>> {
        return axios.get<GamesDto>(`https://api.chess.com/pub/player/${username}/games/2024/11`)
    }
}

export default Chessdotcom