# `Proxy` 和 `Reflect`

---

## `Proxy`

语法：

```javascript
let proxy = new Proxy(target, handler)
```

- `target` — 是要包装的对象，可以是任何东西，包括函数。
- `handler` — 代理配置：带有“陷阱”（“traps”，即拦截操作的方法）的对象。比如 `get` 陷阱用于读取 `target` 的属性，`set` 陷阱用于写入 `target` 的属性，等等。

对 `proxy` 进行操作，如果在 `handler` 中存在相应的陷阱，则它将运行，并且 Proxy 有机会对其进行处理，否则将直接对 target 进行处理。

---

## 没有任何陷阱的代理

创建一个没有任何陷阱的代理，`proxy` 是一个 `target` 的透明包装器。没有自己的属性。如果 `handler` 为空，则透明地将操作转发给 `target`。

```javascript
let target = {};
// 空的 handler 对象
let proxy = new Proxy(target, {});
// 写入 proxy 对象 (1)
proxy.test = 5;
// 5，test 属性出现在了 target 中！
console.log(target.test);
// 5，我们也可以从 proxy 对象读取它 (2)
console.log(proxy.test);
// test，迭代也正常工作 (3)
for(let key in proxy) console.log(key);
```
1. 写入操作 `proxy.test=` 会将值写入 `target`。
2. 读取操作 `proxy.test` 会从 `target` 返回对应的值。
3. 迭代 `proxy` 会从 `target` 返回对应的值。

===

## 内部方法

“内部方法”描述了最底层的工作方式。例如 `[[Get]]`，用于读取属性的内部方法，`[[Set]]`，用于写入属性的内部方法，等等。这些方法不能直接通过方法名调用。

Proxy 陷阱会拦截这些方法的调用。

对于每个内部方法，有一个陷阱：可用于添加到 `new Proxy` 的 `handler` 参数中以拦截操作的方法名称。

===

### 表`1`

| 内部方法          | Handler 方法     | 何时触发        |
| :---------------- | :--------------- | :-------------- |
| `[[Get]]`         | `get`            | 读取属性        |
| `[[Set]]`         | `set`            | 写入属性        |
| `[[HasProperty]]` | `has`            | `in` 操作符     |
| `[[Delete]]`      | `deleteProperty` | `delete` 操作符 |
| `[[Call]]`        | `apply`          | 函数调用        |
| `[[Construct]]`   | `construct`      | `new` 操作符    |

===

### 表`2`

