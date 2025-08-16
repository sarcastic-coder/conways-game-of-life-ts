import { describe, expect, it, vi } from 'vitest';
import { Cell } from './cell.ts';
import { Position } from './position.ts';
import { World } from './world.ts';

describe('Cell', () => {
  it('should return spawn area excluding neighbour positions', () => {
    const world = new World([3, 3]);
    const neighbour1 = new Cell(new Position(0, 1), world);
    const cell = new Cell(new Position(1, 1), world);
    const neighbour2 = new Cell(new Position(2, 1), world);
    cell.neighbours.set(neighbour1.position.toString(), neighbour1);
    cell.neighbours.set(neighbour2.position.toString(), neighbour2);

    const spawnArea = cell.getSpawnArea();

    expect([...spawnArea.values()].sort()).toStrictEqual([
      new Position(0, 0),
      new Position(0, 2),
      new Position(1, 0),
      new Position(1, 2),
      new Position(2, 0),
      new Position(2, 2),
    ]);
  });

  it('should expire if there are not enough neighbours', () => {
    const world = new World([3, 3]);
    const deathListener = vi.fn();
    const cell = new Cell(new Position(0, 0), world);
    cell.addListener('death', deathListener);

    cell.tick();

    expect(deathListener).toHaveBeenCalledWith(cell);
  });

  it('should expire if there are too many neighbours', () => {
    const world = new World([3, 3]);
    const deathListener = vi.fn();

    const neighbour1 = new Cell(new Position(1, 0), world);
    const neighbour2 = new Cell(new Position(-1, 0), world);
    const neighbour3 = new Cell(new Position(0, 1), world);
    const neighbour4 = new Cell(new Position(1, 1), world);

    const cell = new Cell(new Position(0, 0), world);

    cell.addListener('death', deathListener);
    cell.neighbours.set(neighbour1.position.toString(), neighbour1);
    cell.neighbours.set(neighbour2.position.toString(), neighbour2);
    cell.neighbours.set(neighbour3.position.toString(), neighbour3);
    cell.neighbours.set(neighbour4.position.toString(), neighbour4);

    cell.tick();

    expect(deathListener).toHaveBeenCalledWith(cell);
  });

  it.for`
    name         | neighbourPositions
    ${'blinker'} | ${[[2, 1], [2, 3]]}
    ${'toad'}    | ${[[1, 1], [2, 3]]}
  `('should survive if there are just enough neighbours: $name', ({ neighbourPositions }: { name: string; neighbourPositions: [number, number][] }) => {
    const deathListener = vi.fn();
    const world = new World([5, 5]);
    const cell = new Cell(new Position(2, 2), world);
    world.addCell(cell);

    neighbourPositions.forEach(position => {
      const neighbour = new Cell(new Position(...position), world);
      world.addCell(neighbour);
    });

    cell.addListener('death', deathListener);

    cell.tick();

    expect(deathListener).not.toHaveBeenCalled();
  });
});
