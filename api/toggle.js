import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const appName = req.query.app;
  
  if (!appName) {
    return res.status(400).json({ error: '缺少APP名称' });
  }
  
  try {
    // 先确保表存在
    await sql`
      CREATE TABLE IF NOT EXISTS app_sessions (
        id SERIAL PRIMARY KEY,
        app TEXT NOT NULL,
        opened_at TIMESTAMPTZ NOT NULL,
        closed_at TIMESTAMPTZ,
        duration_seconds INTEGER,
        date TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const now = new Date();
    const timestamp = now.toISOString();
    const date = now.toISOString().split('T')[0];
    
    // 查找未关闭的session
    const result = await sql`
      SELECT id, opened_at 
      FROM app_sessions 
      WHERE app = ${appName} AND closed_at IS NULL 
      ORDER BY opened_at DESC 
      LIMIT 1
    `;
    
    if (result.rows.length > 0) {
      // 关闭session
      const session = result.rows[0];
      const openedAt = new Date(session.opened_at);
      const durationSeconds = Math.floor((now - openedAt) / 1000);
      
      await sql`
        UPDATE app_sessions 
        SET closed_at = ${timestamp}, duration_seconds = ${durationSeconds}
        WHERE id = ${session.id}
      `;
      
      return res.json({
        message: `${appName} 已关闭`,
        action: 'close',
        duration_seconds: durationSeconds
      });
    } else {
      // 创建新session
      await sql`
        INSERT INTO app_sessions (app, opened_at, date)
        VALUES (${appName}, ${timestamp}, ${date})
      `;
      
      return res.json({
        message: `${appName} 已打开`,
        action: 'open'
      });
    }
    
  } catch (error) {
    return res.status(500).json({ 
      error: '操作失败', 
      details: error.message 
    });
  }
}
