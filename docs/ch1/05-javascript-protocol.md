---
sidebar_position: 5
---

# 危險的 javascript: 偽協議

前一篇中有提到各種 XSS 情境以及執行程式碼的方式，講到了一種叫做 javascript: 偽協議的東西，我覺得這個就算放在現代前端的角度來看，也是開發者需要特別留意的一環。

因此，值得特別寫一篇來好好講講。

在開始之前，先來解答上一篇的腦力激盪。在 `innerHTML` 的注入點裡面，`<script>` 是不會被執行的，然而，可以搭配上 iframe 來使用。

`iframe` 的 `srcdoc` 屬性可以放入完整的 HTML，可以想成是建立一個全新的網頁，因此原本沒用的 `<script>` 標籤放在這邊就有用了，而且因為是屬性，所以內容可以先做編碼，意思是一樣的：

``` js
document.body.innerHTML = '<iframe srcdoc="&lt;script>alert(1)&lt;/script>"></iframe>'
```

因此，就算注入點是 `innerHTML`，也能使用 `<iframe srcdoc>` 外加 `<script>` 執行程式碼。

接下來就邁入這篇的主題：「javascript: 偽協議」。

## 什麼是 javascript: 偽協議？

偽協議的英文原名是 pseudo protocol，就是虛擬碼 pseudo code 的那個 pseudo。

比起 HTTP、HTTP 或是 FTP 這些「真協議」，偽協議的意思比較像是與網路無關的特殊協議，例如說 `mailto:` 或是 `tel:` 也都算是偽協議的一種。

而 javascript: 偽協議之所以特殊，就是因為可以利用它來執行 JavaScript 程式碼。

## 哪些地方可以使用 javascript: 偽協議？

第一個是前一篇中提過的 href：

``` html
<a href=javascript:alert(1)>Link</a>
```

只要使用者點了連結就會「XSS，啟動！」。

第二個是 `<iframe>` 的 src：

``` html
<iframe src=javascript:alert(1)></iframe>
```

這個跟 `<a>` 的範例不一樣，不需要使用者做任何操作就會觸發。

最後，`<form>` 的 `action` 其實也可以放入同樣的東西，`<button>` 的 `formaction` 也是，而這兩者都跟 `<a>` 一樣需要點一下才會觸發：

``` html
<form action=javascript:alert(1)>
  <button>submit</button>
</form>

<form id=f2>
</form>
<button form=f2 formaction=javascript:alert(2)>submit</button>
```

## 為什麼它很危險？

因為它是很常被忽略的一塊，而且它的注入點在實際應用中也很常被使用到。

舉例來說，如果網站上有個功能可以讓使用者在發文時填入 YouTube 影片網址，並且在文章中自動嵌入，然後寫這個功能的人又沒有太多資安意識，就會寫成這樣：

``` php
<iframe src="<?= $youtube_url ?>" width="500" height="300"></iframe>
```

我只要把 `javascript:alert(1)` 當作是 YouTube 網址填入，就是一個 XSS 漏洞了。就算加上了網址內是否包含 `youtube.com` 的檢查，也可以用 `javascript:alert(1);console.log('youtube.com')`繞過。

正確方式是檢查網址是否為 YouTube 影片的格式，並且要確保網址是以 `https://` 開頭。

如果你覺得上面的功能不太常見，那在 profile 頁面填入自己的 blog 或是 facebook 網址，並且在頁面上加個超連結，這功能就常見了吧！

