import {
  getDb,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from '../firebase/firestore.js';
import { getGame } from './game-service.js';
import { COLLECTIONS } from '../utils/constants.js';

async function getGamePlays(gameId) {
  const q = query(
    collection(getDb(), COLLECTIONS.PLAYS),
    where('gameId', '==', gameId),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  const plays = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  plays.reverse();
  return plays;
}

function deduplicatePlays(plays) {
  const seen = new Map();
  const result = [];
  for (const play of plays) {
    if (play.userId === 'anonymous' || play.userId === undefined) {
      result.push(play);
    } else {
      seen.set(play.userId, play);
    }
  }
  for (const play of seen.values()) {
    result.push(play);
  }
  return result;
}

function countUniqueUsers(plays) {
  const users = new Set();
  for (const play of plays) {
    if (play.userId && play.userId !== 'anonymous') {
      users.add(play.userId);
    }
  }
  return users.size;
}

export async function getGameStats(gameId) {
  const [game, rawPlays] = await Promise.all([
    getGame(gameId),
    getGamePlays(gameId),
  ]);

  if (!game) return null;

  const allowDup = game.allowDuplicatePlays !== false;
  const plays = allowDup ? rawPlays : deduplicatePlays(rawPlays);
  const uniqueUsers = countUniqueUsers(rawPlays);
  const anonCount = rawPlays.filter((p) => !p.userId || p.userId === 'anonymous').length;
  const participantCount = allowDup ? plays.length : uniqueUsers + anonCount;

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
    allowDuplicatePlays: allowDup,
    rowStats,
  };
}
