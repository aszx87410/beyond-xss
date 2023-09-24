---
sidebar_position: 9
---

# Latest XSS Defense: Trusted Types and Built-in Sanitizer API

When discussing XSS defense, I mentioned the need to handle user input. If HTML is allowed, it is necessary to find a reliable package to handle it.

Many websites have such requirements, so browsers have gradually started providing related functionalities.

Creating a new feature from scratch usually takes a long time, from proposal and specification to implementation, which can take several years. The topics of Trusted Types and Sanitizer API discussed in this article are currently only supported by Chromium-based browsers. They have not been officially supported in the latest versions of Firefox (119) and Safari (17) yet. Therefore, the content mentioned in this article can be considered as a reference for future use in production when the time is right.

## Sanitizer API

Sanitizer API is the built-in sanitizer provided by browsers. It is quite similar to the previously mentioned DOMPurify in terms of usage. Here is an example:

``` html
<!DOCTYPE html>
<html>
<body>
  <div id=content></div>
  <script>
    const html = `
      Hello,
      <script>alert(1)<\/script>
      <img src=x onerror=alert(1)>
      <a href=javascript:alert(1)>click me</a>
      <h1 onclick=alert(1) id=a>title</h1>
      <iframe></iframe>
    `; 
    const sanitizer = new Sanitizer(); 
    document
      .querySelector("#content")
      .setHTML(html, { sanitizer });
  </script>
</body>
</html>
```

To work with the Sanitizer API, a new method called `setHTML` has been added. By passing the original HTML and the sanitizer, the Sanitizer API can perform filtering.

The filtered result of the above HTML is:

``` html
Hello,
<img src=x>
<a>click me</a>
<h1 id=a>title</h1>
```

All dangerous elements have been removed. The goal of the Sanitizer API is to ensure that "no matter how you use it or configure it, XSS will not occur." This is both an advantage and a disadvantage. Let me give you another example to make it clear:

``` html
<!DOCTYPE html>
<html>
<body>
  <div id=content></div>
  <script>
    const html = `
      Hello, this is my channel:
      <iframe src=https://www.youtube.com/watch?v=123></iframe>
    `; 
    const sanitizer = new Sanitizer({
      allowElements: ['iframe'],
      allowAttributes: {
        'iframe': ['src']
      }
    }); 
    document
      .querySelector("#content")
      .setHTML(html, { sanitizer });
    /*
        result: Hello, this is my channel:
    */
  </script>
</body>
</html>
```

The configuration file states that iframes are allowed, including the `src` attribute. However, in the final result, the iframe is still removed. This is because, as I mentioned earlier, the Sanitizer API guarantees that you can never use dangerous tags. So, regardless of the configuration, iframes are not allowed.