| 内部方法                | Handler 方法               | 何时触发                                                                                                                                                                                                                                                                                                                          |
| :---------------------- | :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[[GetPrototypeOf]]`    | `getPrototypeOf`           | [Object.getPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf)                                                                                                                                                                                                   |
| `[[SetPrototypeOf]]`    | `setPrototypeOf`           | [Object.setPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)                                                                                                                                                                                                   |
| `[[IsExtensible]]`      | `isExtensible`             | [Object.isExtensible](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible)                                                                                                                                                                                                       |
| `[[PreventExtensions]]` | `preventExtensions`        | [Object.preventExtensions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)                                                                                                                                                                                             |
| `[[DefineOwnProperty]]` | `defineProperty`           | [Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty), [Object.defineProperties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties)                                                              |
| `[[GetOwnProperty]]`    | `getOwnPropertyDescriptor` | [Object.getOwnPropertyDescriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor), `for..in`, `Object.keys/values/entries`                                                                                                                                      |
| `[[OwnPropertyKeys]]`   | `ownKeys`                  | [Object.getOwnPropertyNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames), [Object.getOwnPropertySymbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols), `for..in`, `Object/keys/values/entries` |

---

## 不变量

JavaScript 强制执行某些不变量 — 内部方法和陷阱必须满足的条件。其中大多数用于返回值：

- `[[Set]]` 如果值已成功写入，则必须返回 `true`，否则返回 `false`。
- `[[Delete]]` 如果已成功删除该值，则必须返回 `true`，否则返回 `false`。

- 应用于代理（proxy）对象的 `[[GetPrototypeOf]]`，必须返回与应用于被代理对象的 `[[GetPrototypeOf]]` 相同的值。换句话说，读取代理对象的原型必须始终返回被代理对象的原型。
- ......等等

陷阱可以拦截这些操作，但是必须遵循下面这些规则。不变量确保语言功能的正确和一致的行为。

---

## 使用 `get` 陷阱设置默认值

最常见的陷阱是用于读取/写入的属性。要拦截读取操作，`handler` 应该有 `get(target, property, receiver)` 方法。读取属性时触发该方法，参数如下：

- `target` — 是目标对象，该对象被作为第一个参数传递给 `new Proxy`，
- `property` — 目标属性名，
- `receiver` — 如果目标属性是一个 getter 访问器属性，则 `receiver` 就是本次读取属性所在的 `this` 对象。通常，这就是 `proxy` 对象本身（或者，如果我们从 proxy 继承，则是从该 proxy 继承的对象）。

===

### 对象的默认值

用 `get` 来实现一个对象的默认值。创建一个对不存在的数组项返回 `0` 的数组。

通常，当人们尝试获取不存在的数组项时，他们会得到 `undefined`，但是我们在这将常规数组包装到代理（proxy）中，以捕获读取操作，并在没有要读取的属性的时返回 `0`：

```javascript
let numbers = [0, 1, 2];
numbers = new Proxy(numbers, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    } else {
      return 0; // 默认值
    }
  }
});
console.log( numbers[1] ); // 1
console.log( numbers[123] ); // 0（没有这个数组项）
```

===

### 词典翻译

想象一下，我们有一本词典，上面有短语及其翻译：

```javascript
let dictionary = { 'Hello': 'Hola', 'Bye': 'Adiós'};
```

如果没有我们要读取的短语，那么从 `dictionary` 读取它将返回 `undefined`。代理 `dictionary` 拦截读取操作。

```javascript
dictionary = new Proxy(dictionary, {
  get(target, phrase) { // 拦截读取属性操作
    if (phrase in target) { //如果词典中有该短语
      return target[phrase]; // 返回其翻译
    } else {
      return phrase;// 否则返回未翻译的短语
    }
  }
});
console.log( dictionary['Hello'] ); // Hola
// Welcome to Proxy（没有被翻译）
console.log( dictionary['Welcome to Proxy']); 
```

===

### 覆盖变量

代理如何覆盖变量：

```javascript
dictionary = new Proxy(dictionary, ...);
```

代理应该在所有地方都完全替代目标对象。目标对象被代理后，任何人都不应该再引用目标对象。

---

## 使用 `set` 陷阱进行验证

假设我们想要一个专门用于数字的数组。如果添加了其他类型的值，则应该抛出一个错误。当写入属性时 `set` 陷阱被触发。

```javascript
set(target, property, value, receiver)
```

- `target` — 是目标对象，该对象被作为第一个参数传递给 `new Proxy`，
- `property` — 目标属性名称，
- `value` — 目标属性的值，
- `receiver` — 与 `get` 陷阱类似，仅与 setter 访问器属性相关。

===

### 验证新值

如果写入操作（setting）成功，`set` 陷阱应该返回 `true`，否则返回 `false`（触发 `TypeError`）。

```javascript
let numbers = [];
numbers = new Proxy(numbers, { // (*)
  set(target, prop, val) { // 拦截写入属性操作
    if (typeof val == 'number') {
      target[prop] = val;
      return true;
    } else {
      return false;
    }
  }
});
numbers.push(1); // 添加成功
numbers.push("test"); // TypeError（proxy 的 'set' 返回 false）
```

===

### 内建方法依然有效

数组的内建方法依然有效！值被使用 `push` 方法添加到数组。当值被添加到数组后，数组的 `length` 属性会自动增加。我们的代理对象 proxy 不会破坏任何东西。

不必重写诸如 `push` 和 `unshift` 等添加元素的数组方法，就可以在其中添加检查，因为在内部它们使用代理所拦截的 `[[Set]]` 操作。

对于 `set` 操作，它必须在成功写入时返回 `true`，要保持“不变量”。

如果我们忘记这样做，或返回任何假（falsy）值，则该操作将触发 `TypeError`。

===

## 迭代

`Object.keys`，`for..in` 循环和大多数其他遍历对象属性的方法都使用内部方法 `[[OwnPropertyKeys]]`（由 `ownKeys` 陷阱拦截) 来获取属性列表。

这些方法在细节上有所不同：

- `Object.getOwnPropertyNames(obj)` 返回非 Symbol 键。
- `Object.getOwnPropertySymbols(obj)` 返回 symbol 键。
- `Object.keys/values()` 返回带有 `enumerable` 标志的非 Symbol 键/值。
- `for..in` 循环遍历所有带有 `enumerable` 标志的非 Symbol 键，以及原型对象的键。

===

### `ownKeys`

在下面这个示例中，我们使用 `ownKeys` 陷阱拦截 `for..in` 对 `user` 的遍历，并使用 `Object.keys` 和 `Object.values` 来跳过以下划线 `_` 开头的属性：

```javascript
let user = {
  name: "John",
  age: 30,
  _password: "***"
};

