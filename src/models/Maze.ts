import Cell from "./Cell";

export default class Maze {
  private readonly _width: number;
  private readonly _height: number;
  private readonly _cellWidth: number;
  private readonly _cellHeight: number;
  private readonly _cells: Cell[];

  constructor(width: number, height: number, cellWidth: number, cellHeight: number) {
    this._width = width;
    this._height = height;
    this._cellWidth = cellWidth;
    this._cellHeight = cellHeight;
    this._cells = [];

    this.createCells();
    this.randomize(this._cells[Math.ceil(this._width / 2) - 1]);
    this.createExit();
  }

  private createCells() {
    let count = 0;
    for (let i = 0; i < this._height; i++) {
      for (let j = 0; j < this._width; j++) {
        this._cells.push(new Cell(count, j, i, this._cellWidth, this._cellHeight));
        count++;
      }
    }
  }

  private randomize(startingCell: Cell) {
    const stack: Cell[] = [];
    let currentCell: Cell = startingCell;
    let nextCell: Cell | number = this.getNextNeighbor(currentCell);
    let running: boolean = true;
    currentCell.visited = true;
    while (running) {
      nextCell = this.getNextNeighbor(currentCell);
      if (nextCell !== -1) {
        stack.push(currentCell);
        this.removeWalls(currentCell, nextCell as Cell);
        currentCell = nextCell as Cell;
        currentCell.visited = true;
      } else if (stack.length > 0) {
        currentCell = stack.pop();
      } else {
        running = false;
      }
    }
  }

  private getNextNeighbor(cell: Cell): Cell | number {
    const neighbors: Cell[] = [];
    const top = this._cells[this.getIndex(cell.col, (cell.row + 1))];
    const right = this._cells[this.getIndex((cell.col - 1), cell.row)];
    const bot = this._cells[this.getIndex(cell.col, (cell.row - 1))];
    const left = this._cells[this.getIndex((cell.col + 1), cell.row)];

    if (top && !top.visited) {
      neighbors.push(top);
    }

    if (right && !right.visited) {
      neighbors.push(right);
    }

    if (bot && !bot.visited) {
      neighbors.push(bot);
    }

    if (left && !left.visited) {
      neighbors.push(left);
    }

    if (neighbors.length > 0) {
      const rand = Math.floor(Math.random() * neighbors.length);
      return neighbors[rand];
    } else {
      return -1;
    }
  }

  private removeWalls(thisCell: Cell, nextCell: Cell) {
    const x = thisCell.col - nextCell.col;
    if (x === 1) {
      thisCell.hasRightWall = false;
      nextCell.hasLeftWall = false;
    } else if (x === -1) {
      thisCell.hasLeftWall = false;
      nextCell.hasRightWall = false;
    }

    const y = thisCell.row - nextCell.row;
    if (y === 1) {
      thisCell.hasBotWall = false;
      nextCell.hasTopWall = false;
    } else if (y === -1) {
      thisCell.hasTopWall = false;
      nextCell.hasBotWall = false;
    }
  }

  private createExit() {
    const cornerCells: Cell[] = [];
    cornerCells.push(this._cells[0]); // Bottom right cell
    cornerCells.push(this._cells[this._width - 1]); // Bottom left cell
    cornerCells.push(this._cells[(this._width * this._height) - this._height]); // Top right cell
    cornerCells.push(this._cells[this._cells.length - 1]);

    const exitCellIndex: number = Math.floor(Math.random() * cornerCells.length);
    const exitCell: Cell = cornerCells[exitCellIndex] || cornerCells[3];
    const cellWalls: number[] = [];
    if (exitCell.hasTopWall && (exitCellIndex === 2 || exitCellIndex === 3)) {
      cellWalls.push(0);
    }
    if (exitCell.hasRightWall && (exitCellIndex === 0 || exitCellIndex === 2)) {
      cellWalls.push(1);
    }
    if (exitCell.hasBotWall && (exitCellIndex === 0 || exitCellIndex === 1)) {
      cellWalls.push(2);
    }
    if (exitCell.hasLeftWall && (exitCellIndex === 1 || exitCellIndex === 3)) {
      cellWalls.push(3);
    }
    const cellWall = Math.floor(Math.random() * cellWalls.length);
    const exitWall = cellWalls[cellWall] || 0;
    console.log(exitWall, cellWall, cellWalls);
    switch (exitWall) {
      case 0:
        exitCell.hasTopWall = false;
        break;
      case 1:
        exitCell.hasRightWall = false;
        break;
      case 2:
        exitCell.hasBotWall = false;
        break;
      case 3:
        exitCell.hasLeftWall = false;
        break;
      default:
        exitCell.hasTopWall = false;
    }
    console.log(exitCellIndex, exitCell);
  }

  private getIndex(col: number, row: number) {
    if (col < 0 || row < 0 || col > this._width - 1 || row > this._height - 1) {
      return -1;
    }
    return col + row * this._width;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get cellWidth(): number {
    return this._cellWidth;
  }

  get cellHeight(): number {
    return this._cellHeight;
  }

  get cells(): Cell[] {
    return this._cells;
  }
}