import { EventEmitter } from 'events';
import { Position } from './position.ts';
import { World } from './world.ts';

const CELL_LOCAL_AREA: Array<[number, number]> = [
  [0, 1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [-1, 0],
  [-1, -1],
  [-1, 1],
]

interface CellEventMap {
  death: [Cell];
}

export class Cell extends EventEmitter<CellEventMap> {
  public readonly neighbours: Map<string, Cell> = new Map();
  protected localArea: Position[];
  protected expireNextTick: boolean = false;

  public constructor(
    public readonly position: Position,
    public readonly world: World,
  ) {
    super();

    this.setMaxListeners(100);

    this.localArea = CELL_LOCAL_AREA.map<Position>(
      ([x, y]) => Position.fromOffset(this.position, world.size, [x, y])
    )

    world.addListener('cellSpawned', this.handleCellSpawn);
    world.once('cellRemoved', this.handleCellDeath);

    this.localArea
      .forEach((position) => {
        const neighbourPositionKey = position.toString();

        if (!world.cells.has(neighbourPositionKey)) {
          return;
        }

        const neighbour = world.cells.get(neighbourPositionKey)!;
        this.neighbours.set(neighbourPositionKey, neighbour);
        neighbour.once('death', this.handleNeighbourDeath);
      })

    this.expireNextTick = this.neighbours.size < 2 || this.neighbours.size > 3;
  }

  public getSpawnArea(): Set<Position> {
    return new Set(
      this.localArea
        .filter((position) => {
          return !this.neighbours.has(position.toString())
        })
    );
  }

  public tick(): void {
    if (this.expireNextTick) {
      this.handleCellDeath(this);
    }

    this.expireNextTick = this.neighbours.size < 2 || this.neighbours.size > 3;
  }

  protected handleCellSpawn = (cell: Cell): void => {
    if (cell === this) {
      return;
    }

    const distance = this.position.distanceTo(cell.position);

    if (distance === 1) {
      this.neighbours.set(cell.position.toString(), cell);
      cell.once('death', this.handleNeighbourDeath);
    }

    this.expireNextTick = this.neighbours.size < 2 || this.neighbours.size > 3;
  }

  protected handleCellDeath = (cell: Cell): void => {
    if (cell === this) {
      this.emit('death', this);
      this.world.removeListener('cellSpawned', this.handleCellSpawn);
      this.world.removeListener('cellRemoved', this.handleCellDeath);
      this.removeAllListeners('death');

      return;
    }
  }

  protected handleNeighbourDeath = (neighbour: Cell): void => {
    this.neighbours.delete(neighbour.position.toString());
  }
}
