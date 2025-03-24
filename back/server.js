const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const jwt = require('jsonwebtoken'); // 需要安装: npm install jsonwebtoken

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key'; // 在生产环境中应使用环境变量

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/media', express.static(path.join(__dirname, 'data/media')));

// 用户数据文件路径
const usersFile = path.join(__dirname, 'data/users.json');
const dataDir = path.join(__dirname, 'data');
const mediaDir = path.join(__dirname, 'data/media');

// 确保目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// 初始化用户数据
if (!fs.existsSync(usersFile)) {
  const initialUsers = [];
  fs.writeFileSync(usersFile, JSON.stringify(initialUsers, null, 2));
  console.log('创建了新的用户数据文件');
} else {
  console.log('用户数据文件已存在');
  // 尝试读取文件内容，检查是否可读
  try {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    console.log(`当前有 ${users.length} 个用户`);
  } catch (error) {
    console.error('读取用户数据文件失败:', error);
    // 如果文件损坏，重新创建
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
    console.log('重新创建了用户数据文件');
  }
}

// 获取用户列表
const getUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  } catch (error) {
    console.error('读取用户数据失败:', error);
    return [];
  }
};

// 保存用户列表
const saveUsers = (users) => {
  try {
    console.log(`正在保存 ${users.length} 个用户到文件`);
    const data = JSON.stringify(users, null, 2);
    fs.writeFileSync(usersFile, data);
    console.log('用户数据保存成功');
    
    // 验证数据是否正确写入
    const savedData = fs.readFileSync(usersFile, 'utf8');
    const savedUsers = JSON.parse(savedData);
    if (savedUsers.length === users.length) {
      console.log('验证成功: 用户数据已正确保存');
      return true;
    } else {
      console.error('验证失败: 保存的用户数量不匹配');
      return false;
    }
  } catch (error) {
    console.error('保存用户数据失败:', error);
    return false;
  }
};

// 确保用户数据文件存在
const ensureUserDataFile = (username) => {
  const userDataFile = path.join(dataDir, `${username}.json`);
  console.log('确保用户数据文件存在:', userDataFile);
  
  if (!fs.existsSync(userDataFile)) {
    console.log('创建新的用户数据文件:', userDataFile);
    fs.writeFileSync(userDataFile, JSON.stringify([]));
  } else {
    console.log('用户数据文件已存在:', userDataFile);
    // 验证文件是否可读
    try {
      const data = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
      console.log(`文件包含 ${data.length} 条数据`);
    } catch (error) {
      console.error('读取用户数据文件失败，重新创建:', error);
      fs.writeFileSync(userDataFile, JSON.stringify([]));
    }
  }
  
  // 检查文件权限
  try {
    fs.accessSync(userDataFile, fs.constants.R_OK | fs.constants.W_OK);
    console.log('文件权限正常，可读可写');
  } catch (error) {
    console.error('文件权限问题:', error);
  }
  
  return userDataFile;
};

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// 验证JWT中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: '未授权' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: '令牌无效' });
    req.user = user;
    next();
  });
};

// 注册接口
app.post('/api/register', (req, res) => {
  const { username, password, displayName } = req.body;
  
  if (!username || !password || !displayName) {
    return res.status(400).json({ error: '所有字段都是必填的' });
  }
  
  console.log(`收到注册请求: ${username}, ${displayName}`);
  
  let users = [];
  try {
    users = getUsers();
    console.log(`当前有 ${users.length} 个用户`);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }
  
  // 检查用户名是否已存在
  if (users.some(u => u.username === username)) {
    console.log(`用户名 ${username} 已存在`);
    return res.status(409).json({ error: '用户名已存在' });
  }
  
  // 创建新用户
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username,
    password, // 在实际应用中应该对密码进行哈希处理
    displayName,
    createdAt: Date.now()
  };
  
  console.log(`创建新用户: ID=${newUser.id}, 用户名=${newUser.username}`);
  
  users.push(newUser);
  
  if (saveUsers(users)) {
    console.log(`用户 ${username} 注册成功`);
    
    // 创建用户数据文件
    const userDataFile = ensureUserDataFile(username);
    console.log(`为用户 ${username} 创建数据文件: ${userDataFile}`);
    
    // 创建JWT令牌 - 30天有效期
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName
      }
    });
  } else {
    console.error(`保存用户 ${username} 失败`);
    res.status(500).json({ error: '注册失败，请稍后再试' });
  }
});

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  
  // 确保用户数据文件存在
  ensureUserDataFile(username);
  
  // 创建JWT令牌 - 30天有效期
  const token = jwt.sign(
    { id: user.id, username: user.username }, 
    JWT_SECRET, 
    { expiresIn: '30d' }
  );
  
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName
    }
  });
});

// 获取当前用户信息
app.get('/api/me', authenticateToken, (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.username === req.user.username);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName
  });
});

