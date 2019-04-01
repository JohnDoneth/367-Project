import Game from "./Game";
import Logger from "./util/Logger";

class MazeGame {
  private _game: Game;

  constructor() {
    Logger.info("MazeGame v1.0.0 initialized.");

    const startScreen = document.getElementById("start-screen");
    startScreen.getElementsByTagName("button")[0].addEventListener("click", () => {
      document.getElementById("start-screen").style.display = "none";
      this._game = new Game();
    });
  }
}

new MazeGame();