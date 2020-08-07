# `Promise`

---

## 嵌套地狱

```javascript
function f1() {// 第1步
  setTimeout(function () {
    btn.style.color = 'red';
  }, 1000);
}
function f2() {// 第2步
  setTimeout(function () {
    btn.style.border = '2px solid green';
  }, 500);
}
function f3() {// 第3步
  setTimeout(function () {
    btn.style.background = 'yellow';
  }, 1500);
}
```

===

### 按照步骤先后执行

```javascript
(function f1() {// 第1步
  setTimeout(function () {
    btn.style.color = 'red';
    (function f2() {// 第2步
      setTimeout(function () {
        btn.style.border = '2px solid green';
        (function f3() {// 第3步
          setTimeout(function () {
            btn.style.background = 'yellow';
          }, 1500);
        })()
      }, 500);
    })()
  }, 1000);
})()
```

---

## `Promise` 对象的构造器

Promise 对象的构造器（constructor）语法如下：

```javascript
let promise = new Promise(function(resolve, reject) {
  // executor
});
```

传递给 `new Promise` 的函数被称为 **executor**。当 `new Promise` 被创建，executor 会自动运行。

它的参数 `resolve` 和 `reject` 是由 JavaScript 自身提供的回调。我们的代码仅在 executor 的内部。

当 executor 获得了结果，无论是早还是晚都没关系，它应该调用以下回调之一：

- `resolve(value)` — 如果任务成功完成并带有结果 `value`。
- `reject(error)` — 如果出现了 error，`error` 即为 error 对象。

===

### 回调函数

参数 `resolve` 和 `reject` 是由 JavaScript 自身提供的回调。我们的代码仅在 executor 的内部。

当 executor 获得了结果，无论是早还是晚都没关系，它应该调用以下回调之一：

- `resolve(value)` — 如果任务成功完成并带有结果 `value`。
- `reject(error)` — 如果出现了 error，`error` 即为 error 对象。

executor 会自动运行并尝试执行一项工作。尝试结束后，如果成功则调用 `resolve`，如果出现 error 则调用 `reject`。

===

### 内部属性和状态转换

由 `new Promise` 构造器返回的 `promise` 对象具有以下内部属性：

- `state` — 最初是 `"pending"` 待定，然后在 `resolve` 被调用时变为 `"fulfilled"`完成，或者在 `reject` 被调用时变为 `"rejected"`拒绝。
- `result` — 最初是 `undefined`，然后在 `resolve(value)` 被调用时变为 `value`，或者在 `reject(error)` 被调用时变为 `error`。
- 一个 resolved 或 rejected 的 promise 都会被称为 “settled”。

===

### 只能有一个结果或一个` error`

> executor 只能调用一个 `resolve` 或一个 `reject`。任何状态的更改都是最终的。

所有其他的再对 `resolve` 和 `reject` 的调用都会被忽略：

```javascript
let promise = new Promise(function(resolve, reject) {
  resolve("done");
  reject(new Error("…")); // 被忽略
  setTimeout(() => resolve("…")); // 被忽略
});
```

`resolve/reject` 只需要一个参数（或不包含任何参数），并且将忽略额外的参数。

===

### 以 `Error` 对象 `reject`

如果什么东西出了问题， executor 应该调用 `reject`。这可以使用任何类型的参数来完成（就像 `resolve` 一样）。但是建议使用 `Error` 对象（或继承自 `Error` 的对象）。

===

### `Resolve/reject` 可以立即进行

实际上，executor 通常是异步执行某些操作，并在一段时间后调用 `resolve/reject`，但这不是必须的。我们还可以立即调用 `resolve` 或 `reject`，就像这样：

```javascript
let promise = new Promise(function(resolve, reject) {
  // 不花时间去做这项工作
  resolve(123); // 立即给出结果：123
});
```

例如，当我们开始做一个任务时，但随后看到一切都已经完成并已被缓存时，可能就会发生这种情况。

这挺好。我们立即就有了一个 resolved 的 promise。

===

### `state` 和 `result` 都是内部的

Promise 对象的 `state` 和 `result` 属性都是内部的。我们无法直接访问它们。但我们可以对它们使用 `.then`/`.catch`/`.finally` 方法。

---

## 消费函数 `then，catch，finally`

Promise 对象充当的是 executor（“生产者代码”）和消费函数之间的连接，后者将接收结果或 error。可以通过使用 `.then`、`.catch` 和 `.finally` 方法为消费函数进行注册。

===

### `then`

最重要最基础的一个就是 `.then`。

语法如下：

```javascript
promise.then(
  function(result) { /* handle a successful result */ },
);
```

`.then` 的参数是一个函数，该函数将在 promise resolved 后运行并接收结果。

以下是对成功 resolved 的 promise 做出的反应：

```javascript
let promise = new Promise(function(resolve, reject) {
  setTimeout(() => resolve("done!"), 1000);
});
// resolve 运行 .then 中的函数
promise.then(
  result => log(result), // 1 秒后显示 "done!"
);
```

===

### 函数参数

我们可以只为 `.then` 提供一个函数参数：

```javascript
let promise = new Promise(resolve => {
  setTimeout(() => resolve("done!"), 1000);
});
promise.then(log); // 1 秒后显示 "done!"
```

===

### `catch`

在 reject 的情况下，可以使用 `.catch(errorHandlingFunction)`，并为 `.then` 提供一个函数参数

```javascript
let promise = new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error("Whoops!")), 1000);
});

// .catch(f) 
promise.catch(alert); // 1 秒后显示 "Error: Whoops!"
```

===

### `finally`

`.finally(f)` 调用与 `.then(f)` 类似，`f` 总是在 promise 被 settled 时运行：即 promise 被 resolve 或 reject。

