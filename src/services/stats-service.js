import {
  getDb,
  collection,
  getDocs,
  query,
  where,
} from '../firebase/firestore.js';
import { getGame } from './game-service.js';
import { COLLECTIONS } from '../utils/constants.js';

async function getGamePlays(gameId) {
  const q = query(
    collection(getDb(), COLLECTIONS.PLAYS),
    where('gameId', '==', gameId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data());
}

export async function getGameStats(gameId) {
  const [game, plays] = await Promise.all([
    getGame(gameId),
    getGamePlays(gameId),
  ]);

  if (!game) return null;

  const participantCount = plays.length;
  const rowStats = [];

  for (let y = 0; y < game.yCount; y++) {
    const yLabel = game.yLabels?.[y] || `항목 ${y + 1}`;
    const colCounts = {};

    for (let x = 0; x < game.xCount; x++) {
      colCounts[x] = 0;
    }

    for (const play of plays) {
      if (!play.result) continue;
      const selection = play.result.find((s) => s.row === y);
      if (selection !== undefined && selection.col !== undefined) {
        colCounts[selection.col] = (colCounts[selection.col] || 0) + 1;
      }
    }

    const cols = [];
    for (let x = 0; x < game.xCount; x++) {
      const cell = game.cells?.find((c) => c.row === y && c.col === x);
      const count = colCounts[x] || 0;
      const percentage = participantCount > 0 ? Math.round((count / participantCount) * 100) : 0;
      cols.push({
        col: x,
        xLabel: game.xLabels?.[x] || `단계 ${x + 1}`,
        name: cell?.name || '',
        description: cell?.description || '',
        image: cell?.images?.[0] || null,
        count,
        percentage,
      });
    }

    rowStats.push({ y, yLabel, cols, total: participantCount });
  }

  return {
    game,
    participantCount,
    playCount: game.playCount || 0,
    rowStats,
  };
}
