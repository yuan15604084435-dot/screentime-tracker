export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const appName = req.query.app;
  
  if (!appName) {
    return res.status(400).json({ error: '缺少APP名称' });
  }
  
  const now = new Date().toISOString();
  
  // 简单版本：直接返回成功（暂时不存储数据）
  return res.json({
    message: `${appName} 记录成功`,
    time: now,
    app: appName
  });
}