Someone has also raised this issue in the [Allow Embedding #124](https://github.com/WICG/sanitizer-api/issues/124). The biggest problem is that once iframes are allowed and the assumption of "being safe no matter what" is maintained, there are many things to consider.

For example, if filtering is applied to the `src` attribute, should the URLs inside it be filtered? Should `data:` URLs be removed? What about `srcdoc`? Should it also be re-filtered? This issue is still open and has been inactive for over a year.

The [specification of the Sanitizer API](https://wicg.github.io/sanitizer-api/#baseline-elements) defines a list of baseline elements and baseline attributes. Since it is quite long, I won't paste it here. If the element or attribute you want to add is not in this list, there is no way to use it no matter what.

This can be considered both an advantage and a disadvantage of the Sanitizer API. Although it may lack flexibility, the advantage is that no matter how it is used, there won't be any issues. Unlike the third-party packages we introduced before, there is a possibility of issues if the configuration is not properly adjusted.

Currently, the Sanitizer API is still in its early stages. Perhaps, in the future, when all mainstream browsers support the Sanitizer API and it can achieve the desired features, it can be considered whether to switch to it.

Although I still recommend using DOMPurify for sanitization, it's good to have an understanding of the Sanitizer API as well.

If you want to learn more about how to use it, you can refer to Google's article on [Safe DOM manipulation with the Sanitizer API](https://web.dev/sanitizer/).

## Trusted Types

Trusted Types, like the Sanitizer API, is also very new and currently only supported by Chromium-based browsers. So, it's just good to have a look for now, as it is not yet mature.

When rendering user data on the frontend, we need to constantly ensure that the user input is properly escaped to prevent XSS vulnerabilities. However, there are many places where things can go wrong, such as `innerHTML`, `<iframe srcdoc>`, or `document.write`, etc. If we directly pass unprocessed input to them, it creates an XSS vulnerability.

Besides developers being cautious when writing code, are there any other methods to prevent issues in these places? For example, suppose I execute `div.innerHTML = str`, and if `str` is an unprocessed string, it throws an error and stops execution. This way, XSS occurrences can be reduced.

Yes, this is what Trusted Types does.

After adding Trusted Types to CSP, Trusted Types can be enabled to protect these DOM APIs, forcing the browser to go through Trusted Types processing before inserting HTML:

```
Content-Security-Policy: require-trusted-types-for 'script';
```

Here is an example:

``` html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="require-trusted-types-for 'script'">
</head>
<body>
  <div id=content></div>
  <script>
    document.querySelector("#content").innerHTML = '<h1>hello</h1>'
  </script>
</body>
</html>
```

The above code will throw an error when executed, with the following message:

> This document requires 'TrustedHTML' assignment. Uncaught TypeError: Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment.

Once Trusted Types are enforced, you can no longer directly pass a string to `innerHTML`. Instead, you need to create a new Trusted Types policy to handle dangerous HTML. Here's how it's done:

``` html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="require-trusted-types-for 'script'">
</head>
<body>
  <div id=content></div>
  <script>
    // create a new policy
    const sanitizePolicy = trustedTypes.createPolicy('sanitizePolicy', {
      // add sanitize/escape
      createHTML: (string) => string
        .replace(/</g, "&lt;")
        .replace(/>/g, '&gt;')
    });
    // The type of safeHtml is TrustedHTML, not String
    const safeHtml = sanitizePolicy.createHTML('<h1>hello</h1>')
    document.querySelector("#content").innerHTML = safeHtml
  </script>
</body>
</html>
```

The purpose of Trusted Types is not to "ensure your HTML is problem-free," but rather to "force the use of Trusted Types on potentially problematic DOM APIs and disallow the use of strings." This significantly reduces many risks. When you accidentally forget to handle user input, the browser will throw an error instead of rendering the unprocessed string as HTML.

Therefore, after enabling Trusted Types, you only need to focus on the implementation of `createHTML` and ensure that these implementations are secure. Additionally, from the above example, you can see that the content of `createHTML` is determined by us, so it can also be combined with DOMPurify.

What about combining it with the Sanitizer API? It is possible, and this is also the recommended approach in the [official documentation](https://github.com/WICG/sanitizer-api/blob/main/faq.md#can-i-use-the-sanitizer-api-together-with-trusted-types):

> Can I use the Sanitizer API together with Trusted Types?
> 
> Yes, please. We see these as APIs that solve different aspects of the same problem. They are separate but should work well together.
> Details of Santizer API/Trusted Types integration are still being worked out.

## Conclusion

In this article, we have seen two new APIs: Sanitizer and Trusted Types. These APIs are quite significant for frontend security, as they represent browsers actively providing support for sanitization, allowing us developers to have more defenses against attacks.

Although these two APIs are not yet mature, in the not-so-distant future, we may see them gradually becoming mainstream. Some frontend frameworks have already caught up with them, such as [Angular](https://angular.io/guide/security#enforcing-trusted-types) and [Next.js](https://github.com/vercel/next.js/issues/32209), which are either discussing or already have support for Trusted Types.

If you want to try Trusted Types in production ahead of time, you can use this polyfill provided by W3C: [https://github.com/w3c/trusted-types](https://github.com/w3c/trusted-types)
