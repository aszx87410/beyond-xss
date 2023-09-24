---
sidebar_position: 23
---

# 跨站請求偽造 CSRF 一點就通

前面我們提到了 CORS，跨來源的資料共享，也提到了 CORS 如果設置錯誤，可以讓攻擊者讀取到使用者的個人資料或其他機密資料等等，重點在於「讀取」。

而有另外一個原理類似的攻擊，叫做 CSRF，全名為 Cross-Site Request Forgery，又稱為跨站請求偽造，它的重點在於「執行操作」。

我們先來從一個簡單的範例中學習什麼是 CSRF 吧！

## 從偷懶的刪除功能開始介紹 CSRF

以前我有做過一個簡單的後台頁面，就想成是一個部落格吧！可以發表、刪除以及編輯文章，介面大概長得像這樣：

![](pics/23-01.png)

可以看到刪除的那個按鈕，點下去之後就可以把一篇文章刪掉。

要實作這個功能有很多種方式，例如說點了之後打 API 啦，或是點了之後直接送出一個表單等等，而我選擇了一個更簡單的方式。

因為想偷懶的緣故，想說如果我把這個功能做成 GET，就可以直接用一個連結完成刪除這件事，在前端幾乎不用寫到任何程式碼：

``` html
<a href='/delete?id=3'>刪除</a>
```

很方便對吧？然後我在網頁後端那邊做一下驗證，驗證 request 有沒有帶 session id 上來，也驗證這篇文章是不是這個 id 的作者寫的，都符合的話才刪除文章。

聽起來該做的都做了啊，我都已經做到：「只有作者本人可以刪除自己的文章」了，應該很安全了，難道還有哪裡漏掉了嗎？

沒錯，在權限檢查的部分確實是「只有作者本人可以刪除自己的文章」，但如果他不是自己「主動刪除」，而是在不知情的情況下刪除呢？你可能會覺得我在講什麼東西，怎麼會有這種事情發生，不是作者主動刪的還能怎麼刪？

好，我就來讓你看看還能怎麼刪！

今天假設小黑是一個邪惡的壞蛋，想要讓小明在不知情的情況下就把自己的文章刪掉，該怎麼做呢？

他知道小明很喜歡心理測驗，於是就做了一個心理測驗網站，並且發給小明。但這個心理測驗網站跟其他網站不同的點在於，「開始測驗」的按鈕長得像這樣：

``` html
<a href='https://small-min.blog.com/delete?id=3'>開始測驗</a>
```

小明收到網頁之後很開心，就點擊「開始測驗」。點擊之後瀏覽器就會發送一個 GET 請求給`https://small-min.blog.com/delete?id=3`，並且因為瀏覽器的運行機制，一併把 `small-min.blog.com` 的 cookie 都一起帶上去。

伺服器收到之後檢查了一下 session，發現是小明，而且這篇文章也真的是小明發的，於是就把這篇文章給刪除了。

這就是 CSRF，跨站請求偽造。

你現在明明在心理測驗網站，假設是 `https://test.com` 好了，但是卻在不知情的狀況下刪除了 `https://small-min.blog.com` 的文章，你說這可不可怕？超可怕！

這也是為什麼 CSRF 又稱作 one-click attack 的緣故，只要點一下就中招了。

有些看得比較仔細的人可能會說：「可是這樣小明不就知道了嗎，不就連過去部落格了？不符合『不知情的狀況』啊！」

這些都是小問題，如果改成這樣呢：

``` html
<img src='https://small-min.blog.com/delete?id=3' width='0' height='0' />
<a href='/test'>開始測驗</a>
```

在開啟頁面的同時，用看不到的圖片偷偷發送一個刪除的 request 出去，這次小明是真的完全不知道這件事情，這樣就符合了吧！

從這個簡單的案例中我們可以清楚地看到 CSRF 的原理跟攻擊方式。

CSRF 攻擊想達成的目的就是「在其他網站底下對目標網站送出一個請求，讓目標網站誤以為這請求是使用者自己發出的，但其實不是」