```javascript
new Promise((resolve, reject) => {
  /* 做一些需要时间的事儿，然后调用 resolve/reject */
})
  // 在 promise 被 settled 时运行，无论成功与否
  .finally(() => stop loading indicator)
  .then(result => show result, err => show error)
```

区别：

1. `finally` 处理程序（handler）没有参数。在 `finally` 中，我们不知道 promise 是否成功。
2. `finally` 处理程序将结果和 error 传递给下一个处理程序。

---

## `Promise`链

异步任务要一个接一个地执行 Promise 提供了一些方案来做到这一点。

```javascript
new Promise(function(resolve, reject) {

  setTimeout(() => resolve(1), 1000); // (*)

}).then(function(result) { // (**)
  log(result); // 1
  return result * 2;
}).then(function(result) { // (***)
  log(result); // 2
  return result * 2;
})
```

===

### 流程

result 通过 `.then` 处理程序（handler）链进行传递。运行流程如下：

1. 初始 promise 在 1 秒后进行 resolve `(*)`，
2. 然后 `.then` 处理程序（handler）被调用 `(**)`。
3. 它返回的值被传入下一个 `.then` 处理程序（handler）`(***)`
4. ……依此类推。

随着 result 在处理程序（handler）链中传递，我们可以看到一系列的 `alert` 调用：

```shell
1 → 2 → 4
```

之所以这么运行，是因为对 `promise.then` 的调用会返回了一个 promise，所以我们可以在其之上调用下一个 `.then`。

当处理程序（handler）返回一个值时，它将成为该 promise 的 result，所以将使用它调用下一个 `.then`。

===

### 新手常犯的一个经典错误

从技术上讲，我们也可以将多个 .then 添加到一个 promise 上。但这并不是 promise 链（chaining）。

```javascript
let promise = new Promise(function(resolve, reject) {
  setTimeout(() => resolve(1), 1000);
});
promise.then(function(result) {
  log(result); // 1
  return result * 2;
});
promise.then(function(result) {
  log(result); // 1
  return result * 2;
});
```

这里只是一个 promise 的几个处理程序（handler）。不会相互传递 result；相反，彼此独立运行处理任务。代码中，所有 `log` 都显示相同的内容：`1`。实际上我们极少遇到一个 promise 需要多处理程序（handler）的情况。使用链式调用的频率更高。

===

### 返回 `promise`

`.then(handler)` 中所使用的处理程序（handler）可以创建并返回一个 promise。在这种情况下，其他的处理程序（handler）将等待它 settled 后再获得其结果（result）。

```javascript
new Promise(function(resolve, reject) {
  setTimeout(() => resolve(1), 1000);
}).then(function(result) {
  log(result); // 1
  return new Promise((resolve, reject) => { // (*)
    setTimeout(() => resolve(result * 2), 1000);
  });
}).then(function(result) { // (**)
  log(result); // 2
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(result * 2), 1000);
  });
}).then(function(result) {
  log(result); // 4
});
```

所以输出与前面的示例相同：1 → 2 → 4，但是现在在每次 `alert` 调用之间会有 1 秒钟的延迟。返回 promise 使我们能够构建异步行为链。

===

### 总结

如果 `.then`（或 `catch/finally` 都可以）处理程序（handler）返回一个 promise，那么链的其余部分将会等待，直到它状态变为 settled。当它被 settled 后，其 result（或 error）将被进一步传递下去。

---

## `Promise.all`

假设我们希望并行执行多个 promise，并等待所有 promise 都准备就绪。例如，并行下载几个 URL，并等到所有内容都下载完毕后再对它们进行处理。这就是 `Promise.all` 的用途。

语法：

```javascript
let promise = Promise.all([...promises...]);
```

例子

```javascript
Promise.all([
  new Promise(resolve => setTimeout(() => resolve(1), 3000)), // 1
  new Promise(resolve => setTimeout(() => resolve(2), 2000)), // 2
  new Promise(resolve => setTimeout(() => resolve(3), 1000))  // 3
]).then(log); 
```

===

### 说明

- 当所有给定的 promise 都被 settled 时，新的 promise 才会 resolve，并且其结果数组将成为新的 promise 的结果。
- 如果任意一个 promise 被 reject，由 Promise.all 返回的 promise 就会立即 reject，并且带有的就是这个 error。

```javascript
Promise.all([
  new Promise((resolve, reject) => setTimeout(() => resolve(1), 1000)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error("Whoops!")), 2000)),
  new Promise((resolve, reject) => setTimeout(() => resolve(3), 3000))
]).catch(alert); // Error: Whoops!
```

---

## `Promise.allSettled`

我们想要获取（fetch）多个用户的信息。即使其中一个请求失败，我们仍然对其他的感兴趣。

让我们使用 `Promise.allSettled`：

```javascript
Promise.allSettled([
  new Promise((resolve, reject) => setTimeout(() => resolve(1), 1000)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error("Whoops!")), 2000)),
  new Promise((resolve, reject) => setTimeout(() => resolve(3), 3000))
]).catch(alert); 

```

---

## `Promise.race`

与 `Promise.all` 类似，但只等待第一个 settled 的 promise 并获取其结果（或 error）。

语法：

```javascript
let promise = Promise.race(iterable);
```

例如，这里的结果将是 `1`：

```javascript
Promise.race([
  new Promise((resolve, reject) => setTimeout(() => resolve(1), 1000)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error("Whoops!")), 2000)),
  new Promise((resolve, reject) => setTimeout(() => resolve(3), 3000))
]).then(alert); // 1
```

这里第一个 promise 最快，所以它变成了结果。第一个 settled 的 promise “赢得了比赛”之后，所有进一步的 result/error 都会被忽略。