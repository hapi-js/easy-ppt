const express = require('express');
const mime = require('mime');
const path = require('path');
const fs = require('fs').promises;
const app = express();
// const mapDir = require('./utill/mapDir.js');
// const dir = await mapDir('./ppt');
app.use(express.static(`${__dirname}/www`));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));
// 首页
app.get('/index', async (req, res) => {
  const dir = await fs.readdir('./md');
  if (dir.indexOf('.DS_Store') !== -1) {
    dir.splice(dir.indexOf('.DS_Store'), 1);
  }
  for (let i = 0; i < dir.length; i++) {
    const coverPath = path.join('md', dir[i], 'cover.png');
    const isCover = await fs.stat(coverPath).catch(() => { });
    const mimeType = mime.getType(coverPath);
    const item = {};
    if (isCover) {
      const coverBuffer = await fs.readFile(coverPath);
      item.cover = `data:${mimeType};base64,${coverBuffer.toString('base64')}`
    }
    item.fileName = dir[i];
    dir[i] = item;
  }
  res.render('index', {
    dir,
  });
});
//课程目录
app.get('/index/:index_sub', async (req, res) => {
  const { index_sub } = req.params;
  const coverPath = path.join('md', index_sub, 'cover.png');
  const isCover = await fs.stat(coverPath).catch(() => { });
  let cover = '';
  if (isCover) {
    const coverBuffer = await fs.readFile(coverPath);
    const mimeType = mime.getType(coverPath);
    cover = `data:${mimeType};base64,${coverBuffer.toString('base64')}`
  }
  const dir = await fs.readdir(`./md/${index_sub}`).catch(() => {
    res.sendStatus(404);
  });

  if (dir.indexOf('.DS_Store') !== -1) {
    dir.splice(dir.indexOf('.DS_Store'), 1);
  }
  if (dir.indexOf('cover.png') !== -1) {
    dir.splice(dir.indexOf('cover.png'), 1);
  }

  dir.sort((a, b) => {
    const num1 = +a.split('.')[0];
    const num2 = +b.split('.')[0];
    return num1 - num2;
  });

  res.render('index_sub', {
    dir, cover,
    title: index_sub
  });
});

app.get('/index/:sub/:file', async (req, res) => {
  const { sub, file } = req.params;
  res.render('md', {
    sub, file
  });
});

app.get('/md/:sub/:file', async (req, res) => {
  const { sub, file } = req.params;
  res.sendFile(path.resolve(__dirname, 'md', sub, file));
});

app.listen(3000, () => {
  console.log(`Server started on port 3000`);
});



