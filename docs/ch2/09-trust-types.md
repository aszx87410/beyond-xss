---
sidebar_position: 9
---

# 最新的 XSS 防禦：Trusted Types 與內建的 Sanitizer API

在講 XSS 的防禦時，我有提到要處理使用者的輸入，如果原本就允許 HTML，那需要找個好用的套件設定規則去處理。

這些需求其實有很多網站都會需要，因此瀏覽器也慢慢開始提供了相關的功能。

要從頭新增一個功能通常都曠日費時，從提案、規範一直再到實作，可能會需要數年的時間，而這篇文章要提的 Trusted Types 以及 Sanitizer API 也是，目前都只有 Chromium based 的瀏覽器支援而已，在最新版本的 Firefox（119）跟 Safari（17）中都還沒有正式支援，因此這篇提到的內容可以先當作參考，以後時機成熟時再運用到 production 上。

## Sanitizer API

Sanitizer API 就是瀏覽器提供的內建 sanitizer，使用上其實跟我之前提過的 DOMPurify 滿類似的，範例如下：

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

為了搭配 Sanitizer API，新增了 `setHTML` 這個方法，傳入原始的 HTML 跟 sanitizer，就可以透過 Sanitizer API 去做過濾。

上面的 HTML 過濾完的結果是：

``` html
Hello,
<img src=x>
<a>click me</a>
<h1 id=a>title</h1>
```

危險的東西都被清除了，而 Sanitizer API 的目標就是：「不管你怎麼用怎麼設定，都不會有 XSS 的產生」，這是個優點也是缺點，我再舉一個例子就清楚了：

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
        結果：Hello, this is my channel:
    */
  </script>
</body>
</html>
```

設定檔中寫說想要允許 iframe，而且允許 iframe 的 src，但最後出來的結果中，iframe 還是會被拿掉。這就是因為我前面講的，Sanitizer API 要保證你永遠不能使用危險的 tag，所以無論如何，iframe 就是不給你用。

有人也在 issue 中提出了這個問題：[Allow Embedding #124](https://github.com/WICG/sanitizer-api/issues/124)，最大的問題是一旦開放了 iframe 而且又要維持「不管怎樣都安全」的假設的話，就有很多事情要處理。

例如說要過濾 src，那 src 裡面的網址要不要過濾？如果是 `data:` 要拿掉嗎？那 srcdoc 呢，是不是也要重新過濾？這個 issue 還在 open 的狀態，已經一年多沒有動靜了。

在 [Sanitizer API 的 spec](https://wicg.github.io/sanitizer-api/#baseline-elements) 中有定義了一系列的 baseline element 跟 baseline attribute 的 allow list，因為很長一串我就不貼上來了，如果你想新增的元素或是屬性沒有在這個清單中，那「無論如何」都沒辦法用。

這應該算是 Sanitizer API 的優點也是缺點，雖然不夠彈性，但優點就是不管怎麼用都不會出事，不像我們以前介紹過的第三方套件，如果設定沒有調好的話，是有可能出事的。

現在 Sanitizer API 還在相對早期的階段，或許等未來有一天所有主流瀏覽器都支援了 Sanitizer API，而且可以實現你想要的 feature，再來考慮是否切換過去。

雖然現在我還是推薦使用 DOMPurify 來做 sanitize，但先了解一下 Sanitizer API 也不錯。

想知道更多使用方法的話，可以參考 Google 寫的 [Safe DOM manipulation with the Sanitizer API](https://web.dev/sanitizer/)

## Trusted Types

Trusted Types 跟 Sanitizer API 一樣很新，而且目前只有 Chromium based 的瀏覽器有支援，所以一樣是先看看就好，還沒有到很成熟。

在前端 render 使用者的資料時，我們需要時時刻刻注意使用者的輸入有沒有經過 escape，才能確保不會有 XSS 的漏洞。然而，有很多地方都可能會出事，例如說 `innerHTML`、`<iframe srcdoc>` 或者是 `document.write` 等等，如果把沒有經過處理的輸入直接丟給它們，就形成了一個 XSS 漏洞。

除了讓開發者在撰寫程式碼時小心謹慎，還有沒有其他方法可以防止這些地方出錯呢？例如說，假設我在執行 `div.innerHTML = str`，而且 str 是還沒處理過的字串的話，就拋出錯誤並且停止執行，這樣就能減少 XSS 的發生了。

有，這就是 Trusted Types 在做的事情。

在 CSP 裡面新增 Trusted Types 之後就能啟動 Trusted Types 來保護這些 DOM API，強制瀏覽器在插入 HTML 時一定要先經過 Trusted Types 的處理：

```
Content-Security-Policy: require-trusted-types-for 'script';
```

範例如下：

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

上面的程式碼在執行時會拋出錯誤，內容為：

> This document requires 'TrustedHTML' assignment. Uncaught TypeError: Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment.

當強制啟用 Trusted Types 以後，就不能直接丟一個字串給 `innerHTML`，而是要創立一個新的 Trusted Types policy 來處理危險的 HTML，用法是這樣的：

``` html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="require-trusted-types-for 'script'">
</head>
<body>
  <div id=content></div>
  <script>
    // 新增一個 policy
    const sanitizePolicy = trustedTypes.createPolicy('sanitizePolicy', {
      // 決定你要怎麼做 sanitize/escape
      createHTML: (string) => string
        .replace(/</g, "&lt;")
        .replace(/>/g, '&gt;')
    });
    // 回傳的 safeHtml 型態為 TrustedHTML，不是字串
    const safeHtml = sanitizePolicy.createHTML('<h1>hello</h1>')
    document.querySelector("#content").innerHTML = safeHtml
  </script>
</body>
</html>
```

Trusted Types 的功用並不是「確定你的 HTML 沒問題」，而是「強制在有可能出問題的 DOM API 使用 Trusted Types，不能使用字串」，如此一來就降低了很多風險。當你不小心忘記處理使用者的輸入時，瀏覽器就會直接拋出錯誤，不會把未處理過的字串當作 HTML 直接 render 出來。

因此，啟動之後你只要關心 `createHTML` 的實作，確保這些實作沒問題即可，而且從上面的範例也可以看出 `createHTML` 的內容是由我們自己決定的，所以也可以跟 DOMPurify 結合。

那跟 Sanitizer API 結合呢？也是可以的，但目前瀏覽器還不支援，而且這也是[官方文件](https://github.com/WICG/sanitizer-api/blob/main/faq.md#can-i-use-the-sanitizer-api-together-with-trusted-types)中推薦的方法：

> Can I use the Sanitizer API together with Trusted Types?
> 
> Yes, please. We see these as APIs that solve different aspects of the same problem. They are separate, but should work well together.
> Details of Santizer API/Trusted Types integration are still being worked out.

## 小結

在這篇裡面我們看到了兩個新的 API：Sanitizer 跟 Trusted Types，這兩個 API 其實對前端資安的意義滿重大的，代表說瀏覽器主動開始提供了 sanitize 的支援，讓我們開發者能夠有更多道的防線去阻止攻擊。

雖說這兩個 API 還沒有很成熟，但在不遙遠的未來，或許可以看到他們慢慢變成主流，而且有些前端框架也已經跟上了腳步，像是 [Angular](https://angular.io/guide/security#enforcing-trusted-types) 或是 [Next.js](https://github.com/vercel/next.js/issues/32209) 等等，都有在討論或是已經有了對於 Trusted Types 的支援。

如果你想搶先在 production 試用 Trusted Types，可以用這個 w3c 提供的 polyfill：https://github.com/w3c/trusted-types