user = new Proxy(user, {
  ownKeys(target) {
    return Object.keys(target).filter(key => !key.startsWith('_'));
  }
});
// "ownKeys" 过滤掉了 _password
for(let key in user) console.log(key); // name，然后是 age
// 对这些方法的效果相同：
console.log( Object.keys(user) ); // name,age
console.log( Object.values(user) ); // John,30
```

===

### `getOwnPropertyDescriptor`

`getOwnPropertyDescriptor` 可以拦截对 `[[GetOwnProperty]]` 的调用（陷阱 `getOwnPropertyDescriptor` 可以做到这一点)，并返回带有 `enumerable: true` 的描述符。

```javascript
let user = { };
user = new Proxy(user, {
  ownKeys(target) { // 一旦要获取属性列表就会被调用
    return ['a', 'b', 'c'];
  },
  getOwnPropertyDescriptor(target, prop) { // 被每个属性调用
    return {
      enumerable: true,
      configurable: true
    };
  }
});
console.log( Object.keys(user) ); // a, b, c
```



---

## 保护属性

约定以下划线 `_` 开头的属性和方法是内部的。不能重外部访问、删除、设置、遍历。从技术上讲，我们也是能访问到这样的属性的：

```javascript
let user = {
  name: "John",
  _password: "secret"
};

console.log(user._password); // secret
```

让我们使用代理来防止对以 `_` 开头的属性的任何访问。我们将需要以下陷阱：

- `get` 读取此类属性时抛出错误，
- `set` 写入属性时抛出错误，
- `deleteProperty` 删除属性时抛出错误，
- `ownKeys` 在使用 `for..in` 和像 `Object.keys` 这样的的方法时排除以 `_` 开头的属性。

===

### 不允许读取` _password`

```javascript
user = new Proxy(user, {
  get(target, prop) {
    if (prop.startsWith('_')) {// 拦截属性读取
      throw new Error("Access denied");
    }
    let value = target[prop];
    return (typeof value === 'function') ? value.bind(target) : value; // (*)
  },
});
try {
  console.log(user._password); // Error: Access denied
} catch(e) { console.log(e.message); }

```

===

### 不允许写入` _password`

```javascript
user = new Proxy(user, {
  set(target, prop, val) {
    if (prop.startsWith('_')) {// 拦截属性写入
      throw new Error("Access denied");
    } else {
      target[prop] = val;
      return true;
    }
  },
});
try {
  user._password = "test"; // Error: Access denied
} catch(e) { console.log(e.message); }

