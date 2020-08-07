# `NPM`

---

## 简介

`npm`有两层含义。

- npmjs.org
- 模块管理器

---

## 安装

> `npm`不需要单独安装。在安装Node的时候，会连带一起安装`npm`。



---

## `npm init`

`npm init`用来初始化生成一个新的`package.json`文件。它会向用户提问一系列问题，如果你觉得不用修改默认配置，一路回车就可以了。

如果使用了`-y`（代表yes），则跳过提问阶段，直接生成一个新的`package.json`文件。

```bash
$ npm init -y
```

---

## `npm install`

===

### 本地安装

>安装之前，`npm install`会先检查，`node_modules`目录之中是否已经存在指定模块。如果存在，就不再重新安装了，即使远程仓库已经有了一个新版本，也是如此。

Node模块采用`npm install`命令安装。

```bash
# 本地安装
$ npm install <package name>

# 全局安装
$ sudo npm install -global <package name>
$ sudo npm install -g <package name>
```

===

### 强制重新安装

如果你希望，一个模块不管是否安装过，npm 都要强制重新安装，可以使用`-f`或`--force`参数。

```bash
$ npm install <packageName> --force
```

如果你希望，所有模块都要强制重新安装，那就删除`node_modules`目录，重新执行`npm install`。

```bash
$ rm -rf node_modules
$ npm install
```

===

### 安装不同版本

install命令总是安装模块的最新版本，如果要安装模块的特定版本，可以在模块名后面加上@和版本号。

```bash
$ npm install sax@latest
$ npm install sax@0.1.1
$ npm install sax@">=0.1.0 <0.2.0"
```

===

### `install`不同参数

> install命令可以使用不同参数，指定所安装的模块属于哪一种性质的依赖关系，即出现在packages.json文件的哪一项中。

- –save：模块名将被添加到dependencies，可以简化为参数`-S`。
- –save-dev: 模块名将被添加到devDependencies，可以简化为参数`-D`。

```bash
$ npm install sax --save
$ npm install node-tap --save-dev
# 或者
$ npm install sax -S
$ npm install node-tap -D
```

---

## `npm update`

`npm update`命令可以更新本地安装的模块。

```bash
# 升级当前项目的指定模块
$ npm update [package name]

# 升级全局安装的模块
$ npm update -global [package name]
```

它会先到远程仓库查询最新版本，然后查询本地版本。如果本地版本不存在，或者远程版本较新，就会安装。

===

### 更新版本号

使用`-S`或`--save`参数，可以在安装的时候更新`package.json`里面模块的版本号。

```json
// 更新之前的package.json
dependencies: {
  dep1: "^1.1.1"
}

// 更新之后的package.json
dependencies: {
  dep1: "^1.2.2"
}
```

===

### 递归更新

> 注意，从npm v2.6.1 开始，`npm update`只更新顶层模块，而不更新依赖的依赖，以前版本是递归更新的。如果想取到老版本的效果，要使用下面的命令。

```bash
$ npm --depth 9999 update
```

---

## `npm uninstall`

`npm uninstall`命令，卸载已安装的模块。

```bash
$ npm uninstall [package name]

# 卸载全局模块
$ npm uninstall [package name] -global
```

---

## `npm run`

> `npm`不仅可以用于模块管理，还可以用于执行脚本。`package.json`文件有一个`scripts`字段，可以用于指定脚本命令，供`npm`直接调用。

```json
{
  "name": "myproject",
  "scripts": {
    "lint": "jshint **.js",
    "test": "mocha test/"
  }
}
```

---

## `npm info`

`npm info`命令可以查看每个模块的具体信息。比如，查看underscore模块的信息。

```bash
$ npm info underscore
```

上面命令返回一个JavaScript对象，包含了underscore模块的详细信息。这个对象的每个成员，都可以直接从info命令查询。

```bash
$ npm info underscore description
#JavaScript's functional programming helper library.

$ npm info underscore homepage
#http://underscorejs.org

$ npm info underscore version
#1.5.2
```

---

## `npm search`

`npm search`命令用于搜索npm仓库，它后面可以跟字符串，也可以跟正则表达式。

```bash
$ npm search <搜索词>
```

下面是一个例子。

```bash
$ npm search node-gyp
```