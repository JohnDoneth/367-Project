export default class Cell {
  private readonly _id: number;
  private readonly _col: number;
  private readonly _row: number;
  private readonly _width: number;
  private readonly _height: number;

  private _hasTopWall: boolean;
  private _hasBotWall: boolean;
  private _hasLeftWall: boolean;
  private _hasRightWall: boolean;

  constructor(id: number, col: number, row: number, width: number, height: number) {
    this._id = id;
    this._col = col;
    this._row = row;
    this._width = width;
    this._height = height;

    this._hasTopWall = false;
    this._hasBotWall = false;
    this._hasLeftWall = false;
    this._hasRightWall = false;
  }

  get id(): number {
    return this._id;
  }

  get col(): number {
    return this._col;
  }

  get row(): number {
    return this._row;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get hasTopWall(): boolean {
    return this._hasTopWall;
  }

  set hasTopWall(value: boolean) {
    this._hasTopWall = value;
  }

  get hasBotWall(): boolean {
    return this._hasBotWall;
  }

  set hasBotWall(value: boolean) {
    this._hasBotWall = value;
  }

  get hasLeftWall(): boolean {
    return this._hasLeftWall;
  }

  set hasLeftWall(value: boolean) {
    this._hasLeftWall = value;
  }

  get hasRightWall(): boolean {
    return this._hasRightWall;
  }

  set hasRightWall(value: boolean) {
    this._hasRightWall = value;
  }
}