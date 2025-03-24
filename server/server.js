const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/media', express.static(path.join(__dirname, 'data/media')));

// 确保数据文件和媒体目录存在
const dataFile = path.join(__dirname, 'data/data.json');
const mediaDir = path.join(__dirname, 'data/media');

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([]));
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// 获取所有数据
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 添加新数据
app.post('/api/data', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), (req, res) => {
  try {
    const { title, text, id } = req.body;
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    const newItem = {
      id: id || Date.now().toString(),
      title,
      text,
      timestamp: Date.now()
    };
    
    // 处理上传的文件
    if (req.files) {
      if (req.files.image) {
        newItem.image = `/media/${req.files.image[0].filename}`;
      }
      
      if (req.files.audio) {
        newItem.audio = `/media/${req.files.audio[0].filename}`;
      }
    }
    
    data.push(newItem);
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('保存数据失败:', error);
    res.status(500).json({ error: '保存数据失败' });
  }
});

// 搜索数据
app.get('/api/search', (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 