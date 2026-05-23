import { list } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // 读取今天的记录
    const blobPath = `records/${today}`;
    
    const { blobs } = await list({ prefix: blobPath });
    
    if (blobs.length === 0) {
      return res.json({
        date: today,
        message: '今天还没有使用记录',
        records: []
      });
    }
    
    // 获取记录内容
    const response = await fetch(blobs[0].url);
    const records = await response.json();
    
    // 统计每个APP的使用情况
    const stats = {};
    
    records.forEach(record => {
      if (!stats[record.app]) {
        stats[record.app] = {
          times: 0,
          timestamps: []
        };
      }
      stats[record.app].times++;
      stats[record.app].timestamps.push(record.time);
    });
    
    return res.json({
      date: today,
      totalActions: records.length,
      apps: stats,
      rawRecords: records
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: '查询失败', 
      details: error.message 
    });
  }
}
