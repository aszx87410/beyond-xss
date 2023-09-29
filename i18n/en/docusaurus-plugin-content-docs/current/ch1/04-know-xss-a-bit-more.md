---
sidebar_position: 4
---

# Understanding XSS a Bit More

In the previous post, it was mentioned that attackers need to adjust the XSS payload to ensure effectiveness in different scenarios. For example, if the injection point is in `innerHTML`, using `<script>alert(1)</script>` will not have any effect. Therefore, we need to understand XSS a bit more to know what methods can be used for attacks.

Learning about attacks is learning about defense. We must know how to attack in order to know how to defend effectively.

## Ways to Execute JavaScript

Once you have control over HTML, there are several ways to execute JavaScript.

The most common way is using the `<script>` tag. However, one of its drawbacks is that it can easily be identified by a Web Application Firewall (WAF). Another drawback is that it does not work in the context of `innerHTML`, as mentioned in the previous post.

Apart from `<script>`, we can also use other tags combined with inline event handlers to execute code. For example:

``` html
<img src="not_exist" onerror="alert(1)">
```

This loads a non-existent image and uses the `onerror` event to execute code.

In fact, many people (including myself) use `x` as the `src` because it is easy to write and remember. Usually, the path `x` does not exist, but if it does, `onerror` will not be triggered. Therefore, there is a joke that you can place an image named `x` in the root directory of a website, and some attackers may not discover the XSS vulnerability.

Apart from `onerror`, any event handler can be exploited. For example:

``` html
<button onclick="alert(1)">Click me, please</button>
```

Clicking the button will trigger an alert. However, the difference with this method is that "the user has to take some action" to trigger XSS, such as clicking the button. In the previous example with the `img` tag, the user does not need to do anything, and XSS will be triggered.

For a shorter payload, you can use the `onload` event of `svg`:

``` html
<svg onload="alert(1)">
```

Here's a little extra knowledge: in HTML, the `"` for attribute values is not necessary. If your content does not have spaces, you can remove them without any problem. Even the spaces between tags and attributes can be replaced with `/`. Therefore, the payload for `svg` can be written like this:

``` html
<svg/onload=alert(1)>
```

No spaces or quotation marks are needed to construct an XSS payload.

Commonly exploited event handlers include:

1. onerror
2. onload
3. onfocus
4. onblur
5. onanimationend
6. onclick
7. onmouseenter

Apart from these event handlers starting with "on," there is another way to execute code that frontend developers may have seen:

``` html
<a href=javascript:void(0)>Link</a>
```

This is used to make the element unresponsive when clicked. From this example, we can see that we can use `href` to execute code, like this:

``` html
<a href=javascript:alert(1)>Link</a>
```

To summarize, there are several ways to execute JavaScript in HTML:

1. `<script>` tag
2. Event handlers in attributes (starting with `on`)
3. `javascript:` pseudo-protocol

Knowing these methods, you can use them in different scenarios.

If you want to learn more payloads, you can refer to the [Cross-site scripting (XSS) cheat sheet](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet), which contains various types of payloads.

## XSS in Different Scenarios and Defense Mechanisms

Usually, the places where payloads can be injected are referred to as injection points. In the following code snippet:

``` html
<div>
  Hello, <span id="name"></span>
</div>
<script>
  const qs = new URLSearchParams(window.location.search)
  const name = qs.get('name')
  document.querySelector('#name').innerHTML = name
</script>
```

The injection point is in the line `document.querySelector('#name').innerHTML = name`.

Different injection points affect how attacks can be carried out and how to defend against them. Let's categorize three different scenarios.

### HTML Injection

This is the most common scenario, whether it's the example above or the PHP code snippet below:

``` php
<?php
 echo "Hello, <h1>" . $_GET['name'] . '</h1>';
?>
```

These two cases both involve manipulating a blank HTML provided to you, so you can directly write any desired elements, which provides a lot of freedom.