// 获取用户数据
app.get('/api/data', authenticateToken, (req, res) => {
  try {
    const userDataFile = ensureUserDataFile(req.user.username);
    const data = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('获取数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 添加新数据
app.post('/api/data', authenticateToken, upload.fields([
  { name: 'image', maxCount: 5 },
  { name: 'audio', maxCount: 5 }
]), (req, res) => {
  try {
    const { 
      title, 
      text, 
      id, 
      tags, 
      location,
      transcript 
    } = req.body;
    
    console.log('收到新数据请求:', { title, id });
    console.log('标签数据:', tags);
    console.log('用户信息:', req.user);
    
    const userDataFile = ensureUserDataFile(req.user.username);
    console.log('用户数据文件路径:', userDataFile);
    
    // 读取现有数据
    let data = [];
    try {
      data = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
      console.log(`读取到 ${data.length} 条现有数据`);
    } catch (error) {
      console.error('读取用户数据文件失败，创建新文件:', error);
      data = [];
    }
    
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
        console.log('解析后的标签:', parsedTags);
      } catch (e) {
        console.error('解析标签失败:', e);
      }
    }
    
    const newItem = {
      id: id || Date.now().toString(),
      title,
      text,
      tags: parsedTags,
      timestamp: Date.now(),
      lastModified: Date.now(),
      user: req.user.username,
      location: location ? JSON.parse(location) : null,
      media: []
    };
    
    // 处理上传的文件
    if (req.files) {
      // 处理图片
      if (req.files.image) {
        req.files.image.forEach(file => {
          newItem.media.push({
            type: 'image',
            url: `/media/${file.filename}`,
            caption: ''
          });
        });
      }
      
      // 处理音频
      if (req.files.audio) {
        req.files.audio.forEach((file, index) => {
          const transcriptText = Array.isArray(transcript) 
            ? transcript[index] 
            : transcript;
            
          newItem.media.push({
            type: 'audio',
            url: `/media/${file.filename}`,
            duration: 0, // 客户端应该提供这个值
            transcript: transcriptText || ''
          });
        });
      }
    }
    
    // 添加新数据
    data.push(newItem);
    
    // 写入文件
    const dataStr = JSON.stringify(data, null, 2);
    console.log('准备写入文件:', userDataFile);
    console.log('数据长度:', dataStr.length, '字节');
    
    fs.writeFileSync(userDataFile, dataStr);
    
    // 验证文件是否存在
    if (fs.existsSync(userDataFile)) {
      const stats = fs.statSync(userDataFile);
      console.log('文件已写入, 大小:', stats.size, '字节');
      
      // 读取文件内容进行验证
      const verifyData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
      console.log('验证: 文件中有 ' + verifyData.length + ' 条数据');
      console.log('最新数据:', verifyData[verifyData.length - 1].title);
    } else {
      console.error('文件写入后不存在!');
    }
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('保存数据失败:', error);
    res.status(500).json({ error: '保存数据失败' });
  }
});

// 搜索数据
app.get('/api/search', authenticateToken, (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    const userDataFile = ensureUserDataFile(req.user.username);
    const data = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
    
    if (!query) {
      return res.json(data);
    }
    
    const results = data.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.text.toLowerCase().includes(query)
    );
    
    res.json(results);
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

// 获取用户标签统计
app.get('/api/tags/stats', authenticateToken, (req, res) => {
  try {
    console.log('收到标签统计请求:', req.user.username);
    const userDataFile = ensureUserDataFile(req.user.username);
    console.log('用户数据文件路径:', userDataFile);
    
    const data = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
    console.log('用户数据条目数量:', data.length);
    
    // 计算标签使用频率
    const tagStats = {};
    let tagCount = 0;
    
    data.forEach((item, index) => {
      console.log(`检查数据项 #${index}:`, item.title);
      if (item.tags && Array.isArray(item.tags)) {
        console.log(`  数据项 #${index} 包含 ${item.tags.length} 个标签:`, item.tags);
        item.tags.forEach(tag => {
          tagStats[tag] = (tagStats[tag] || 0) + 1;
          tagCount++;
        });
      } else {
        console.log(`  数据项 #${index} 没有标签`);
      }
    });
    
    console.log(`共找到 ${tagCount} 个标签实例，${Object.keys(tagStats).length} 个不同标签`);
    console.log('返回标签统计:', tagStats);
    res.json(tagStats);
  } catch (error) {
    console.error('获取标签统计失败:', error);
    res.status(500).json({ error: '获取标签统计失败' });
  }
});

// 添加一个新的API端点，用于查看文件内容
app.get('/api/debug/file/:username', (req, res) => {
  try {
    const username = req.params.username;
    const filePath = path.join(dataDir, `${username}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileStats = fs.statSync(filePath);
    
    res.json({
      filename: `${username}.json`,
      path: filePath,
      size: fileStats.size,
      content: fileContent
    });
  } catch (error) {
    console.error('读取文件失败:', error);
    res.status(500).json({ error: '读取文件失败' });
  }
});

// 在服务器启动时检查文件系统权限
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  
  // 检查数据目录权限
  try {
    const testFile = path.join(dataDir, 'test-write.txt');
    fs.writeFileSync(testFile, 'test');
    console.log('数据目录可写');
    fs.unlinkSync(testFile);
  } catch (error) {
    console.error('数据目录权限问题:', error);
  }
  
  console.log('可用API端点:');
  console.log('- POST /api/register - 注册新用户');
  console.log('- POST /api/login - 用户登录');
  console.log('- GET /api/data - 获取用户数据');
  console.log('- POST /api/data - 添加新数据');
  console.log('- GET /api/search - 搜索数据');
  console.log('- GET /api/tags/stats - 获取标签统计');
  console.log('- GET /api/debug/file/:username - 查看文件内容');
}); 