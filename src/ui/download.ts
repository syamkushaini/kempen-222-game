import { serializeSave, type GameState } from '../state/game';
import { exportFileName } from '../state/saves';

/** Hands the player a file of the game, for keeping or for moving to another device. */
export function downloadGame(game: GameState): void {
  const url = URL.createObjectURL(new Blob([serializeSave(game)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = exportFileName(game);
  a.click();
  URL.revokeObjectURL(url);
}
