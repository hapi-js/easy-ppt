# 自定义和扩展 `Error`

---

## 举例

例如，让我们考虑一个函数 `readUser(json)`，该函数应该读取带有用户数据的 JSON。

这里是一个可用的 `json` 的例子：

```javascript
let json = `{ "name": "John", "age": 30 }`;
```

可能出现的错误：

1. 格式不正确的 `json`，抛出 `SyntaxError`。
2. 能丢失了某些必要的数据，如 `name` 和 `age` 属性。

---

## `ValidationError` 自定义错误

我们的 `ValidationError` 类应该继承自内建的 `Error` 类。

`Error` 类是内建的，但这是其近似代码，所以我们可以了解我们要扩展的内容：

```javascript
// JavaScript 自身定义的内建的 Error 类的“伪代码”
class Error {
  constructor(message) {
    this.message = message;
    this.name = "Error"; // (不同的内建 error 类有不同的名字)
    this.stack = <call stack>; // 非标准的，但大多数环境都支持它
  }
}
```

从技术上讲，我们自定义的 error 不需要从 `Error` 中继承。但是，如果我们继承，那么就可以使用 `obj instanceof Error` 来识别 error 对象。因此，最好继承它。

===

### 继承`Error`

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = "ValidationError"; // (2)
  }
}
try {
  throw new ValidationError("Whoops!");
} catch(err) {
  console.log(err.message); // Whoops!
  console.log(err.name); // ValidationError
}
```

请注意：在 `(1)` 行中我们调用了父类的 constructor。JavaScript 要求我们在子类的 constructor 中调用 `super`，所以这是必须的。父类的 constructor 设置了 `message` 属性。父类的 constructor 还将 `name` 属性的值设置为了 `"Error"`，所以在 `(2)` 行中，我们将其重置为了右边的值。

===

### 使用

让我们尝试在 `readUser(json)` 中使用它吧：

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

// 用法
function readUser(json) {
  let user = JSON.parse(json);

  if (!user.age) {
    throw new ValidationError("No field: age");
  }
  if (!user.name) {
    throw new ValidationError("No field: name");
  }

  return user;
}

// try..catch 的工作示例

try {
  let user = readUser('{ "age": 25 }');
} catch (err) {
  if (err instanceof ValidationError) {
    console.log("Invalid data: " + err.message); // Invalid data: No field: name
  } else if (err instanceof SyntaxError) { // (*)
    console.log("JSON Syntax Error: " + err.message);
  } else {
    throw err; // 未知的 error，再次抛出 (**)
  }
}
```

上面代码中的 `try..catch` 块既处理我们的 `ValidationError` 又处理来自 `JSON.parse` 的内建 `SyntaxError`。

===

### 使用  `err.name`

```javascript
// ...
// instead of (err instanceof SyntaxError)
} else if (err.name == "SyntaxError") { // (*)
// ...
```

使用 `instanceof` 的版本要好得多，因为将来我们会对 `ValidationError` 进行扩展，创建它的子类型，例如 `PropertyRequiredError`。而 `instanceof` 检查对于新的继承类也适用。所以这是面向未来的做法。

还有一点很重要，在 `catch` 遇到了未知的错误，它会在 `(**)` 行将该错误再次抛出。`catch` 块只知道如何处理 validation 错误和语法错误，而其他错误（由于代码中的错字或其他未知的错误）应该被扔出（fall through）。

---

## 深入继承

对象的属性可能缺失或者属性可能有格式错误，`PropertyRequiredError` 类将定义缺少属性的错误。

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class PropertyRequiredError extends ValidationError {
  constructor(property) {
    super("No property: " + property);
    this.name = "PropertyRequiredError";
    this.property = property;
  }
}