```

===

### 不允许删除` _password`

```javascript
user = new Proxy(user, {
  deleteProperty(target, prop) { // 拦截属性删除
    if (prop.startsWith('_')) {
      throw new Error("Access denied");
    } else {
      delete target[prop];
      return true;
    }
  },
});
try {
  delete user._password; // Error: Access denied
} catch(e) { console.log(e.message); }
```

===

### 将 `_password `过滤出去

```javascript
user = new Proxy(user, {
user = new Proxy(user, {
  ownKeys(target) { // 拦截读取属性列表
    return Object.keys(target).filter(key => !key.startsWith('_'));
  }
});

for(let key in user) console.log(key); // name
```

===

###  `get` 陷阱的重要细节

```javascript
get(target, prop) {
  // ...
  let value = target[prop];
  return (typeof value === 'function') ? value.bind(target) : value; // (*)
}
```

为什么我们需要一个函数去调用 `value.bind(target)`？原因是对象方法（例如 `user.checkPassword()`）必须能够访问 `_password`：

```javascript
user = {
  checkPassword(value) {
    return value === this._password;
  }
}
```

该解决方案通常可行，但并不理想，因此，在任何地方都不应使用这种代理。

---

## 使用 `has` 陷阱拦截 `in`

定义 range 对象：

```javascript
let range = {
  start: 1,
  end: 10
};
```

我们想使用 `in` 操作符来检查一个数字是否在 `range` 范围内。

`has` 陷阱会拦截 `in` 调用。

```javascript
has(target, property)
```

- `target` — 是目标对象，被作为第一个参数传递给 `new Proxy`，
- `property` — 属性名称

===

### 例子

```javascript
let range = {
  start: 1,
  end: 10
};

range = new Proxy(range, {
  has(target, prop) {
    return prop >= target.start && prop <= target.end;
  }
});

console.log(5 in range); // true
console.log(50 in range); // false
```

===

## 使用`apply`陷阱包装函数

我们也可以将代理（proxy）包装在函数周围。

`apply(target, thisArg, args)` 陷阱能使代理以函数的方式被调用：

- `target` 是目标对象（在 JavaScript 中，函数就是一个对象），
- `thisArg` 是 `this` 的值。
- `args` 是参数列表。

===

### 例子

```javascript
function delay(f, ms) {
  return new Proxy(f, {
    apply(target, thisArg, args) {
      setTimeout(() => target.apply(thisArg, args), ms);
    }
  });
}
function sayHi(user) {
  console.log(`Hello, ${user}!`);
}
sayHi = delay(sayHi, 3000);
console.log(sayHi.length); // 1 (*) proxy 将“获取 length”的操作转发给目标对象
sayHi("John"); // Hello, John!（3 秒后）
```

---

## `Reflect`

===

### 可简化 `Proxy` 的创建

`Reflect` 是一个内建对象，可简化 `Proxy` 的创建。前面所讲过的内部方法，例如 `[[Get]]` 和 `[[Set]]` 等，都只是规范性的，不能直接调用。

以下是执行相同操作和 `Reflect` 调用的示例：

| 操作                | `Reflect` 调用                      | 内部方法        |
| :------------------ | :---------------------------------- | :-------------- |
| `obj[prop]`         | `Reflect.get(obj, prop)`            | `[[Get]]`       |
| `obj[prop] = value` | `Reflect.set(obj, prop, value)`     | `[[Set]]`       |
| `delete obj[prop]`  | `Reflect.deleteProperty(obj, prop)` | `[[Delete]]`    |
| `new F(value)`      | `Reflect.construct(F, value)`       | `[[Construct]]` |
| …                   | …                                   | …               |

===

### 调用内部方法

`Reflect` 对象使调用这些内部方法成为了可能。它的方法是内部方法的最小包装

```javascript
let user = {};

Reflect.set(user, 'name', 'John');

console.log(user.name); // John
```

`Reflect` 允许我们将操作符（`new`，`delete`，……）作为函数（`Reflect.construct`，`Reflect.deleteProperty`，……）执行调用。

===

### 与陷阱相同的方法

**对于每个可被 `Proxy` 捕获的内部方法，在 `Reflect` 中都有一个对应的方法，其名称和参数与 `Proxy` 陷阱相同。**所以，我们可以使用 `Reflect` 来将操作转发给原始对象。

```javascript
let user = { name: "John"};
user = new Proxy(user, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver); // (1)
  },
  set(target, prop, val, receiver) {
    return Reflect.set(target, prop, val, receiver); // (2)
  }
});
console.log(user.name);
user.name = "Pete";
```

===

### 说明

- `Reflect.get` 读取一个对象属性。
- `Reflect.set` 写入一个对象属性，如果写入成功则返回 `true`，否则返回 `false`。

这样，一切都很简单：如果一个陷阱想要将调用转发给对象，则只需使用相同的参数调用 `Reflect.<method>` 就足够了。

在大多数情况下，我们可以不使用 `Reflect` 完成相同的事情，例如，用于读取属性的 `Reflect.get(target, prop, receiver)` 可以被替换为 `target[prop]`。

===

## `receiver`

`receiver` — 如果目标属性是一个 getter 访问器属性，则 `receiver` 就是本次读取属性所在的 `this` 对象。通常，这就是 `proxy` 对象本身（或者，如果我们从 proxy 继承，则是从该 proxy 继承的对象）。

===

### `name` 的值是什么

```javascript
let user = {
  _name: "Guest",
  get name() { return this._name; }
};
let userProxy = new Proxy(user, {
  get(target, prop, receiver) {
    return target[prop]; // (*) target = user
  }
});
let admin = {  __proto__: userProxy,  _name: "Admin"};
console.log(admin.name); // 期望：Admin，实际：Guest (?!?)
```

分析：

1. 当我们读取 `admin.name` 时，由于 `admin` 对象自身没有对应的的属性，搜索将转到其原型。原型是 `userProxy`。
3. 从代理读取 `name` 属性时，`get` 陷阱会被触发，并从原始对象返回 `target[prop]` 属性，当调用 `target[prop]` 时，若 `prop` 是一个 getter，它将在 `target` 上下文中运行其代码。因此，结果是来自原始对象  `user`。


===

### 修改上下文

可以使用 `call/apply`，但这是一个 getter，它不能“被调用”，只能被访问。但`Reflect.get` 可以做到。

```javascript
let user = {
  _name: "Guest",
  get name() { return this._name; }
};
let userProxy = new Proxy(user, {
  get(target, prop, receiver) { // receiver = admin
    return Reflect.get(target, prop, receiver); // (*)
  }
});
let admin = { __proto__: userProxy,  _name: "Admin"};
console.log(admin.name); // Admin
```

现在 `receiver` 保留了对正确 `this` 的引用（即 `admin`），该引用是在 `(*)` 行中被通过 `Reflect.get` 传递给 getter 的。

---

## 更短的陷阱

```javascript
get(target, prop, receiver) {
  return Reflect.get(...arguments);
}
```

`Reflect` 调用的命名与陷阱的命名完全相同，并且接受相同的参数。

`return Reflect...` 提供了一个安全的方式，可以轻松地转发操作，并确保我们不会忘记与此相关的任何内容。

---

## `Proxy` 的局限性

代理提供了一种独特的方法，可以在最底层更改或调整现有对象的行为。但是，它并不完美。有局限性。

===

### 内建对象：内部插槽（`Internal slot`）

许多内建对象，例如 `Map`，`Set`，`Date`，`Promise` 等，都使用了所谓的“内部插槽”。例如，`Map` 将项目（item）存储在 `[[MapData]]` 中。内建方法可以直接访问它们，而不通过 `[[Get]]/[[Set]]` 内部方法。所以 `Proxy` 无法拦截它们。

在类似这样的内建对象被代理后，代理对象没有这些内部插槽，因此内建方法将会失败。

例如：

```javascript
let map = new Map();

