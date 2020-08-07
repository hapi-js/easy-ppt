const fs = require('fs').promises;
const path = require('path');
module.exports = async function mapDir(dir, result = []) {
  const stat = await fs.stat(dir);
  const isDir = stat.isDirectory();
  if (isDir) {
    const files = await fs.readdir(dir);
    for (let i = 0; i < files.length; i++) {
      await mapDir(path.join(dir, files[i]), result);
    }
  } else {
    result.push(dir);
  }
  return result;
};