// 用法
function readUser(json) {
  let user = JSON.parse(json);
  if (!user.age) {
    throw new PropertyRequiredError("age");
  }
  if (!user.name) {
    throw new PropertyRequiredError("name");
  }
  return user;
}
// try..catch 的工作示例
try {
  let user = readUser('{ "age": 25 }');
} catch (err) {
  if (err instanceof ValidationError) {
    console.log("Invalid data: " + err.message); // Invalid data: No property: name
    console.log(err.name); // PropertyRequiredError
    console.log(err.property); // name
  } else if (err instanceof SyntaxError) {
    console.log("JSON Syntax Error: " + err.message);
  } else {
    throw err; // 为止 error，将其再次抛出
  }
}
```

===

### 基础错误

通过定义基础错误简化代码

```javascript
class MyError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends MyError { }

class PropertyRequiredError extends ValidationError {
  constructor(property) {
    super("No property: " + property);
    this.property = property;
  }
}
// name 是对的
console.log( new PropertyRequiredError("field").name ); // PropertyRequiredError
```

---

## 包装异常

我们是否真的想每次都一一检查所有的 error 类型？

```javascript
try {
  ...
  readUser()  // 潜在的 error 源
  ...
} catch (err) {
  if (err instanceof ValidationError) {
    // 处理 validation error
  } else if (err instanceof SyntaxError) {
    // 处理 syntax error
  } else {
    throw err; // 未知 error，再次抛出它
  }
}
```

通常答案是 “No”！

===

### 包装“低级别”的异常



下面的代码定义了 `ReadError`，并在 `readUser` 和 `try..catch` 中演示了其用法：

```javascript
class ReadError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = 'ReadError';
  }
}

class ValidationError extends Error { /*...*/ }
class PropertyRequiredError extends ValidationError { /* ... */ }

function validateUser(user) {
  if (!user.age) {
    throw new PropertyRequiredError("age");
  }

  if (!user.name) {
    throw new PropertyRequiredError("name");
  }
}

function readUser(json) {
  let user;

  try {
    user = JSON.parse(json);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new ReadError("Syntax Error", err);
    } else {
      throw err;
    }
  }

  try {
    validateUser(user);
  } catch (err) {
    if (err instanceof ValidationError) {
      throw new ReadError("Validation Error", err);
    } else {
      throw err;
    }
  }

}

try {
  readUser('{bad json}');
} catch (e) {
  if (e instanceof ReadError) {
    console.log(e);
    // Original error: SyntaxError: Unexpected token b in JSON at position 1
    console.log("Original error: " + e.cause);
  } else {
    throw e;
  }
}
```

这种方法被称为“包装异常（wrapping exceptions）”，因为我们将“低级别”的异常“包装”到了更抽象的 `ReadError` 中。它被广泛应用于面向对象的编程中。

---

## 总结

- 我们可以正常地从 `Error` 和其他内建的 error 类中进行继承，。我们只需要注意 `name` 属性以及不要忘了调用 `super`。
- 我们可以使用 `instanceof` 来检查特定的 error。但有时我们有来自第三方库的 error 对象，并且在这儿没有简单的方法来获取它的类。那么可以将 `name` 属性用于这一类的检查。
- 包装异常是一项广泛应用的技术：用于处理低级别异常并创建高级别 error 而不是各种低级别 error 的函数。在上面的示例中，低级别异常有时会成为该对象的属性，例如 `err.cause`，但这不是严格要求的。

---

## 练习

===

### 继承 `SyntaxError`

重要程度: 5

创建一个继承自内建类 `SyntaxError` 的类 `FormatError`。它应该支持 `message`，`name` 和 `stack` 属性。

用例：

```javascript
let err = new FormatError("formatting error");

alert( err.message ); // formatting error
alert( err.name ); // FormatError
alert( err.stack ); // stack

alert( err instanceof FormatError ); // true
alert( err instanceof SyntaxError ); // true（因为它继承自 SyntaxError）
```

===

### 答案

```javascript
class FormatError extends SyntaxError {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

let err = new FormatError("formatting error");

alert( err.message ); // formatting error
alert( err.name ); // FormatError
alert( err.stack ); // stack

alert( err instanceof SyntaxError ); // true
```