# 操作`DOM`

## `Remove`

从 DOM 中移除元素。

```javascript
// jQuery
$el.remove();

// Native
el.parentNode.removeChild(el);

// Native - Only latest, NO IE
el.remove();
```

---

## `Text`

===

### `Get text`

返回指定元素及其后代的文本内容。

```javascript
// jQuery
$el.text();

// Native
el.textContent;
```

===

### `Set text`

设置元素的文本内容。

```
// jQuery
$el.text(string);

// Native
el.textContent = string;
```

---

## `HTML`

===

### Get HTML

```javascript
// jQuery
$el.html();

// Native
el.innerHTML;
```

===

### `Set HTML`

```javascript
// jQuery
$el.html(htmlString);

// Native
el.innerHTML = htmlString;
```

---

## `Append`

Append 插入到子节点的末尾

```javascript
// jQuery
$el.append("<div id='container'>hello</div>");

// Native (HTML string)
el.insertAdjacentHTML('beforeend', '<div id="container">Hello World</div>');

// Native (Element)
el.appendChild(newEl);
```

---

##  Prepend

```javascript
// jQuery
$el.prepend("<div id='container'>hello</div>");

// Native (HTML string)
el.insertAdjacentHTML('afterbegin', '<div id="container">Hello World</div>');

// Native (Element)
el.insertBefore(newEl, el.firstChild);
```

---

## `insertBefore`

在选中元素前插入新节点

```javascript
// jQuery
$newEl.insertBefore(queryString);

// Native (HTML string)
el.insertAdjacentHTML('beforebegin ', '<div id="container">Hello World</div>');

// Native (Element)
const el = document.querySelector(selector);
if (el.parentNode) {
  el.parentNode.insertBefore(newEl, el);
}
```

---

## `insertAfter`

在选中元素后插入新节点

```javascript
// jQuery
$newEl.insertAfter(queryString);

// Native (HTML string)
el.insertAdjacentHTML('afterend', '<div id="container">Hello World</div>');

// Native (Element)
const el = document.querySelector(selector);
if (el.parentNode) {
  el.parentNode.insertBefore(newEl, el.nextSibling);
}
```

---

## `is`

如果匹配给定的选择器，返回true

```javascript
// jQuery
$el.is(selector);

// Native
el.matches(selector);
```

---

## `clone`

深拷贝被选元素。（生成被选元素的副本，包含子节点、文本和属性。）

```javascript
//jQuery
$el.clone();

//Native
//深拷贝添加参数'true'
el.cloneNode();
```

---

## `empty`

移除所有子节点

```javascript
//jQuery
$el.empty();

//Native
el.innerHTML = '';
```

---

## `wrap`

把每个被选元素放置在指定的HTML结构中。

```javascript
//jQuery
$(".inner").wrap('<div class="wrapper"></div>');

//Native
Array.prototype.forEach.call(document.querySelector('.inner'), (el) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  el.parentNode.insertBefore(wrapper, el);
  el.parentNode.removeChild(el);
  wrapper.appendChild(el);
});
```

---

## `unwrap`

移除被选元素的父元素的DOM结构

```javascript
// jQuery
$('.inner').unwrap();

// Native
Array.prototype.forEach.call(document.querySelectorAll('.inner'), (el) => {
      let elParentNode = el.parentNode

      if(elParentNode !== document.body) {
          elParentNode.parentNode.insertBefore(el, elParentNode)
          elParentNode.parentNode.removeChild(elParentNode)
      }
});
```

---

## `replaceWith`

用指定的元素替换被选的元素

```javascript
//jQuery
$('.inner').replaceWith('<div class="outer"></div>');

//Native
Array.prototype.forEach.call(document.querySelectorAll('.inner'),(el) => {
  const outer = document.createElement("div");
  outer.className = "outer";
  el.parentNode.insertBefore(outer, el);
  el.parentNode.removeChild(el);
});
```

---

## `simple parse`

解析 HTML/SVG/XML 字符串

```javascript
// jQuery
$(`<ol>
  <li>a</li>
  <li>b</li>
</ol>
<ol>
  <li>c</li>
  <li>d</li>
</ol>`);

// Native
range = document.createRange();
parse = range.createContextualFragment.bind(range);

parse(`<ol>
  <li>a</li>
  <li>b</li>
</ol>
<ol>
  <li>c</li>
  <li>d</li>
</ol>`);
```

