import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const appName = req.query.app;
  
  if (!appName) {
    return res.status(400).json({ error: '缺少APP名称' });
  }
  
  const now = new Date();
  const timestamp = now.toISOString();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    // 读取今天的记录
    const blobPath = `records/${today}.json`;
    let todayRecords = [];
    
    try {
      const { blobs } = await list({ prefix: `records/${today}` });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url);
        todayRecords = await response.json();
      }
    } catch (error) {
      // 如果文件不存在，使用空数组
      todayRecords = [];
    }
    
    // 添加新记录
    todayRecords.push({
      app: appName,
      time: timestamp,
      action: 'toggle'
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
