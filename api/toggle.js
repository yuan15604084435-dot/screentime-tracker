import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const appName = req.query.app;
  
  if (!appName) {
    return res.status(400).json({ error: '缺少APP名称' });
  }
  
  try {
    const now = new Date();
    const timestamp = now.toISOString();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // 检查是否有未关闭的 session
    const openSession = await sql`
      SELECT id, opened_at 
      FROM app_sessions 
      WHERE app = ${appName} AND closed_at IS NULL 
      ORDER BY opened_at DESC 
      LIMIT 1
    `;
    
    if (openSession.rows.length > 0) {
      // 有未关闭的 session，现在关闭它
      const session = openSession.rows[0];
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
        duration_seconds: durationSeconds,
        time: timestamp
      });
    } else {
      // 没有未关闭的 session，创建新的
      await sql`
        INSERT INTO app_sessions (app, opened_at, date)
        VALUES (${appName}, ${timestamp}, ${date})
      `;
      
      return res.json({
        message: `${appName} 已打开`,
        action: 'open',
        time: timestamp
      });
    }
    
  } catch (error) {
    return res.status(500).json({ 
      error: '操作失败', 
      details: error.message 
    });
  }
}
    });
    
    // 保存到 Blob Storage
    await put(blobPath, JSON.stringify(todayRecords), {
      access: 'public',
      addRandomSuffix: false
    });
    
    return res.json({
      message: `${appName} 记录成功`,
      time: timestamp,
      app: appName,
      totalRecords: todayRecords.length
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: '记录失败', 
      details: error.message 
    });
  }
}
