import Maze, {MAZE_ONE} from "./models/Maze";
import Cell from "./models/Cell";

const OIMO = require("oimo");

export interface IMazeResults {
  objectCoords: any[]; // Comes back as an array of positions
  wallCoords: any[]; // Comes back as a array of [size, position]
}

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
  public create(maze: Maze): IMazeResults {
    const objects: any[] = [];
    const walls: any[] = [];
    let count = 0;
    for (let i = 0; i < maze.height; i++) {
      for (let j = 0; j < maze.width; j++) {
        const cell: Cell = maze.cells[count];
        if (cell.hasTopWall) {
          walls.push([
            new OIMO.Vec3(maze.cellWidth, 1, 0.1), // size
            new OIMO.Vec3(Math.ceil(maze.width / 2) - (j + 1), 1, i) // position
          ]);
        }
        if (cell.hasRightWall) {
          walls.push([
            new OIMO.Vec3(0.1, 1, maze.cellHeight), // size
            new OIMO.Vec3(maze.width + 1, 1, i) // position
          ]);
        }
        objects.push(new OIMO.Vec3(Math.ceil(maze.width / 2) - (j + 1), 1, i));
        count++
      }
    }
    return {objectCoords: objects, wallCoords: walls};
  }
}

export default MazeCreator.getInstance();