要達成這件事的前提跟瀏覽器的機制有關，你只要發送 request 給某個網站，就會把關聯的 cookie 一起帶上去。如果使用者是登入狀態，那這個 request 就理所當然包含了他的資訊（例如說 session id），這 request 看起來就像是使用者本人發出的。

畢竟伺服器通常也沒有在管你是誰的，它只認 cookie，或更精確一點只認 cookie 裡面帶的資訊，從 A 網站對 B 網站發 request，會帶上 B 的 cookie，從 C 網站對 B 網站發 request，也會帶上 B 的 cookie，這就是 CSRF 之所以可以成立的關鍵。

但其實上面的案例有個問題，那就是：「我把刪除改成 POST 不就好了嗎？」

沒錯，聰明！我們不要那麼懶，好好把刪除的功能做成 POST，這樣不就無法透過 `<a>` 或是 `<img>` 來攻擊了嗎？除非，有哪個 HTML 元素可以發送 POST request。

有，正好有一個，就叫做 `<form>`。

``` html
<form action="https://small-min.blog.com/delete" method="POST">
  <input type="hidden" name="id" value="3"/>
  <input type="submit" value="開始測驗"/>
</form>
```

小明點下去以後，照樣中招，一樣刪除了文章。上次是透過看不到的圖片，這次是透過表單。

