const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// 允许跨域请求
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 处理保存记录的请求
app.post('/saveRecord', (req, res) => {
    const record = req.body.record;
    const filePath = path.join('F:', '文档', '协作日记', '田忌赛马', '对局记录.txt');
    
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    // 写入文件
    fs.writeFile(filePath, record, 'utf8', (err) => {
        if (err) {
            console.error('保存记录失败:', err);
            res.status(500).json({ error: '保存记录失败' });
        } else {
            console.log('记录已保存到:', filePath);
            res.json({ success: true });
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 