這塊就是很容易被忽略的地方，我自己就曾在 [Hahow](https://zeroday.hitcon.org/vulnerability/ZD-2020-00903) 中發現這個漏洞：

![](pics/05-01.png)

後端的實作寫成程式碼的話會類似這樣：

``` php
<a href="<?php echo htmlspecialchars($data) ?>">link</a>`
```

儘管把 `<>";` 都做了編碼，沒辦法新增標籤，也沒辦法跳脫雙引號新增屬性，但攻擊者依舊可以插入 `javascript:alert(1)`，因為這裡面完全沒有任何不合法的字元。

另外，現在的前端框架基本上都會自動幫你做好跳脫，沒有在 React 裡面使用 `dangerouslySetInnerHTML` 或是在 Vue 裡面使用 `v-html` 的話，基本上都是沒什麼問題的，但是 `href` 就不同了，理由同上，它的內容是沒問題的。

因此，如果你在 React 裡面這樣寫是會出事的：

``` jsx
import React from 'react';

export function App(props) {
  // 假設底下的資料是來自於使用者
  const href = 'javascript:alert(1)'
  return (
    <a href={href}>click me</a>
  );
}
```

這就是一個 XSS 的漏洞，一點下去就可以執行程式碼。

不過 React 在 v16.9 的時候有針對這個行為新增警告，在文件裡面也有說明：[Deprecating javascript: URLs](https://legacy.reactjs.org/blog/2019/08/08/react-v16.9.0.html#deprecating-javascript-urls)，警告的內容是：

> Warning: A future version of React will block javascript: URLs as a security precaution. Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead.

在 React GitHub 的 issue 裡面也有更多的討論：

1. [React@16.9 block javascript:void(0); #16592](https://github.com/facebook/react/issues/16592)
2. [False-positive security precaution warning (javascript: URLs) #16382](https://github.com/facebook/react/issues/16382)

而 Vue 的話則是可以這樣寫：

``` js
<script setup>
import { ref } from 'vue'

const link = ref('javascript:alert(1)')
</script>

<template>
  <a :href="link">click me</a>
</template>
```

一樣可以成功執行 JavaScript，而這個攻擊方式在 Vue 的文件裡面有提到，叫做 [URL Injection](https://vuejs.org/guide/best-practices/security.html#potential-dangers)，推薦使用者在後端就應該要把 URL 做驗證以及處理，而不是等到前端才來處理。

如果要在前端處理的話，有提到可以用 [sanitize-url](https://github.com/braintree/sanitize-url) 這一套 library。

## 頁面跳轉也有風險

有許多網站都會實作一個「登入後重新導向」的功能，把使用者導到登入前原本想造訪的頁面，像這樣：

``` js
const searchParams = new URLSearchParams(location.search)
window.location = searchParams.get('redirect')
```

那請問這樣的程式碼有什麼問題？

問題就是，`window.location` 的值也可以是 javascript: 偽協議！

``` js
window.location = 'javascript:alert(document.domain)'
```

執行上面這一段程式碼之後，就會看到一個熟悉的 alert 視窗出現。這個模式是前端工程師們比較需要注意的，如同我前面講過的，重新導向本來就是一個很常見的功能，在實作的時候絕對要注意這個問題，避免寫出有問題的程式碼。

像我之前就在另一個叫做 Matters News 的網站發現過這個漏洞，

這是他們的登入頁面：

![](pics/05-02.png)

在點下登入之後，會呼叫一個叫做 `redirectToTarget` 的 function，而這個函式的程式碼是這樣：

``` js
/**
 * Redirect to "?target=" or fallback URL with page reload.
 *
 * (works on CSR)
 */
export const redirectToTarget = ({
  fallback = 'current',
}: {
  fallback?: 'homepage' | 'current'
} = {}) => {
  const fallbackTarget =
    fallback === 'homepage'
      ? `/` // FIXME: to purge cache
      : window.location.href
  const target = getTarget() || fallbackTarget

  window.location.href = decodeURIComponent(target)
}
```

在拿到 target 之後直接使用了：`window.location.href = decodeURIComponent(target)` 來做重新導向。而 `getTarget` 其實就是去 query string 把 target 的值拿出來。所以如果登入的網址是：`https://matters.news/login?target=javascript:alert(1)`，在使用者按下登入並且成功之後，就會跳出一個 alert，觸發 XSS！

不僅如此，這個 XSS 一旦被觸發了，影響力非同小可，因為這是登入頁面，所以在這個頁面上執行的 XSS，可以直接抓取 input 的值，也就是偷到使用者的帳號密碼。如果要執行實際的攻擊，可以針對網站的使用者寄發釣魚信，在信中放入這個惡意連結讓使用者點擊，由於網址是正常的網址，點擊之後到的頁面也是真的網站的頁面，因此可信程度應該滿高的。

在使用者輸入帳號密碼並且登入之後，用 XSS 把帳號密碼偷走並把使用者導回首頁，就可以不留痕跡地偷走使用者帳號，達成帳號奪取。

總之呢，我認為大家對 XSS 的基本概念都很熟悉了，但是對於這個 javascript: 偽協議的攻擊面可能還沒這麼熟，所以特別提出來講，以後碰到這些屬性時就可以多留意一下，做好該做的防禦。

## 防禦方式

首先，如果有像是上面講的 [sanitize-url](https://github.com/braintree/sanitize-url) 這種 library 的話是再好不過了，雖然是不是百分之百沒風險，但至少比較多人用，比較身經百戰，有些問題跟繞過方式可能都已經修掉了。

你想自己處理嗎？不是不行，但我們來看自己處理通常會發生什麼事。

既然攻擊的字串為 `javascript:alert(1)`，可能有些人想說那我就判斷開頭是不是 `javascript:` 就好，或是把字串中的 `javascript` 全部移除。

但這樣是行不通的，因為這是 href 屬性的內容，而 HTML 裡面的屬性內容是可以經過編碼的，也就是說，我可以這樣做：

``` html
<a href="&#106avascript&colon;alert(1)">click me</a>
```

裡面完全沒有我們想過濾的內容，也不是以 `javascript:` 開頭，所以可以繞過限制。

比較好的判斷方式是只允許 `http://` 跟 `https://` 開頭的字串，基本上就不會有事。而有些更嚴謹的會利用 JavaScript 去解析 URL，像這樣：

``` js
console.log(new URL('javascript:alert(1)'))
/*
  {
    // ...
    href: "javascript:alert(1)",
    origin: "null",
    pathname: "alert(1)",
    protocol: "javascript:",
  }
*/
```

就能根據 protocol 判斷是否為合法的協議，來阻擋名單之外的內容。

而有個常見的錯誤判斷方式一樣會利用 URL 來解析，但卻是看 hostname 或是 origin 等等：

``` js
console.log(new URL('javascript:alert(1)'))
/*
  {
    // ...
    hostname: "",
    host: "",
    origin: null
  }
*/
```

當 `hostname` 或是 `host` 為空的時候，就代表是不合法的網址。這樣的方式雖然乍看之下沒問題，但我們可以利用 `//` 在 JavaScript 中是註解的特性，搭配換行字元來做出一個看起來像網址，但其實是 javascript: 偽協議的字串：

``` js
console.log(new URL('javascript://huli.tw/%0aalert(1)'))
/*
  {
    // ...
    hostname: "",
    host: "",
    origin: null
  }
*/
```

雖然看起來很像網址，但是在 Chrome 上面沒有問題，不會誤判，可是 Safari 就不同了，同樣的程式碼在 Safari 16.3 上面執行，輸出結果是：

``` js
console.log(new URL('javascript://huli.tw/%0aalert(1)'))
/*
  {
    // ...
    hostname: "huli.tw",
    host: "huli.tw",
    origin: "null"
  }
*/
```

在 Safari 上面，就可以成功解析出 hostname 以及 host。順帶一提，我是從 [Masato](https://twitter.com/kinugawamasato/status/1636406640042971136) 的推文學到這一招的。

如果真的很想用 RegExp 來判斷是不是 javascript: 偽協議的話，可以參考 React 的[實作](https://github.com/facebook/react/blob/v18.2.0/packages/react-dom/src/shared/sanitizeURL.js#L22)（很多 library 都用了一樣的 RegExp）：

``` js
// A javascript: URL can contain leading C0 control or \u0020 SPACE,
// and any newline or tab are filtered out as if they're not part of the URL.
// https://url.spec.whatwg.org/#url-parsing
// Tab or newline are defined as \r\n\t:
// https://infra.spec.whatwg.org/#ascii-tab-or-newline
// A C0 control is a code point in the range \u0000 NULL to \u001F
// INFORMATION SEPARATOR ONE, inclusive:
// https://infra.spec.whatwg.org/#c0-control-or-space

/* eslint-disable max-len */
const isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
```

從這個正規表達式中也可以看出 javascript: 的自由性，在開頭之前可以加上一些字元，甚至在每個字串中間也可以加上無限數量的換行跟 tab，這就是為什麼我說要自己做判斷的話是很難的，因為一定要先看過 spec 才能整理出這些行為。

除了剛剛提到的這些，其實只要加個 `target="_blank"` 就有大大的效果，因為很多瀏覽器已經處理好這個問題了。

在 Chrome 當你點了連結時，會新開一個網址為 `about:blank#blocked` 的分頁，在 Firefox 會新開一個沒有網址的分頁，在 Safari 則是什麼事情都不會發生，在這三個桌面瀏覽器上都不會執行 JavaScript。

測試版本為 Chrome 115、Firefox 116 以及 Safari 16.3。

而在真實世界中，確實也是大多數的連結都有加上 `target="_blank"` 這個屬性。

不過如果使用者不是用左鍵點擊連結，而是用滑鼠的中鍵，這情況可能就不一樣了，因此無論如何，都應該把 root cause 修掉，而不是依賴瀏覽器的保護。

更多細節可以參考：[The curious case of XSS and the mouse middle button.](http://blog.dclabs.com.br/2021/05/the-curious-case-of-xss-and-mouse.html) 以及 [Anchor Tag XSS Exploitation in Firefox with Target=”_blank”](https://soroush.me/blog/2023/08/anchor-tag-xss-exploitation-in-firefox-with-target_blank/)

## 實際案例

我們來看一個不久前（2023 年 6 月）在通訊軟體 Telegram 網頁版被發現的漏洞，就是跟 javascript: 偽協議有關，出處是 Slonser 的文章 [История одной XSS в Telegram](https://habr.com/ru/articles/744316/)（文章是俄文的）。

在 Telegram Web A（Telegram 有不只一個網頁版）中，有一個 `ensureProtocol` 的函式，會負責確認一個 URL 有沒有 `://`，沒有的話就自動加上 `http://`：

``` js
export function ensureProtocol(url?: string) {
  if (!url) {
    return undefined;
  }
  return url.includes('://') ? url : `http://${url}`;
}
```

要繞過這個檢查很簡單，只要 `javascript:alert('://')` 之類的就行了，就可以成功使用 javascript: 偽協議，但問題是除此之外，也會在伺服器解析這個 URL 到底是不是合法的網址，而剛剛的字串顯然不是。

而 URL 本來最前面就可以帶上帳號跟密碼（做 HTTP Authentication 的時候會用到），中間就是用 `:` 來分隔的，像是這樣：

```
https://username:password@www.example.com/
```

因此 Slonser 發現了可以用這個字串來繞過檢查：

```
javascript:alert@github.com/#://
```

最前面的 `javascript` 是帳號，`alert` 是密碼，而 hostname 是 `github.com`，雖然說最前面沒有 `http://` 或是 `https://`，但伺服器依然會認為是一個合法的網址。

最後搭配 URL 編碼，產生出一個密碼只有合法字元的網址：

```
javascript:alert%28%27Slonser%20was%20here%21%27%29%3B%2F%2F@github.com#;alert(10);://eow5kas78d0wlv0.m.pipedream.net%27

// after decoded
javascript:alert('Slonser was here!');//@github.com#;alert(10);://eow5kas78d0wlv0.m.pipedream.net'
```

上面的字串會被伺服器判定是一個連結，而在 client 也可以繞過 `://` 的檢查，只要使用者點擊這個連結，就會觸發 XSS。

而後來 Telegram 修復的方式就是我前面講的，用 URL 檢查並且確保 protocol 不是 javascript:，[Link: Fix protocol verification (#3417)](https://github.com/Ajaxy/telegram-tt/commit/a8d025395bc0032d964c2afc8c4fb5d2fa631a44)：

``` js
export function ensureProtocol(url?: string) {
  if (!url) {
    return undefined;
  }

  // HTTP was chosen by default as a fix for https://bugs.telegram.org/c/10712.
  // It is also the default protocol in the official TDesktop client.
  try {
    const parsedUrl = new URL(url);
    // eslint-disable-next-line no-script-url
    if (parsedUrl.protocol === 'javascript:') {
      return `http://${url}`;
    }

    return url;
  } catch (err) {
    return `http://${url}`;
  }
}
```

## 小結

在這篇裡面我們看到了 javascript: 偽協議可怕的地方，它可以被放在 `<a>` 的 `href` 裡面，而這偏偏又是很常見的使用情況，再者，開發者也時常會忘記這邊可能會出事，或是根本不知道這件事，最後就導致了漏洞的發生。

儘管在大多數狀況底下，超連結都是新開分頁，因此最終不會執行 JavaScript 程式碼，但難保有些地方的行為不同（沒有加 target），或是瀏覽器比較舊以及用其他方式開啟分頁等等，對使用者來說就是一個風險。

另外，在做重新導向時也需要注意 javascript: 偽協議的問題，如果沒有特別防止的話，就是一個 XSS 漏洞。

身為開發者，還是需要時時刻刻留意這些問題，並且在程式碼中做適當的處理，就如同那句千古名言：

> 永遠不要相信來自使用者的輸入

最後留一個小問題給大家，底下的程式碼有什麼問題？不一定是 XSS，只要是有資安上的問題都算：

``` js
// 這是一個可以在 profile 頁面嵌入自己 YouTube 影片的功能
const url = 'value from user'

// 確保是 YouTube 影片網址的開頭
if (url.startsWith('https://www.youtube.com/watch')) {
  document.querySelector('iframe').src = url
}
```

參考資料：[在做跳轉功能時應該注意的問題：Open Redirect](https://blog.huli.tw/2021/09/26/what-is-open-redirect/)
