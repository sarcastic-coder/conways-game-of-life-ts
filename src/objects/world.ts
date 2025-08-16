import { EventEmitter } from 'events';
import { Cell } from './cell.ts';
import { Position, PositionString } from './position.ts';
import { Bounds } from './types.ts';

interface WorldEventMap {
  cellSpawned: [Cell];
  cellRemoved: [Cell];
}

export class World extends EventEmitter<WorldEventMap> {
  public readonly cells: Map<string, Cell> = new Map();

  public constructor(public readonly size: Bounds) {
    super();
    this.setMaxListeners(100);
  }

  public addCell(cell: Cell): void {
    this.cells.set(cell.position.toString(), cell);

    cell.once('death', this.handleCellDeath);
    this.emit('cellSpawned', cell);
  }

  public removeCell(cell: Cell): void {
    this.cells.delete(cell.position.toString());
    this.emit('cellRemoved', cell);
  }

  public reset(): void {
    this.cells.clear();

    this.removeAllListeners('cellSpawned');
    this.removeAllListeners('cellRemoved');
  }

  public getSpawnPositions(): Set<Position> {
    const positionNeighbours = new Map<PositionString, number>();
    this.cells.values().forEach((cell) => {
      cell.getSpawnArea().forEach((position) => {
        const count = positionNeighbours.get(position.toString()) ?? 0;
        positionNeighbours.set(position.toString(), count + 1);
      });
    });

    return new Set(
      positionNeighbours
        .entries()
        .filter(([, count]) => count === 3)
        .map(([position]) => Position.fromString(position))
    );
  }

  public tick(): void {
    const nextSpawns = this.getSpawnPositions();

    this.cells.forEach((cell) => {
      cell.tick();
    });

    nextSpawns.forEach((position: Position): Cell => {
      const newCell = new Cell(position, this);
      this.addCell(newCell);
      return newCell;
    });

  }

  protected handleCellDeath = (cell: Cell): void => {
    this.cells.delete(cell.position.toString());
  }
}