For example, using the commonly seen payload `<img src=not_exist onerror=alert(1)>` can execute JavaScript.

The defense method is to replace all occurrences of `<` and `>` in user input. By doing so, they won't be able to insert new HTML tags and won't be able to do anything.

### Attribute Injection

Sometimes you may encounter code like the following, where the input content is used as the value of an attribute enclosed within the attribute:

``` html
<div id="content"></div>
<script>
  const qs = new URLSearchParams(window.location.search)
  const clazz = qs.get('clazz')
  document.querySelector('#content').innerHTML = `
    <div class="${clazz}">
      Demo
    </div>
  `
</script>
```

In this case, using the aforementioned `<img src=not_exist onerror=alert(1)>` won't work because the input value is treated as the content of the attribute.

To execute XSS in this scenario, you can escape the attribute and close the tag, like this: `"><img src=not_exist onerror=alert(1)>`. This way, the entire HTML will become:

``` html
<div class=""><img src=not_exist onerror=alert(1)>">
  Demo
</div>
```

After escaping the attribute, you can insert the desired HTML tags.

From this case, you can see why I mentioned that the context is important. If you think that XSS only occurs in the first scenario I mentioned and only handle the `<>` characters, it will be ineffective in this context because the attacker can attack without using new tags.

For example, using the payload `" tabindex=1 onfocus="alert(1)" x="`, which doesn't contain `<>` at all, the HTML will become:

``` html
<div class="" tabindex=1 onfocus="alert(1)" x="">
  Demo
</div>
```

Unlike adding new HTML tags, this attack method utilizes the `onfocus` event of the original `div` tag to execute XSS. Therefore, when filtering, in addition to `<>`, the `'` and `"` characters also need to be encoded.

Additionally, this is why you should avoid writing code like this:

``` js
document.querySelector('#content').innerHTML = `
  <div class=${clazz}>
    Demo
  </div>
```

The above attribute is not enclosed in `"` or `'`, so even if we think we have protected it by encoding `<>"'`, the attacker can still add other attributes using spaces.

### JavaScript Injection

In addition to HTML, sometimes user input is reflected in JavaScript, for example:

``` php
<script>
  const name = "<?php echo $_GET['name'] ?>";
  alert(name);
</script>
```

If you only look at this code snippet, you might think that encoding `"` is enough because it prevents breaking out of the string. However, this approach is problematic because the attacker can close the tag with `</script>` and then inject other tags, and so on.

So, in this context, just like before, you need to encode `<>"'` to prevent the attacker from escaping the string.

However, even with this, you still need to be aware that if you add an empty line in the input, the entire code snippet will fail to execute due to the line break, resulting in a `SyntaxError`.

What if it's a situation like this:

``` php
<script>
  const name = `
    Hello,
    <?php echo $_GET['name'] ?>
  `;
  alert(name);
</script>
```

In this case, you can inject JavaScript code using the `${alert(1)}` syntax, achieving XSS. Although frontend engineers know that this can cause issues just by looking at it, not every engineer may be aware of it. Perhaps this code was written by a backend engineer who simply thought, "If a multiline string is needed, use this symbol," without realizing its meaning and potential dangers.

## Conclusion

In this article, we have learned more about XSS, understood the different ways JavaScript can be executed, and realized that the necessary defenses vary depending on the context.

However, does encoding `<>"'` guarantee complete security? That's not necessarily the case.

There is a commonly overlooked situation that was briefly mentioned in this article but not discussed in detail. We will cover it in the next article.

Before moving on to the next article, let's have a brainstorming session. I mentioned earlier that there are basically three ways to execute JavaScript:

1. `<script>` tag
2. Event handlers in attributes (always starting with `on`)
3. `javascript:` pseudo-protocol

If the first method, like `innerHTML = '<script>alert(1)</script>'`, doesn't work.

If event handlers and `javascript:` pseudo-protocol cannot be used, and the injection point is `innerHTML = data`, what other ways can be used to execute scripts? Take a moment to think about it.
