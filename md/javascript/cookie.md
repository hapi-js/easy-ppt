# `cookie`

---

## 什么是`cookie`

Cookie 是直接存储在浏览器中的一小串数据。它们是 HTTP 协议的一部分。

Cookie 通常是由 Web 服务器使用响应 `Set-Cookie` HTTP-header 设置的。然后浏览器使用 `Cookie` HTTP-header 将它们自动添加到（几乎）每个对相同域的请求中。

---

## `document.cookie` 读取

`document.cookie` 的值由 `name=value` 对组成，以 `;` 分隔。每一个都是独立的 cookie。

**读取 cookie**

```javascript
// 所以应该存在一些 cookie
log( document.cookie ); // cookie1=value1; cookie2=value2;...
```

为了找到一个特定的 cookie，我们可以以 `;` 作为分隔，将 `document.cookie` 分开，然后找到对应的名字。

---

## `document.cookie` 写入

**对 `document.cookie` 的写入操作只会更新其中提到的 cookie，而不会涉及其他 cookie。**

```javascript
document.cookie = "user=John"; // 只会更新名称为 user 的 cookie
```

===

### 编码

从技术上讲，cookie 的名称和值可以是任何字符，为了保持有效的格式，它们应该使用内建的 `encodeURIComponent` 函数对其进行转义：

```javascript
// 特殊字符（空格），需要编码
let name = "my name";
let value = "John Smith"

// 将 cookie 编码为 my%20name=John%20Smith
document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
```

===

### 限制

- `encodeURIComponent` 编码后的 `name=value` 对，大小不能超过 4kb。因此，我们不能在一个 cookie 中保存大的东西。
- 每个域的 cookie 总数不得超过 20+ 左右，具体限制取决于浏览器。

---

## `Cookie`  选项

Cookie 有几个选项，很多都很重要，应该设置它，选项被列在 `key=value` 之后，以 `;` 分隔

```javascript
document.cookie = "user=John; path=/; expires=Tue, 19 Jan 2038 03:14:07 GMT"
```

===

### `path`

- **`path=/mypath`**

url 路径前缀，该路径下的页面可以访问该 cookie。必须是绝对路径。默认为当前路径。

如果一个 cookie 带有 `path=/admin` 设置，那么该 cookie 在 `/admin` 和 `/admin/something` 下都是可见的，但是在 `/home` 或 `/adminpage` 下不可见。

通常，我们应该将 `path` 设置为根目录：`path=/`，以使 cookie 对此网站的所有页面可见。

===

### `expires`

默认情况下，如果一个 cookie 没有设置这两个参数中的任何一个，那么在关闭浏览器之后，它就会消失。

为了让 cookie 在浏览器关闭后仍然存在，我们可以设置 `expires` 。

- **`expires=Tue, 19 Jan 2038 03:14:07 GMT`**

cookie 的到期日期，那时浏览器会自动删除它。

===

### 1 天后过期

日期必须完全采用 GMT 时区的这种格式。我们可以使用 `date.toUTCString` 来获取它。例如，我们可以将 cookie 设置为 1 天后过期。

```javascript
// 当前时间 +1 天
let date = new Date(Date.now() + 86400e3);
date = date.toUTCString();
document.cookie = "user=John; expires=" + date;
```

如果我们将 `expires` 设置为过去的时间，则 cookie 会被删除。

===

### `max-age`

`expires` 的替代选项，具指明 cookie 的过期时间距离当前时间的秒数。

如果为 0 或负数，则 cookie 会被删除：

```javascript
// cookie 会在一小时后失效
document.cookie = "user=John; max-age=3600";

// 删除 cookie（让它立即过期）
document.cookie = "user=John; max-age=0";
```

---

## `httpOnly`

这个选项和 JavaScript 没有关系，Web 服务器使用 `Set-Cookie` header 来设置 cookie。并且，它可以设置 `httpOnly` 选项。

这个选项禁止任何 JavaScript 访问 cookie。我们使用 `document.cookie` 看不到此类 cookie，也无法对此类 cookie 进行操作。