你可能又會疑惑說，但是這樣小明不就知道了嗎？我跟你一樣很疑惑，於是我 Google 到了這篇：[Example of silently submitting a POST FORM (CSRF)](http://stackoverflow.com/questions/17940811/example-of-silently-submitting-a-post-form-csrf)

這篇提供的範例如下，網頁的世界真是博大精深：

``` html
<iframe style="display:none" name="csrf-frame"></iframe>
<form method='POST' action='https://small-min.blog.com/delete' target="csrf-frame" id="csrf-form">
  <input type='hidden' name='id' value='3'>
  <input type='submit' value='submit'>
</form>
<script>document.getElementById("csrf-form").submit()</script>
```

開一個看不見的 iframe，讓 form submit 之後的結果出現在 iframe 裡面，而且這個 form 還可以自動 submit，完全不需要經過小明的任何操作。

到了這步，你就知道改成 POST 是沒用的，一樣會有 CSRF 問題。

於是聰明的你靈機一動：「既然在前端只有 form 可以送出 POST 的話，那我的 API 改成用 JSON 格式收資料不就可以了嗎？這樣總不能用 form 了吧！」

以 HTML 的 form 來說，`enctype` 只支援三種：

1. `application/x-www-form-urlencoded`
2. `multipart/form-data`
3. `text/plain`

大多數狀況下都會使用第一種，而上傳檔案的情形是第二種，第三種則比較少用到。如果要在伺服器端解析 JSON 的話，通常 content type 都會是 `application/json`。

所以這句話對了一半，對有些伺服器來說，如果 request 的 content type 不是 `application/json`，它是會拋出錯誤的，不會認為這是一個合法的 request。

而錯的那一半則是因為對另外一些伺服器來講，只要 body 內容是 JSON 格式，就算 content type 帶 `text/plain` 也是可以接受的，而 JSON 格式的 body 可以利用底下的表單拼出來：

``` html
<form action="https://small-min.blog.com/delete" method="post" enctype="text/plain">
<input name='{"id":3, "ignore_me":"' value='test"}' type='hidden'>
<input type="submit"
  value="delete!"/>
</form>
```

`<form>` 產生 request body 的規則是 `name=value`，所以上面的表單會產生的 request body 是：

``` js
{"id":3, "ignore_me":"=test"}
```

我們舉的例子是刪除文章，這你可能覺得沒什麼，那如果是銀行轉帳呢？攻擊者只要在自己的網頁上寫下轉帳給自己帳號的 code，再把這個網頁散佈出去就好，就可以收到一大堆錢。

講了這麼多，來講該怎麼防禦吧！先從最簡單的「使用者」開始講。

## 使用者的防禦

CSRF 攻擊之所以能成立，是因為使用者在被攻擊的網頁是處於已經登入的狀態，所以才能做出一些行為。雖然說這些攻擊應該由網頁那邊負責處理，但如果你真的很怕，怕網頁會處理不好的話，你可以在每次使用完網站就登出，就可以避免掉 CSRF。

不過使用者能做的其實很有限，真的該做事的是伺服器那邊才對。

## 伺服器的防禦

CSRF 之所以可怕是因為 CS 兩個字：Cross-site，你可以在任何一個網站底下發動攻擊。CSRF 的防禦就可以從這個方向思考，簡單來說就是：「我要怎麼擋掉從別的來源發的 request」

你仔細想想，CSRF 攻擊的 request 跟使用者本人發出的 request 有什麼區別？

區別在於 origin 的不同，前者是從任意一個 origin 發出的，後者是從同一個 origin 發出的（這邊假設你的 API 跟你的前端網站在同一個 origin），只要能在後端分辨出這一點，就能判別哪一個才是該相信的 request。

先來講一些沒這麼常見的防禦方式好了。

### 檢查 Referer 或是 Origin header

Request 的 header 裡面會帶一個欄位叫做 `referer`，代表這個 request 是從哪個地方過來的，可以檢查這個欄位看是不是合法的 origin，不是的話直接拒絕即可。

有些 request 也會帶上 `origin` 的 header，意思差不多，都是代表這個 request 是從哪邊發過來的。

但這個檢查方法要注意的地方有三個，第一個是在有些狀況下可能不會帶 referer 或是 origin，你就沒東西可以檢查了。

第二個是有些使用者可能會關閉帶 referer 的功能，這時候你的伺服器就會拒絕掉由真的使用者發出的 request。

第三個是判定是不是合法 origin 的程式碼必須要保證沒有 bug，例如：

``` js
const referer = request.headers.referer;
if (referer.indexOf('small-min.blog.com') > -1) {
  // pass
}
```

你看出上面這段的問題了嗎？如果攻擊者的網頁是`small-min.blog.com.attack.com`的話，你的檢查就被繞過了。

所以，檢查 `referer` 或是 `origin` 並不是一個很完善的解法。

### 加上圖形驗證碼或是簡訊驗證碼等等

就跟網路銀行轉帳的時候一樣，都會要你收簡訊驗證碼，多了這一道檢查就可以確保不會被 CSRF 攻擊。還有圖形驗證碼也是，攻擊者並不知道圖形驗證碼的答案是什麼，所以就不可能攻擊了。

雖然說這是一個很完善的解決方法，但會影響到使用者體驗。如果使用者每次留言都需要打一次圖形驗證碼，應該會煩死吧！

因此這個保護方式適合利用在重要操作的時候，例如說銀行的轉帳、會員的修改密碼或是查看自己的薪資單等等，都要再做一層驗證。而「收取簡訊驗證碼（或是收 email 之類的）」這種方法除了可以防止 CSRF 以外，也可以防止 XSS，就算駭客可以在頁面上執行程式碼，他還是沒辦法用你的手機或是 email 收取驗證碼，因此不知道驗證碼是什麼，就沒辦法進行後續操作。

## 常見的防禦方式

### 加上 CSRF token

要防止 CSRF 攻擊，我們其實只要確保有些資訊「只有網站自己知道」即可，那該怎麼做呢？

我們在 form 裡面加上一個隱藏的欄位，叫做 `csrf_token`，這裡面填的值由伺服器隨機產生，每一次表單操作都應該產生一個新的，並且存在伺服器的 session 資料中。

``` html
<form action="https://small-min.blog.com/delete" method="POST">
  <input type="hidden" name="id" value="3"/>
  <input type="hidden" name="csrf_token" value="fj1iro2jro12ijoi1"/>
  <input type="submit" value="刪除文章"/>
</form>
```

按下送出之後，伺服器比對表單中的 `csrf_token` 與自己 session 裡面存的是不是一樣的，是的話就代表這的確是由自己的網站發出的 request。

那為什麼可以防禦呢？因為攻擊者並不知道 `csrf_token` 的值是什麼，也猜不出來，所以不知道該帶什麼值，伺服器的檢查就會失敗，操作就不會被執行。

接著讓我們來看看另外一種解法。

### Double Submit Cookie

上一種解法需要伺服器的 state，亦即 CSRF token 必須被保存在伺服器當中，才能驗證正確性，而現在這個解法的好處就是完全不需要伺服器儲存東西。

這個解法的前半段與剛剛的相似，由伺服器產生一組隨機的 token 並且加在 form 上面。但不同的點在於，除了不用把這個值寫在 session 以外，同時也設定一個名叫 `csrf_token` 的 cookie，值也是同一組 token。

``` html
Set-Cookie: csrf_token=fj1iro2jro12ijoi1

<form action="https://small-min.blog.com/delete" method="POST">
  <input type="hidden" name="id" value="3"/>
  <input type="hidden" name="csrf_token" value="fj1iro2jro12ijoi1"/>
  <input type="submit" value="刪除文章"/>
</form>
```

正如同前面所提過的，CSRF 防禦的核心是「辨識出攻擊的 request 與正常的 request」，而 Double Submit Cookie 這個解法也是從這個想法出發。

當使用者按下送出的時候，伺服器比對 cookie 內的 `csrf_token` 與 form 裡面的 `csrf_token`，檢查是否有值並且相等，就知道是不是網站發的了。

為什麼這樣可以防禦呢？

假設現在攻擊者想要發起攻擊，根據前面講的 CSRF 原理，cookie 中的 `csrf_token` 會一起送到 server，但是表單裡面的 `csrf_token` 呢？攻擊者在別的 origin 底下看不到目標網站的 cookie，更看不到表單內容，因此他不會知道正確的值是什麼。

當表單跟 cookie 中的 `csrf_token` 不一致時，攻擊就會被擋下。

不過這個方法看似好用，也是有缺點的，這個之後會再提到。

### 純前端的 Double Submit Cookie

會特別提到前端，是因為我之前所碰到的專案是 Single Page Application，上網搜尋一下就會發現有人在問：「SPA 該如何拿到 CSRF token？」，難道要伺服器再提供一個 API 嗎？這樣好像有點怪怪的。

但是呢，我們可以利用 Double Submit Cookie 的精神來解決這個問題。而解決這問題的關鍵就在於：由前端來產生 CSRF token，就不用跟伺服器 API 有任何的互動。

其他的流程都跟之前一樣，產生之後放到 form 裡面以及寫進 cookie。

那為什麼由前端來產生這個 token 也可以呢？因為這個 token 本身的目的其實不包含任何資訊，只是為了「不讓攻擊者」猜出而已，所以由前端 還是後來來產生都是一樣的，只要確保不被猜出來即可。

Double Submit Cookie 的核心概念是：「攻擊者的沒辦法讀寫目標網站的 cookie，所以 request 中的 token 會跟 cookie 內的不一樣」，只要能滿足這個條件，就能阻擋攻擊。

## 其他解法

### 不要用 cookie 做身份驗證

CSRF 之所以成立，前提是瀏覽器在發送請求時會自動帶上 cookie，而且這個 cookie 是拿來做身份驗證的。

所以如果我們不用 cookie 來做身份驗證，就沒有 CSRF 的問題了。

現在有許多網站都採取前後端分離的架構，把前端跟後端完全切開，前端就只是一個靜態網站，後端則只有提供純資料的 API，網頁跟畫面的顯示百分之百交給前端負責。而前後端的網域通常也會分開，例如說前端在 `https://huli.tw`，後端在 `https://api.huli.tw` 等等。

在這種架構下，比起傳統的 cookie-based 的身份驗證，有更多網站會選擇使用 JWT 搭配 HTTP header，把驗證身份的 token 存在瀏覽器的 localStorage 裡面，向後端發送 request 時放在 `Authorization` header 中，像這樣：

```
GET /me HTTP/1.1
Host: api.huli.tw
Authorization: Bearer {JWT_TOKEN}
```

像這種的驗證方式就完全沒有使用到 cookie，因此這機制天生就對 CSRF 免疫，不會有 CSRF 的問題。比起防禦方式，這更像是一種技術選擇。我相信很多人在選擇要用這種驗證方式時，並不知道這樣可以順便防止 CSRF。

不過，當然也有其他缺點就是了，例如說 cookie 可以用 `HttpOnly` 這個屬性讓瀏覽器讀取不到，讓攻擊者沒辦法直接偷到 token，但是 `localStorage` 並沒有類似的機制，一旦被 XSS 攻擊，攻擊者就可以輕鬆把 token 拿走。

有關 token 的儲存我們之前在 XSS 的第三道防線那裡也聊過了，這邊就不再提了。

### 加上 custom header

當我們在講 CSRF 攻擊的時候，拿來使用的範例是表單跟圖片，而這些送出請求的方式不能帶上 HTTP header，因此前端在打 API 的時候，可以帶上一個 `X-Version: web` 之類的 heaedr，如此一來後端就可以根據有沒有這個 header，辨識出這個請求是不是合法的。

雖然乍聽之下沒問題，但要小心的是我們剛剛才提過的 CORS 設定。

除了表單或是圖片，攻擊者也可以利用 fetch 直接發出一個跨站的請求，並且含有 header：

``` js
fetch(target, {
  method: 'POST',
  headers: {
    'X-Version': 'web'
  }
})
```

但是帶有自訂 header 的請求是非簡單請求，因此需要通過 preflight request 的檢查，才會真正發送出去。所以，如果你伺服器端的 CORS 實作是沒有問題的，那這個防禦也是沒問題的。

那若是 CORS 設置有問題的話呢？那就沒辦法防禦 CSRF 攻擊了。

## 實際案例

第一個要介紹的案例是 2022 年 Google Cloud Shell 的 CSRF 漏洞，有一個可以上傳檔案的 API 並沒有任何 CSRF 的防護，因此攻擊者可以利用這個漏洞上傳 `~/.bash_profile` 之類的，在使用者每次執行 bash 時就會執行到攻擊的上傳的指令。

全文可以參考：[[ GCP 2022 ] Few bugs in the google cloud shell](https://obmiblog.blogspot.com/2022/12/gcp-2022-few-bugs-in-google-cloud-shell.html)

第二個是 2023 年一間名叫 Ermetic 的資安公司發現的在 Azure web service 上的漏洞，這個過程滿有趣的。

Azure web service 跟 Heroku 有點類似，你把 code 準備好以後就可以直接把一個 web 應用程式部署上去，而這些 server 上除了你的應用程式，預設還會安裝一個 Kudu SCM，讓你看一些環境變數跟設定等等，還可以下載 log 之類的，需要登入才能使用。

而這次要講的漏洞就是在 Kudu SCM 發現的。Kudu SCM 的 API 並沒有使用 CSRF token，而是用了我們提過的「檢查 Origin header」的方式去驗證請求是否合法。

假設 server 的 URL 是：`https://huli.scm.azurewebsites.net`，那底下幾個 origin 都會回傳錯誤：

1. `https://huli.scm.azurewebsites.net.attacker.com` （加在後面）
2. `https://attacker.huli.scm.azurewebsites.net` （加在前面）
3. `http://huli.scm.azurewebsites.net` （改成 HTTP）

雖然看似沒有希望，但他們卻發現只要加上除了 `_` 跟 `-` 以外的字元在特定位置，就可以繞過這個限制。

例如說 `https://huli.scm.azurewebsites.net$.attacker.com` 就可以通過檢查。

但問題是對於瀏覽器來說，這些特殊符號不是合法的 domain 名稱，那該怎麼辦呢？

他們發現了 `_` 可以作為 subdomain 的名稱，因此可以構造出這樣的網址：

```
https://huli.scm.azurewebsites.net._.attacker.com
```

用這個網址，就可以繞過 server 對於 origin 的檢查（原因是 server 的 RegExp 沒寫好）。繞過檢查以後開始看有哪些 API 可以利用，找到了一個 `/api/zipdeploy`，可以直接把壓縮檔部署到 server 上！

所以透過這個 CSRF 的漏洞，攻擊者可以在使用者的 Azure web service 上面部署程式碼，達成 RCE。攻擊方式是準備好一個會呼叫 API 的 HTML，host `https://huli.scm.azurewebsites.net._.attacker.com` 上，接著傳給目標。

只要目標處在登入狀態並且點了連結，就會中招。

他們把這個攻擊稱之為 EmojiDeploy，因為繞過的網址的其中一部分 `._.` 很像表情符號，聽起來十分可愛。

這邊我有省略一些細節沒講，全文可以看：[EmojiDeploy: Smile! Your Azure web service just got RCE’d ._.](https://ermetic.com/blog/azure/emojideploy-smile-your-azure-web-service-just-got-rced/)

## 漏洞連連看：CSRF 與 self-XSS

在之前提到 XSS 時，我有介紹了一種 self-XSS，指的是只對自己有作用的 XSS。

舉例來說，電話號碼有 XSS 的漏洞，但是電話號碼只在我自己的個人資料設定頁面看得到，其他人是看不到的，所以除非我自己把電話號碼改成 XSS payload，否則也無法發起攻擊。

不覺得這就是個結合 CSRF 的好時機嗎？

假設修改個人資料頁面有 CSRF 漏洞，就可以利用 CSRF 把受害者的電話號碼改成 XSS payload，然後再開啟個人資料頁面，如此一來就把 self-XSS 轉變成一個真的 XSS 了！

原本的 self-XSS 漏洞沒什麼影響，很多 bug bounty 平台可能不收，但結合了 CSRF 以後就變成了一個真的有影響力的 XSS，提升了嚴重程度，平台就會收了。

## 小結

資安世界裡的漏洞環環相扣，在選擇修復方法時，同時也可以注意對於其他漏洞的影響。

舉例來說，「不要用 cookie 做身份驗證」雖然可以解決 CSRF 的問題，但是卻讓 XSS 能夠偷到 token，增加了 XSS 能夠影響的範圍。而「加上 custom header」雖然乍看之下可以防禦 CSRF，但如果 CORS 設置有問題，這個防禦方式就無效了。

因此，「加上 CSRF token」是比較好而且也最普遍的方式，或其實資安的防禦也不是只能用一種，可以把上面提到的幾種混在一起用。

例如說我在 CSS injection 的時候有提過 HackMD 的案例，我雖然拿到了 CSRF token 但還是無法攻擊，就是因為伺服器有做了第二層的保護，驗證 `Origin` header。

而剛剛提過的 EmojiDeploy 則是一個反例，他們只驗證了 `Origin` header 而且還實作錯誤，就被攻擊了，如果他們有額外加上 CSRF token 的保護，就可以防住攻擊。

參考資料：

1. [Cross-Site Request Forgery (CSRF)](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)#Prevention_measures_that_do_NOT_work)
2. [Cross-Site Request Forgery (CSRF) Prevention Cheat Sheet](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)_Prevention_Cheat_Sheet)
3. [一次较为深刻的CSRF认识](http://m.2cto.com/article/201505/400902.html)
4. [[技術分享] Cross-site Request Forgery (Part 2)](http://cyrilwang.pixnet.net/blog/post/31813672)
5. [Spring Security Reference](http://docs.spring.io/spring-security/site/docs/3.2.5.RELEASE/reference/htmlsingle/#csrf)
6. [CSRF 攻击的应对之道](https://www.ibm.com/developerworks/cn/web/1102_niugang_csrf/)

