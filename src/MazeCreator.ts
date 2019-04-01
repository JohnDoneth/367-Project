import Maze, {MAZE_ONE} from "./models/Maze";

const OIMO = require("oimo");

class MazeCreator {
  private static _instance: MazeCreator;

  public static getInstance(): MazeCreator {
    if (typeof MazeCreator._instance === "undefined") {
      MazeCreator._instance = new MazeCreator();
    }
    return MazeCreator._instance;
  }

  private constructor() {}

  /**
   * This function creates x, y, and z coordinates for a given maze map.
   * @param maze - a valid maze map.
   * | is used to denote row splits.
   */
  public create(maze: Maze): any[] {
    const objects: any[] = [];
    for (let i = 0; i < maze.height; i++) {
      for (let j = 0; j < maze.width; j++) {
        objects.push(new OIMO.Vec3(Math.ceil(maze.width / 2) - (j + 1), 1, i));
      }
    }
    return objects;
  }
}

export default MazeCreator.getInstance();

export const ONE =
  "----***----|" +
  "-----*-----|" +
  "----**-----|" +
  "----*------|" +
  "----**-----|" +
  "-----*-----|" +
  "----*------|" +
  "-----*-----|" +
  "----***----|" +
  "----***----";