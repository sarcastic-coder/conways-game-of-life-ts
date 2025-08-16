import { FC, MouseEvent, MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { styledBackgroundCell, styledBoard, styledPageContainer, themeClass } from './App.css.ts';
import { Cell } from './objects/cell.ts';
import { Position } from './objects/position.ts';
import { Coodinates } from './objects/types.ts';
import { World } from './objects/world.ts';

const BoardBackgroundLayer: FC<{ height: number, width: number }> = ({ height, width }) => (
  <>
    <defs>
      <pattern id="background" width={1/width} height={1/height}>
        <rect x={0} y={0} width={1} height={1} className={styledBackgroundCell} />
      </pattern>
    </defs>
    <rect x={0} y={0} width={width} height={height} fill='url(#background)' />
  </>
)

const BoardCursorLayer: FC<{ position: null | Position }> = ({ position }) => {
  if (!position) {
    return null;
  }

  return (
    <rect
      x={position.x}
      y={position.y}
      width={1}
      height={1}
      fill='rgba(255, 0, 0, 0.5)'
      stroke='red'
      strokeWidth={0.05}
    />
  );
}

const useCellFromCursorEvent = (world: [width: number, height: number]) => {
  return useCallback((event: MouseEvent<SVGElement>) => {
    const { top, left, height, width } = event.currentTarget.getBoundingClientRect();
    const [x, y] = [
      (((event.pageX - left) / width) * world[0]),
      (((event.pageY - top) / height) * world[1]),
    ];

    return new Position(Math.trunc(x), Math.trunc(y));
  }, [world]);
}

type Pattern = {
  name: string;
  positions: Coodinates[];
}

const patterns: Record<string, Pattern> = {
  blinker: {
    name: 'Blinker',
    positions: [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  toad: {
    name: 'Toad',
    positions: [
      [0, 1], [1, 1], [2, 1],
      /*[-]*/ [1, 0], [2, 0], [3, 0],
    ],
  },
  glider: {
    name: 'Glider',
    positions: [
      /*[-]*/ [0, 1],
      /*[--], [--],*/ [1, 2],
      [2, 0], [2, 1], [2, 2],
    ],
  },
  pulsar: {
    name: 'Pulsar',
    positions: [
      [2, 0], [3, 0], [4, 0], /*[],[],[]*/ [8, 0], [9, 0], [10, 0],
      /*[]*/
      [0, 2], /*[]*/ [5, 2], /**/[7,2], /*[]*/ [12, 2],
      [0, 3], /*[]*/ [5, 3], /**/[7,3], /*[]*/ [12, 3],
      [0, 4], /*[]*/ [5, 4], /**/[7,4], /*[]*/ [12, 4],
      [2, 5], [3, 5], [4, 5], /*[],[],[]*/ [8, 5], [9, 5], [10, 5],
    ],
  },
  pentadecathlon: {
    name: 'Penta-Decathlon',
    positions: [
      [0, 0], [1, 0], [2, 0],
      [0, 1], /* []*/ [2, 1],
      [0, 2], [1, 2], [2, 2],
      [0, 3], [1, 3], [2, 3],
      [0, 4], [1, 4], [2, 4],
      [0, 5], [1, 5], [2, 5],
      [0, 6], /* []*/ [2, 6],
      [0, 7], [1, 7], [2, 7],
    ],
  }
};

export const App: FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<keyof typeof patterns | null>(null);
  const [showSpawnPositions, setShowSpawnPositions] = useState(false);
  const [cells, setCells] = useState<Cell[]>([]);
  const [cursorPosition, setCursorPosition] = useState<null | Position>(null);
  const [spawnPositions, setSpawnPositions] = useState<Position[]>([]);
  const world = useRef<World>(new World([50, 50]));
  const runInterval = useRef<NodeJS.Timeout | null>(null);
  const getCellFromCursorEvent = useCellFromCursorEvent(world.current.size);

  const handleStep = useCallback(() => {
    world.current.tick();
    setCells([...world.current.cells.values()]);
    setSpawnPositions([ ...world.current.getSpawnPositions() ]);
  }, [setCells]);

  const handleToggleRun = useCallback(() => {
    if (runInterval.current) {
      clearInterval(runInterval.current);
      runInterval.current = null;
      return
    }

    runInterval.current = setInterval(() => {
      world.current.tick();
      setCells([...world.current.cells.values()]);
      setSpawnPositions([ ...world.current.getSpawnPositions() ]);
    }, 500);
  }, [setCells]);

  const handleToggleSpawnPositions = useCallback(() => {
    setShowSpawnPositions(last => !last);
  }, [setShowSpawnPositions]);

  const handleMouseMove = useCallback<MouseEventHandler<SVGElement>>((event) => {
    const position = getCellFromCursorEvent(event);
    setCursorPosition(position);

    if (event.buttons === 1) {
      const existingCell = world.current.cells.get(position.toString());

      if (existingCell) {
        return;
      }

      const newCell = new Cell(position, world.current);
      world.current.addCell(newCell);

      setCells([...world.current.cells.values()]);
      setSpawnPositions([ ...world.current.getSpawnPositions() ]);
    }
  }, [getCellFromCursorEvent]);

  const handleMouseLeave = useCallback(() => {
    setCursorPosition(null);
  }, [setCursorPosition]);

  const handleMouseClick = useCallback<MouseEventHandler<SVGElement>>((event) => {
    const position = getCellFromCursorEvent(event);
    const existingCell = world.current.cells.get(position.toString());

    if (existingCell) {
      world.current.removeCell(existingCell);
      setCells([...world.current.cells.values()]);
      return;
    }

    const newCell = new Cell(position, world.current);
    world.current.addCell(newCell);

    setCells([...world.current.cells.values()]);
    setSpawnPositions([ ...world.current.getSpawnPositions() ]);
  }, [getCellFromCursorEvent]);

  const handleSelectPattern = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const patternKey = event.target.value;
    const pattern = patterns[patternKey];
    if (!pattern) {
      return;
    }

    setSelectedPattern(patternKey);
  }, []);

  const handleApplyPattern = useCallback(() => {
    if (!selectedPattern) {
      return;
    }

    const pattern = patterns[selectedPattern];

    const boardCenter = new Position(
      Math.round(world.current.size[0] / 2),
      Math.round(world.current.size[1] / 2),
    );

    world.current.reset();
    const newCells = pattern.positions
      .map(coords => new Cell(
        Position.fromOffset(boardCenter, world.current.size, coords),
        world.current,
      ));

    newCells.forEach(cell => {
      world.current.addCell(cell);
    });

    setCells([...world.current.cells.values()]);
    setSpawnPositions([ ...world.current.getSpawnPositions() ]);
  }, [selectedPattern, setCells, setSpawnPositions]);

  const handleClearCells = useCallback(() => {
    world.current.reset();
    setCells([]);
    setSpawnPositions([]);
    setSelectedPattern(null);
  }, [setCells, setSpawnPositions, setSelectedPattern]);

  useEffect(() => {
    return () => {
      if (runInterval.current) {
        clearInterval(runInterval.current);
      }
    }
  }, []);

  return (
    <div className={themeClass}>
      <div className={styledPageContainer}>
        <svg
          viewBox={`0 0 ${world.current.size[0]} ${world.current.size[1]}`}
          className={styledBoard}
          xmlns='http://www.w3.org/2000/svg'
          onClick={handleMouseClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <BoardBackgroundLayer height={world.current.size[1]} width={world.current.size[0]} />
          <g>
            {cells.map((cell) => (
              <rect
                key={cell.position.toString()}
                x={cell.position.x}
                y={cell.position.y}
                width={1}
                height={1}
                fill='black'
                stroke={'white'}
                strokeWidth={.05}
                data-neighbour-count={cell.neighbours.size}
              />
            ))}
          </g>
          {showSpawnPositions && <g>
            {spawnPositions.map((position) => (
              <rect
                key={position.toString()}
                x={position.x}
                y={position.y}
                width={1}
                height={1}
                fill='rgba(0, 0, 255, 0.5)'
              />
            ))}
          </g>}
          <BoardCursorLayer position={cursorPosition} />
        </svg>
        <div>
          <select onChange={handleSelectPattern} value={selectedPattern ?? ''}>
            <option value={''}>Select Pattern</option>
            {Object.entries(patterns).map(([key, pattern]) => (
              <option key={key} value={key}>{pattern.name}</option>
            ))}
          </select>
          <button onClick={handleApplyPattern}>Apply Pattern</button>
          <button onClick={handleClearCells}>Clear Cells</button>
          <button onClick={handleToggleSpawnPositions}>{`${showSpawnPositions ? 'Hide' : 'Show'}`} Spawn Positions</button>
          <button onClick={handleStep}>Step</button>
          <button onClick={handleToggleRun}>{`Play/Pause`}</button>
          <p>Cells: {cells.length}</p>
          <p>World Size: {world.current.size[0]} x {world.current.size[1]}</p>
        </div>
      </div>
    </div>
  );
}
