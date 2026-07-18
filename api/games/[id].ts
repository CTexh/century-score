import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, ensureSchema } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureSchema();
  const id = req.query.id;

  if (req.method === 'DELETE') {
    await db().execute({ sql: 'DELETE FROM games WHERE id = ?', args: [String(id)] });
    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader('Allow', 'DELETE');
  res.status(405).json({ error: 'Method not allowed' });
}
