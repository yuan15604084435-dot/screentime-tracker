import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // 创建表（如果不存在）
    await sql`
      CREATE TABLE IF NOT EXISTS app_sessions (
        id SERIAL PRIMARY KEY,
        app TEXT NOT NULL,
        opened_at TIMESTAMP NOT NULL,
        closed_at TIMESTAMP,
        duration_seconds INTEGER,
        date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // 查询今天的使用统计
    const result = await sql`
      SELECT 
        app,
        COUNT(*) as times,
        SUM(duration_seconds) as total_seconds
      FROM app_sessions
      WHERE date = ${today} AND duration_seconds IS NOT NULL
      GROUP BY app
      ORDER BY total_seconds DESC
    `;
    
    return res.json({
      date: today,
      apps: result.rows,
      total_apps: result.rows.length
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: '查询失败', 
      details: error.message 
    });
  }
}