let proxy = new Proxy(map, {});

proxy.set('test', 1); // Error
```

===

### 解决方法

在内部，一个 `Map` 将所有数据存储在其 `[[MapData]]` 内部插槽中。代理对象没有这样的插槽。 `Map.prototype.set`方法试图访问内部属性 `this.[[MapData]]`，但由于 `this=proxy`，在 `proxy` 中无法找到它，只能失败。

```javascript
let map = new Map();

let proxy = new Proxy(map, {
  get(target, prop, receiver) {
    let value = Reflect.get(...arguments);
    return typeof value == 'function' ? value.bind(target) : value;
  }
});
proxy.set('test', 1);
console.log(proxy.get('test'));
```

 `get` 陷阱将函数属性（例如 `map.set`）绑定到了目标对象（`map`）本身。

===

### `Array` 没有内部插槽

一个值得注意的例外：内建 `Array` 没有使用内部插槽。那是出于历史原因，因为它出现于很久以前。

所以，代理数组时没有这种问题。

===

### 私有字段

类的私有字段也会发生类似的情况。

```javascript
class User {
  #name = "Guest";
  getName() {
    return this.#name;
  }
}

let user = new User();

user = new Proxy(user, {});

console.log(user.getName()); // Error
```

原因是私有字段是通过内部插槽实现的。JavaScript 在访问它们时不使用 `[[Get]]/[[Set]]`。在调用 `getName()` 时，`this` 的值是代理后的 `user`，它没有带有私有字段的插槽。

===

### 解决方案

```javascript
class User {
  #name = "Guest";
  getName() {
    return this.#name;
  }
}
let user = new User();
user = new Proxy(user, {
  get(target, prop, receiver) {
    let value = Reflect.get(...arguments);
    return typeof value == 'function' ? value.bind(target) : value;
  }
});
console.log(user.getName()); // Guest
```

如前所述，该解决方案也有缺点：它将原始对象暴露给该方法，可能使其进一步传递并破坏其他代理功能。

===

### `Proxy != target`

代理和原始对象是不同的对象。如果我们使用原始对象作为键，然后对其进行代理：

```javascript
let allUsers = new Set();

