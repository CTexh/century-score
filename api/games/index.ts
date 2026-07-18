import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, ensureSchema } from '../_lib/db.js';
import { rowToGame } from '../_lib/serialize.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureSchema();

  if (req.method === 'GET') {
    const result = await db().execute('SELECT * FROM games ORDER BY end_timestamp DESC');
    res.status(200).json(result.rows.map(rowToGame));
    return;
  }

  if (req.method === 'POST') {
    const game = req.body;
    if (!game?.id || !Array.isArray(game.players) || !Array.isArray(game.ranking)) {
      res.status(400).json({ error: 'Invalid game payload' });
      return;
    }
    await db().execute({
      sql: `INSERT INTO games (
        id, date, start_timestamp, end_timestamp, actual_duration_seconds, billable_minutes,
        target_score, price_per_minute, total_cost, winner, players, score_events, ranking, tie_groups
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        date=excluded.date, start_timestamp=excluded.start_timestamp, end_timestamp=excluded.end_timestamp,
        actual_duration_seconds=excluded.actual_duration_seconds, billable_minutes=excluded.billable_minutes,
        target_score=excluded.target_score, price_per_minute=excluded.price_per_minute, total_cost=excluded.total_cost,
        winner=excluded.winner, players=excluded.players, score_events=excluded.score_events,
        ranking=excluded.ranking, tie_groups=excluded.tie_groups`,
      args: [
        game.id,
        game.date,
        game.startTimestamp,
        game.endTimestamp,
        game.actualDurationSeconds,
        game.billableMinutes,
        game.targetScore,
        game.pricePerMinute,
        game.totalCost,
        game.winner,
        JSON.stringify(game.players),
        JSON.stringify(game.scoreEvents ?? []),
        JSON.stringify(game.ranking),
        JSON.stringify(game.tieGroups ?? []),
      ],
    });
    res.status(201).json({ ok: true });
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
}
