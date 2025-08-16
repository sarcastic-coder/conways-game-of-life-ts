import { Bounds, Coodinates } from './types.ts';

export type PositionString = `${number},${number}`;

export class Position {
  constructor(public readonly x: number, public readonly y: number) {}

  public toString(): PositionString {
    return `${this.x},${this.y}`;
  }

  public distanceTo(other: Position): number {
    return Math.floor(Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)));
  }

  public static fromString(positionKey: PositionString): Position {
    const [x, y] = positionKey.split(',').map(Number);
    return new Position(x, y);
  }

  public static fromOffset(origin: Position, [width, height]: Bounds, [x, y]: Coodinates): Position {
    return new Position((origin.x + width + x) % width, (origin.y + height + y) % height);
  }
}