class User {
  constructor(name) {
    this.name = name;
    allUsers.add(this);
  }
}
let user = new User("John");
console.log(allUsers.has(user)); // true
user = new Proxy(user, {});
console.log(allUsers.has(user)); // false
```

如我们所见，进行代理后，我们在 `allUsers` 中找不到 `user`，因为代理是一个不同的对象。

===

### Proxy 无法拦截严格相等性检查 `===`

Proxy 可以拦截许多操作符，例如 `new`（使用 `construct`），`in`（使用 `has`），`delete`（使用 `deleteProperty`）等。

但是没有办法拦截对于对象的严格相等性检查。一个对象只严格等于其自身，没有其他值。

---

## 可撤销 Proxy

一个 **可撤销** 的代理是可以被禁用的代理。

语法为：

```javascript
let {proxy, revoke} = Proxy.revocable(target, handler)
```

该调用返回一个带有 `proxy` 和 `revoke` 函数的对象以将其禁用。

这是一个例子：

```javascript
let object = { data: "Valuable data" };
let {proxy, revoke} = Proxy.revocable(object, {});
console.log(proxy.data); // Valuable data
revoke();// 稍后，在我们的代码中
console.log(proxy.data); // proxy 不再工作（revoked）Error
```

调用 `revoke()` 会从代理中删除对目标对象的所有内部引用，因此它们之间再无连接。

===

### `revoke` 存储在 `WeakMap` 中

我们还可以将 `revoke` 存储在 `WeakMap` 中，以更便于通过代理对象轻松找到它：

```javascript
let revokes = new WeakMap();
let object = {
  data: "Valuable data"
};
let {proxy, revoke} = Proxy.revocable(object, {});
revokes.set(proxy, revoke);
// ...稍后，在我们的代码中...
revoke = revokes.get(proxy);
revoke();
console.log(proxy.data); // Error（revoked）
```

这种方法的好处是，我们不必再随身携带 `revoke`。我们可以在有需要时通过 `proxy` 从 map 上获取它。

此处我们使用 `WeakMap` 而不是 `Map`，因为它不会阻止垃圾回收。如果一个代理对象变得“不可访问”（例如，没有变量再引用它），则 `WeakMap` 允许将其与它的 `revoke` 一起从内存中清除，因为我们不再需要它了。

