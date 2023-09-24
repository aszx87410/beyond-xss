---
sidebar_position: 4
---

# 再多了解 XSS 一點點

上一篇中有提到針對不同的情境，攻擊者會需要調整 XSS payload 才能確保效果，例如說注入點在 `innerHTML` 的話，用 `<script>alert(1)</script>` 就起不了任何作用。因此，我們必須多了解 XSS 一點點，才能知道到底有哪些方式可以攻擊。

學習攻擊，就是學習防禦，必須先知道怎麼攻擊才知道怎麼防禦，才能防得澈底、防得有效率。

## 能夠執行 JavaScript 的方式

當你能夠掌控 HTML 以後，有很多種方式可以執行 JavaScript。

最常見的一種莫過於 `<script>` 標籤，但這種的缺點之一就是很容易被 WAF（Web Application Firewall），網站用的防火牆所識別出來，之二是上一篇提過的，在 `innerHTML` 的情境下不管用。

除了 `<script>`，我們也可以用其他標籤搭配 inline event handler 來執行程式碼，例如說：

``` html
<img src="not_exist" onerror="alert(1)">
```

載入一張不存在的圖片，並且利用 `onerror` 的方式去執行程式碼。

其實很多人（包括我），src 都會寫成 `x`，因為好寫好記嘛，而且通常 `x` 這個路徑不會存在，但如果存在的話 `onerror` 就不會被觸發。因此有個笑話是可以在網站根目錄放一張叫做 `x` 的圖片，有些攻擊者可能就不會發現網站有 XSS 漏洞。

除了 `onerror` 以外，只要是 event handler，都是可以利用的對象，像這樣：

``` html
<button onclick="alert(1)">拜託點我</button>
```

只要點了按鈕之後就會彈出 alert。不過這種的差別在於「使用者必須做一些動作」才能觸發 XSS，例如說點擊按鈕，而前面 img 的案例使用者什麼也不用做，XSS 就會被觸發了。

如果想要更短的，可以用 `svg` 的 `onload` 事件：

``` html
<svg onload="alert(1)">
```

這邊補充一些小知識，在 HTML 中屬性的 `"` 不是必要的，如果你的內容沒有空格，基本上拿掉也無妨，甚至連標籤跟屬性間的空格都可以用 `/` 取代，因此 svg 的 payload 可以寫成這樣：

``` html
<svg/onload=alert(1)>
```

不需要空格也不需要雙引號跟單引號，就可以構造出一個 XSS 的 payload。

常見會被拿來利用的 event handler 有：

1. onerror
2. onload
3. onfocus
4. onblur
5. onanimationend
6. onclick
7. onmouseenter

除了 on 開頭的這些 event handler 以外，還有一種方式可以執行程式碼，有寫過前端的可能有看過：

``` html
<a href=javascript:void(0)>Link</a>
```

這是為了讓元素點下去以後沒有任何反應，從這個範例也可以看出我們能利用 href 來執行程式碼，像這樣：

``` html
<a href=javascript:alert(1)>Link</a>
```

總結一下，在 HTML 中想要執行 JavaScript 的話基本上有以下幾種方式：

1. `<script>` 標籤
2. 屬性中的 event handler（都會是 `on` 開頭）
3.`javascript:` 偽協議

知道這些方式以後，就可以搭配不同的情境來做使用。

如果想知道更多的 payload，可以參考 [Cross-site scripting (XSS) cheat sheet](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)，裡面有各式各樣的 payload。

## 不同情境的 XSS 以及防禦方式

通常我們會把可以植入 payload 的地方稱為注入點，以底下這段程式碼而言：

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

注入點就在 `document.querySelector('#name').innerHTML = name` 這行。

不同的注入點，會影響到怎麼攻擊以及怎麼防禦，以下簡單分類出三個不同的情境。

### 注入 HTML

這個是最常見的狀況了，無論是上面的案例或是底下的 PHP 都一樣：

``` php
<?php
 echo "Hello, <h1>" . $_GET['name'] . '</h1>';
?>
```

這兩種案例都是直接給你一塊空白的 HTML 讓你去操作，因此可以直接寫入任何想要的元素，非常自由。

舉例來說，用 `<img src=not_exist onerror=alert(1)>` 這個非常常見的 payload 就能執行 JavaScript。

