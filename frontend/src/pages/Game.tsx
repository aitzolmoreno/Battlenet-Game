import React, { useEffect, useState, type JSX } from 'react';

// Types
type Cell = string | number | null | Record<string, unknown>;

interface Ship {
  id?: string | number;
  name?: string;
  description?: string;
  cell?: Cell[];
}

interface Board {
  ships: Ship[];
}

interface Player {
  board: Board;
}

interface Scene {
  player1: Player;
  player2: Player;
}

export default function Game(): JSX.Element {
  const url = '/data/scene.json';

  const defaultScene: Scene = {
    player1: { board: { ships: [] } },
    player2: { board: { ships: [] } },
  };

  const [scene, setScene] = useState<Scene>(() => {
    try {
      if (typeof window === 'undefined') return defaultScene;
      const raw = window.localStorage.getItem('board');
      return raw ? (JSON.parse(raw) as Scene) : defaultScene;
    } catch (e) {
      console.error('Error parsing localStorage:', e);
      return defaultScene;
    }
  });

  useEffect(() => {
    let mounted = true;

    function normalizeScene(data: unknown): Scene {
      if (!data) return defaultScene;

      // If it's already in the form { player1, player2 }
      if (typeof data === 'object' && data !== null) {
        const d = data as Record<string, unknown>;
        if (d.player1 || d.player2) {
          return {
            player1: (d.player1 as Player) ?? defaultScene.player1,
            player2: (d.player2 as Player) ?? defaultScene.player2,
          };
        }

        // If it's an array like [player1, player2]
        if (Array.isArray(d)) {
          return {
            player1: (d[0] as Player) ?? defaultScene.player1,
            player2: (d[1] as Player) ?? defaultScene.player2,
          };
        }

        // If it's a board object for player1
        if ('board' in d) {
          return {
            player1: d as unknown as Player,
            player2: defaultScene.player2,
          };
        }
      }

      return defaultScene;
    }

    async function fetchScene(): Promise<void> {
      try {
        const response = await fetch("http://localhost:8080/api/initialize");
        if (!response.ok) throw new Error(`Error al cargar el JSON: ${response.status}`);
        const data = await response.json();

        const normalized = normalizeScene(data);
        window.localStorage.setItem('board', JSON.stringify(normalized));
        if (mounted) setScene(normalized);
      } catch (error) {
        console.error(error);
      }
    }

    const noData = !scene || !scene.player1 || !Array.isArray(scene.player1.board?.ships);
    if (noData) fetchScene();

    return () => { mounted = false; };
  }, [url]);

  // Safe getter
  function getCell(
    playerKey: keyof Scene = 'player1',
    shipIndex = 0,
    cellIndex = 0
  ): Cell | undefined {
    return scene?.[playerKey]?.board?.ships?.[shipIndex]?.cell?.[cellIndex];
  }

  // Safe setter example (updates state + localStorage)
  function setCell(
    playerKey: keyof Scene,
    shipIndex: number,
    cellIndex: number,
    value: Cell
  ): void {
    setScene(prev => {
      const next: Scene = JSON.parse(JSON.stringify(prev));
      if (!next[playerKey]) next[playerKey] = { board: { ships: [] } } as Player;
      if (!next[playerKey].board.ships[shipIndex]) next[playerKey].board.ships[shipIndex] = { cell: [] };
      if (!next[playerKey].board.ships[shipIndex].cell) next[playerKey].board.ships[shipIndex].cell = [];
      next[playerKey].board.ships[shipIndex].cell![cellIndex] = value;
      window.localStorage.setItem('board', JSON.stringify(next));
      console.log(scene);
      return next;
    });
  }

  const exampleCell = getCell('player1', 0, 0);

  return (
    <main className="p-4">
      <header>
        <h1 className="text-2xl font-bold">Battlenet Game</h1>
        <button className="mt-2 px-3 py-1 rounded bg-blue-600 text-white">Attack</button>

        <section className="mt-4 grid gap-2">
          {scene?.player1?.board?.ships?.length ? (
            scene.player1.board.ships.map((ship: Ship, idx: number) => (
              <article key={ship.id ?? idx} className="p-2 border rounded">
                <strong>{ship.name ?? `Ship ${idx}`}</strong>
                <div>Cells: {Array.isArray(ship.cell) ? ship.cell.join(', ') : '—'}</div>
              </article>
            ))
          ) : (
            <p>Loading or no ships...</p>
          )}

          <div className="mt-4">
            <p>
              Ejemplo: <code>scene.player1.board.ships[0].cell[0]</code> =&nbsp;
              <strong>{String(exampleCell)}</strong>
            </p>

            <div className="mt-2">
                <button
                    className="mr-2 px-3 py-1 rounded border"
                    onClick={() => console.log('Valor celda ejemplo:', getCell('player1', 0, 0))}
                >
                    Log cell[0] of ship 0
                </button>
                
                <button
                    className="px-3 py-1 rounded border"
                    onClick={() => setCell('player1', 0, 0, '1000')}
                >
                    Set example cell to 'X'
                </button>
            </div>
          </div>
        </section>
      </header>
    </main>
  );
}