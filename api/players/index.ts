import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, ensureSchema } from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureSchema();

  if (req.method === 'GET') {
    const result = await db().execute('SELECT id, name FROM players ORDER BY name COLLATE NOCASE ASC');
    res.status(200).json(result.rows.map((r) => ({ id: String(r.id), name: String(r.name) })));
    return;
  }

  if (req.method === 'POST') {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const id = typeof req.body?.id === 'string' ? req.body.id : '';
    if (!name || !id) {
      res.status(400).json({ error: 'Invalid player payload' });
      return;
    }

    // Name is the unique key from the user's point of view — if it already exists
    // (case-insensitively), hand back the existing record instead of erroring.
    const existing = await db().execute({
      sql: 'SELECT id, name FROM players WHERE name = ? COLLATE NOCASE',
      args: [name],
    });
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      res.status(200).json({ id: String(row.id), name: String(row.name) });
      return;
    }

    await db().execute({ sql: 'INSERT INTO players (id, name) VALUES (?, ?)', args: [id, name] });
    res.status(201).json({ id, name });
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
}