而防禦方法就是把使用者輸入中的 `<` 跟 `>` 全部取代掉，它就沒有辦法插入新的 HTML 標籤，就沒辦法做到任何事情。

### 注入屬性

有時候你會看到底下的程式碼，輸入的內容是做為某個屬性的值，被包在屬性裡面的：

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

這時候如果還是用上面的 `<img src=not_exist onerror=alert(1)>` 就會不起作用，因為輸入的值是屬性的內容。

想要執行 XSS 的話，可以先跳脫這個屬性並且關閉標籤，像是這樣：`"><img src=not_exist onerror=alert(1)>`，如此一來，整段 HTML 就會變成：

``` html
<div class=""><img src=not_exist onerror=alert(1)>">
  Demo
</div>
```

跳脫屬性以後，就可以插入我們想要的 HTML 標籤了。

從這個案例中可以看出為什麼我說了情境很重要，如果你以為 XSS 都是剛剛提的第一種情境並且只處理了 `<>` 這兩個字元，在這個情境下就會失效，因為攻擊者可以不透過新的標籤來攻擊。

例如說利用 `" tabindex=1 onfocus="alert(1)" x="` 這個完全不含有 `<>` 的 payload，HTML 會變成：

``` html
<div class="" tabindex=1 onfocus="alert(1)" x="">
  Demo
</div>
```

與新增 HTML 標籤不同，這種攻擊方式利用了原本 div 標籤的 `onfocus` 事件來執行 XSS。所以在做過濾的時候，除了 `<>` 以外，需要連 `'` 跟 `"` 也一起編碼。

另外，這也是為什麼應該避免寫出這樣的程式碼：

``` js
document.querySelector('#content').innerHTML = `
  <div class=${clazz}>
    Demo
  </div>
```

上面的屬性沒有用 `"` 或是 `'` 包起來，因此就算我們以為有做了防護，把 `<>"'` 這些字元都做了編碼，攻擊者還是可以透過空格來新增其他屬性。

### 注入 JavaScript

除了 HTML 以外，有些時候使用者的輸入甚至會反映在 JavaScript 裡面，例如說：

``` php
<script>
  const name = "<?php echo $_GET['name'] ?>";
  alert(name);
</script>
```

如果單看這一段程式碼，或許有些人以為只要編碼 `"` 就夠了，因為這樣就沒辦法跳出字串嘛。但這樣做是有問題的，因為可以利用 `</script>` 先把標籤關掉，再注入其他的標籤等等。

所以這個情境還是要跟之前一樣，把 `<>"'` 都做編碼，讓攻擊者沒辦法跳脫字串。

但儘管如此，仍需要注意的是如果在輸入裡面加一個空行，就會因為換行導致整段程式碼無法執行，出現 `SyntaxError`。

那如果是這種情況呢：

``` php
<script>
  const name = `
    Hello,
    <?php echo $_GET['name'] ?>
  `;
  alert(name);
</script>
```

此時就可以利用 `${alert(1)}` 的方式來注入 JavaScript 程式碼，達成 XSS。雖然說前端工程師光用看的都知道這樣會出事，但不一定每個工程師都會注意到，說不定這一段是由後端工程師寫的，寫的時候只是想說：「同事跟我說要用多行字串的話就用這個符號」，根本沒注意到它的含義以及可能帶來的危險。

## 小結

在這篇文章裡面我們多認識了 XSS 一些，知道了有哪些方式可以執行 JavaScript，也知道不同的情境之下，需要做的防護也不同。

但是，把 `<>"'` 都做編碼就能保證一定安全嗎？這就不一定了。

有一種很常被忽略的狀況，在這篇裡面有稍微點到但沒有仔細講，我們留到下一篇再來說個清楚。

在進入到下一篇之前，先來個腦力激盪，前面我有提過基本上有三種方式可以執行 JavaScript：

1. `<script>` 標籤
2. 屬性中的 event handler（都會是 `on` 開頭）
3. `javascript:` 偽協議

而第一種如果是 `innerHTML = '<script>alert(1)</script>'` 是不起作用的。

那如果不能用 event handler 也不能用 `javascript:` 偽協議，而注入點又是 `innerHTML = data`，還有什麼方式可以執行 script 呢？大家可以想想看。
