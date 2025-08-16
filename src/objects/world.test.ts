import { describe, it, vi, expect } from 'vitest';
import { Cell } from './cell.ts';
import { Position } from './position.ts';
import { World } from './world.ts';

describe('World', () => {
  it('will publish a cell added event', () => {
    const cellSpawnedListener = vi.fn();
    const world = new World([3, 3]);
    world.addListener('cellSpawned', cellSpawnedListener);

    const cell = new Cell(new Position(1, 1), world);
    world.addCell(cell);

    expect(cellSpawnedListener).toHaveBeenCalledWith(cell);
  });

  it('will retreive spawn positions', () => {
    const world = new World([5, 5]);

    const cells = [
      new Cell(new Position(1, 2), world),
      new Cell(new Position(2, 2), world),
      new Cell(new Position(3, 2), world),
    ];

    cells.forEach(cell => {
      world.addCell(cell);
    });

    expect([...world.getSpawnPositions().values()]).toStrictEqual([
      new Position(2, 1),
      new Position(2, 3),
    ])
  })

  it('should maintain still block', () => {
    const world = new World([6, 6]);
    const cell1 = new Cell(new Position(2, 2), world);
    const cell2 = new Cell(new Position(3, 2), world);
    const cell3 = new Cell(new Position(3, 3), world);
    const cell4 = new Cell(new Position(2, 3), world);

    world.addCell(cell1);
    world.addCell(cell2);
    world.addCell(cell3);
    world.addCell(cell4);

    world.tick();
    expect([...world.cells.keys()].sort()).toStrictEqual(['2,2', '2,3', '3,2', '3,3']);

    world.tick();
    expect([...world.cells.keys()].sort()).toStrictEqual(['2,2', '2,3', '3,2', '3,3']);
  });

  it('should maintain still beehive', () => {
    const world = new World([6, 6]);

    const cells = [
      new Cell(new Position(3, 2), world),
      new Cell(new Position(4, 2), world),
      new Cell(new Position(2, 3), world),
      new Cell(new Position(5, 3), world),
      new Cell(new Position(3, 4), world),
      new Cell(new Position(4, 4), world),
    ]

    cells.forEach(cell => world.addCell(cell));

    world.tick();

    expect([...world.cells.keys()].sort()).toStrictEqual(['2,3', '3,2', '3,4', '4,2', '4,4', '5,3']);

    world.tick();

    expect([...world.cells.keys()].sort()).toStrictEqual(['2,3', '3,2', '3,4', '4,2', '4,4', '5,3']);
  });

  it('should maintain oscilator blinker', () => {
    const world = new World([5, 5]);

    const cells = [
      new Cell(new Position(1, 2), world),
      new Cell(new Position(2, 2), world),
      new Cell(new Position(3, 2), world),
    ]

    const deathListener = vi.fn();

    cells.forEach(cell => {
      cell.addListener('death', deathListener);
      world.addCell(cell);
    });

    world.tick();
    expect([...world.cells.keys()].sort()).toStrictEqual(['2,1', '2,2', '2,3'])

    world.tick();
    expect([...world.cells.keys()].sort()).toStrictEqual(['1,2', '2,2', '3,2'])
  });

  it('should maintain oscilator toad', () => {
    const world = new World([6, 6]);

    const cells = [
      new Cell(new Position(3, 3), world),
      new Cell(new Position(4, 3), world),
      new Cell(new Position(5, 3), world),
      new Cell(new Position(2, 4), world),
      new Cell(new Position(3, 4), world),
      new Cell(new Position(4, 4), world),
    ];

    cells.forEach(cell => world.addCell(cell));

    world.tick();
    expect([...world.cells.keys()].sort()).toStrictEqual([
      '2,3',
      '2,4',
      '3,5',
      '4,2',
      '5,3',
      '5,4',
    ]);

    world.tick();
    expect([...world.cells.keys()].sort()).toStrictEqual([
      '2,4',
      '3,3',
      '3,4',
      '4,3',
      '4,4',
      '5,3',
    ]);
  });
});
