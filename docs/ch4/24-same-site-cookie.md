---
sidebar_position: 24
---

# Same-site cookie，CSRF 的救星？

在提到 CSRF 的防禦方式時，無論是哪一種方法，都是前後端要自己實作一整套的機制去保護。之前講 XSS 的時候，有提到了 CSP，只要加上 CSP，瀏覽器就會幫你把不符合規則的資源擋下來，那對於 CSRF，瀏覽器有沒有提供類似的方式呢？只要加一個什麼東西，就可以阻止 CSRF？

有，這個東西叫做 same-site cookie，這篇我們就一起來看看它是什麼，以及是否用了它以後，我們就能從此高枕無憂。

## 初探 same-site cookie

Same-site cookie，顧名思義就是「只有在 same-site 的狀況下才會送出的 cookie」，使用方式是設定一個叫做 `SameSite` 的屬性，有三個值：

1. None
2. Lax
3. Strict

`None` 是最寬鬆的，就是「我不要有 SameSite 屬性」的意思。

而 `Strict` 顯然是最嚴格的，當你加上之後，就是明確表示：「這個 cookie 只有目標是 same-site 的時候才能送出」。

舉例來說，假設有一個在 `https://api.huli.tw` 的 cookie 設定了 `SameSite=Strict`，那從 `https://example.com` 發送給 `https://api.huli.tw` 的請求，就全都不會帶上這個 cookie，因為這兩個網站不是 same-site。

反之，如果是 `https://test.huli.tw` 就會帶上 cookie，因為是 same-site。

這個嚴格到了什麼地步呢？到了「連點擊連結都算在裡面」的地步了，我在 `https://example.com` 點了一個 `<a href="https://api.huli.tw"></a>` 的超連結，就等同於是從 `https://example.com` 要發一個跨站的請求給 `https://api.huli.tw`。

因此，這種狀況也不會帶上 cookie。

可是這不是很不方便嗎？以 Google 為例好了，假設 Google 拿來驗證使用者身份的 token 存在 same-site cookie，然後在我的文章上有一個超連結，連去 Google 搜尋的頁面，當使用者點擊連結之後，開啟的 Google 畫面因為沒有 token，所以會是未登入的狀態，這使用者體驗滿差的。

這狀況有兩種解法，第一種是跟 Amazon 一樣，準備兩組不同的 cookie，第一組是讓你維持登入狀態，第二組則是做一些敏感操作的時候會需要用到的（例如說購買物品、設定帳戶等等）。第一組不設定 `SameSite`，所以無論你從哪邊來，都會是登入狀態。但攻擊者就算有第一組 cookie 也不能幹嘛，因為不能做任何操作。第二組因為設定了 `SameSite` 的緣故，所以完全避免掉 CSRF。

但這樣子還是有點小麻煩，所以你可以考慮第二種，就是調整為 `SameSite` 的另一種模式：`Lax`。

Lax 模式放寬了一些限制，基本上只要是「top-level navigation」，例如說 `<a href>` 或是 `<form method="GET">`，這些都還是會帶上 cookie。但如果是 POST 方法的 form，就不會帶上 cookie。

所以一方面可以保有彈性，讓使用者從其他網站連進你的網站時還能夠維持登入狀態，一方面也可以防止掉 CSRF 攻擊。

如果 cross-site 的請求不會帶上 cookie，那攻擊者然也就無法執行 CSRF 攻擊。

## Same-site cookie 的歷史

Same-site cookie 的[第一個規格草案](https://datatracker.ietf.org/doc/html/draft-west-first-party-cookies-00)於 2014 年 10 月發佈，當時叫做「First-Party Cookie」而不是現在的「Same-site cookie」，是一直到 2016 年 1 月時，草案上的名稱才改名叫 Same-site cookie。

而 Google 在 2016 年 5 月發布 Chrome 51 版的時候就已經正式加入了這個功能：[SameSite cookie](https://www.chromestatus.com/feature/4672634709082112)，Firefox 也在 2018 年 5 月發佈的 Firefox 60 跟上支援，進度最慢的 Safari 則是在 2021 年 9 月發佈的 Safari 15 才正式全面支援這個功能。

由於這個 SameSite 屬性能夠增加網站的安全性以及保護隱私，因此在 2019 年 10 月的時候，Chrome 直接發佈了一篇名為 [Developers: Get Ready for New SameSite=None; Secure Cookie Settings](https://blog.chromium.org/2019/10/developers-get-ready-for-new.html) 的文章，宣布從 2020 年 2 月開始，沒有設定 SameSite 屬性的 cookie，預設一律會是 Lax。

而之後疫情爆發，雖然在上線前已經有測試過這個功能一陣子，但 Chrome 還是想確保所有網站都是穩定的不會壞，因此在 2020 年 4 月時決定先 rollback 這個改動：[Temporarily rolling back SameSite Cookie Changes](https://blog.chromium.org/2020/04/temporarily-rolling-back-samesite.html)。

不過在 7 月疫情稍微緩和之後，又漸漸重新部署了這個改動，一直到 8 月的時候完成了 100% 的部署。

除了 Chrome 以外，Firefox 也在 2020 年 8 月宣布了跟進，沒有設定 SameSite 的 cookie 預設就會是 Lax。當時的文章：[Changes to SameSite Cookie Behavior – A Call to Action for Web Developers](https://hacks.mozilla.org/2020/08/changes-to-samesite-cookie-behavior/)。

至於 Safari 的話，在 2020 年 3 月就宣佈了[全面封鎖第三方 cookie](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)，只是實際的行為好像是個黑盒子。

## 中場休息加思考時間

寫到這邊，大家應該已經稍微熟悉 CSRF 的原理以及防禦方式，而這篇所介紹的 same-site cookie 看起來又是相當可靠，而且瀏覽器還自動把這個變成是預設的，讓你不用做任何調整也能享受到好處。

有了預設的 `SameSite=Lax` 以後，CSRF 似乎從此就退出了舞台，正式宣告死亡，變成時代的眼淚了，就算不用加上 CSRF token 也沒關係，因為 same-site cookie 會自動處理好一切。

然而，真的是這樣嗎？

預設的 `SameSite=Lax` 真的有這麼厲害嗎？有了它之後，我們是否還需要加上 CSRF token 呢？沒加的話會不會有問題呢？那是什麼狀況會出問題？

大家可以先想想看這些問題，然後繼續看下去。

## GET 型態的 CSRF

在以前的範例中，我在介紹 CSRF 時都是使用 POST，原因很簡單，CSRF 的重點是執行操作，而一般來說 GET 並不會用於執行操作，因為這不符合 GET 方法的語義（或也可以用更專業的說法，GET 只適合 idempotent 的操作）。

不過「不適合這樣做」，不代表「不能這樣做」。

如同我在講 CSRF 時第一個舉的範例，有些人或許會偷懶，用了 GET 來實作刪除或其他功能，像這樣：`/delete?id=3`。

在這種情況下，SameSite lax 就沒辦法保護了，因為 lax 允許底下的行為：

``` js
location = 'https://api.huli.tw/delete?id=3'
```

像是這種頁面的重新導向，就是允許的行為之一，所以就算有了預設的 same-site cookie，依然保護不了。

以後看到有人寫出這種「用 GET 執行操作」時，除了告訴他這樣是個 bad practice 以外，現在又多了一個理由了：「這樣做會有安全性問題」。

但是，會這樣寫的人應該是少數吧？所以問題應該不大？

以這樣的寫法來說，確實是少數，但倒是有另一個很常見的機制我們可以利用：method override。

HTML 表單裡的 `method` 屬性代表著最後 request 送出時的 HTTP 方法，它的值只支援兩種：GET 跟 POST。

那如果要使用 PUT、PATCH 或是 DELETE 該怎麼辦？做不到，要嘛就只能改用 `fetch()` 來發出請求，要嘛就只能在後端實作一個 workaround，而有不少的 framework 都支援後者。

對有些網頁框架來說，如果一個 request 有 `X-HTTP-Method-Override` 的 header 或是 query string 上有 `_method` 的參數，就會使用裡面的值作為請求的方法，而不是利用原先 HTTP 內的。

這個原本是用在剛剛提到的 form 這種場合，你想更新資料但又只能用 POST 時，就可以放一個 `_method` 的參數讓伺服器知道這其實是要 PATCH：

``` html
<form action="/api/update/1" method="POST">
  <input type=hidden name=_method value=PATCH>
  <input name=title value=new_title>
</form>
```

但他同時也可以用在我們的 CSRF 攻擊上面，舉例來說，`GET /api/deleteMyAccount?_method=POST` 就會被伺服器視為是 POST，而非 GET。

透過這種方式，可以繞過 lax 的保護，攻擊有支援這種 method 覆蓋的伺服器。至於哪些網頁框架預設有這個機制，可以參考：[Bypassing Samesite Cookie Restrictions with Method Override](https://hazanasec.github.io/2023-07-30-Samesite-bypass-method-override.md/)

## Same-site cookie 的隱藏規則

那如果沒有支援 method 覆蓋，也沒有使用 GET 來做任何不適當的操作，是不是就沒事了呢？當然沒這麼簡單。

預設的 same-site cookie 其實有一個隱藏規則，也不算隱藏啦，就是比較少人知道，在前面 Firefox 的公告裡就有寫到了：

> For any flows involving POST requests, you should test with and without a long delay. This is because both Firefox and Chrome implement a two-minute threshold that permits newly created cookies without the SameSite attribute to be sent on top-level, cross-site POST requests (a common login flow).

意思就是對於一個沒有 SameSite 屬性的 cookie 來說，在新寫入的兩分鐘內可以突破部分的 lax 限制，允許「top-level 的 cross-site POST 請求」，白話文就是 `<form method=POST>` 啦。

因此，假設使用者才剛登入某個網站，拿來驗證身份的 cookie 剛剛才寫入，此時又開啟了攻擊者的網頁，網頁裡面的內容是 CSRF 的 exploit：

``` html
<form id=f action="https://api.huli.tw/transfer" method="POST">
    <input type=hidden name=target value=attacker_account>
    <input type=hidden name=amount value=1000>
</form>
<script>
  f.submit()
</script>
```

那此時因為前面講的特例的關係，CSRF 攻擊就會成功。

這個特例原本是為了不要讓一些網站壞掉，所以才加上的，但同時對於攻擊者來說也是開了一個後門，只要能滿足一定的條件，就能無視「預設 lax」的限制。

若是網站自己明確指定 `SameSite=Lax` 的話，就不會有這個問題，那這樣的話，是不是就真的安全了？

我猜你知道我想說什麼。

## 防止 CSRF，真的只要 same-site cookie 就夠了嗎？

雖然說 CSRF 的 CS 代表著的是 cross-site，但更多時候它其實比較像是 cross-origin。換句話說，如果攻擊者可以從 `assets.huli.tw` 對 `huli.tw` 發起攻擊，我們一般也會稱這個是 CSRF，儘管這兩個網站並不是 cross-site。

Same-site cookie 就只是確保在 cross-site 的狀況下，cookie 不會被送出去。但如果兩個網站是 same-site 的話，它就不管了。

接續剛剛的例子，Facebook 的主網站是 `www.facebook.com`，假設它有一個讓開發者測試的環境叫做 `sandbox.facebook.com`，在這上面被找到了一個 XSS 漏洞。

如果網站只用了 same-site cookie 來防止 CSRF，那在這個狀況底下是完全沒有任何用處的，因為 `www.facebook.com` 跟 `sandbox.facebook.com` 很明顯是 same-site，因此我們可以利用 sandbox 上找到的 XSS，輕鬆地對主網站發起 CSRF 攻擊。

但這很明顯就是一個該防禦的漏洞，因為我們不會希望子網域可以攻擊到其他網域。

因此，完全依靠 same-site cookie 來防禦 CSRF 是不安全的選擇，在 [Cookie 的 RFC](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-12#name-samesite-cookies) 中也說了：

> Developers are strongly encouraged to deploy the usual server-side defenses (CSRF tokens, ensuring that "safe" HTTP methods are idempotent, etc) to mitigate the risk more fully.

強烈建議開發者除了 same-site cookie 以外，也一併實作以前那些常見的防禦方式，例如說 CSRF token 等等。

所以呢，就算有了 same-site cookie，並不代表以前的防禦措施就都可以拿掉。我們還是需要 CSRF token，再搭配上 same-site cookie，就可以築起更穩固的城牆，防止更多攻擊的情境。

## 實際案例

2022 年的時候，jub0bs 跟 abrahack 找到了一個開源監控系統 Grafana 的 CSRF 漏洞，編號為 [CVE-2022-21703](https://github.com/grafana/grafana/security/advisories/GHSA-cmf4-h3xc-jw8w)。

根本原因是 Grafana 只使用了 `SameSite=Lax` 作為 CSRF 的防護，因此只要是 same-site 的請求，就一律可以執行 CSRF 攻擊。有趣的是在 2019 年時 Grafana 原本有要加上 CSRF token，但改一改之後覺得「似乎有 same-site cookie 就夠了」，於是就停止開發了，細節可以看這個 PR：[WIP: security: csrf protection #20070](https://github.com/grafana/grafana/pull/20070)。

不過 Grafana 之所以會這樣認為其實也是有原因的，因為 Grafana API 只接受 `application/json` 的請求，而這個 content-type 的請求是沒辦法由 form 發出的，你只能使用 `fetch`，而且這個 content-type 屬於非簡單請求，因此需要通過 preflight。

既然有在 preflight 就把其他 origin 的請求擋掉，那照理來說確實應該沒事才對。

但是仔細閱讀 CORS 的規格外加伺服器的一個小 bug，成功繞過了這個限制。

一個 MIME type 其實是由 type、subtype 跟 parameters 這三個部分所組成，我們常看到的 `application/json`，type 是 application，subtype 是 json，沒有 parameters。

而 `text/plain; charset=utf-8`，type 是 text，subtype 是 plain，parameters 是 `charset=utf-8`。

CORS 的規格只要求 type 加上 subtype 是以下三種：

1. application/x-www-form-urlencoded
2. multipart/form-data
3. text/plain

但是並沒有限制 parameters 的內容。

於是，這個 content-type 會是一個簡單請求：`text/plain; application/json`，因為 `application/json` 是 parameters，`text/plain` 是 type + subtype，這完全符合規格。

而 API 那邊的處理邏輯如下：

``` go
func bind(ctx *macaron.Context, obj interface{}, ifacePtr ...interface{}) {
  contentType := ctx.Req.Header.Get("Content-Type")
  if ctx.Req.Method == "POST" || ctx.Req.Method == "PUT" || len(contentType) > 0 {
    switch {
    case strings.Contains(contentType, "form-urlencoded"):
      ctx.Invoke(Form(obj, ifacePtr...))
    case strings.Contains(contentType, "multipart/form-data"):
      ctx.Invoke(MultipartForm(obj, ifacePtr...))
    case strings.Contains(contentType, "json"):
      ctx.Invoke(Json(obj, ifacePtr...))
    // ...
  } else {
    ctx.Invoke(Form(obj, ifacePtr...))
  }
}
```

這邊直接對整個 content-type 的內容用了 `strings.contains`，因此我們傳進去的 content-type 雖然本質上是 `text/plain`，但因為 parameters 的關係被伺服器當作是合法的 JSON。

繞過了限制之後，就可以用 fetch 從一個 same-site 的網站發起 CSRF。

假設 Grafana 放在 `https://grafana.huli.tw`，那我們就必須至少找到一個 `*.huli.tw` 的 XSS 或是掌控整個網域，才有辦法進行攻擊。雖然說有點難度，但不是不可能。

就如同我前面講的，這是 same-site 發起的攻擊，所以 same-site cookie 當然防不了。若是嚴格從字面上來看，並不能叫做 CSRF，因為這不是 cross-site，不過特別給一個新名字似乎也怪怪的。

原本的 writeup 可以參考這邊：[CVE-2022-21703: cross-origin request forgery against Grafana](https://jub0bs.com/posts/2022-02-08-cve-2022-21703-writeup/)

## 小結

在這篇裡面我們介紹了近幾年各大瀏覽器才推動的全新措施，也就是預設就把 cookie 設定成 `SameSite=Lax`，雖然這樣的確有增加了一些安全性，但可千萬不要認為只用這招就能完全封住 CSRF。

就跟 XSS 的防禦一樣，CSRF 的防禦也需要設置多道防線，確保一道防線被攻破時，還有其他防線可以撐住。舉例來說，如果只用了 same-site cookie，就表示當有另外一個 same-site 的網站被拿下來時，就宣告投降了。但與其這樣，不如多實作一個 CSRF token 的保護措施，至少在 same-site 被攻破時能夠減輕影響。

話又說回來了，拿到其他 same-site 的控制權，是一件容易的事情嗎？拿到之後又可以做一些什麼事呢？大家可以想一下這個問題，我們下一篇就來談談這個。

參考資料：

1. [Preventing CSRF with the same-site cookie attribute](https://www.sjoerdlangkemper.nl/2016/04/14/preventing-csrf-with-samesite-cookie-attribute/)
2. [再见，CSRF：讲解set-cookie中的SameSite属性](http://bobao.360.cn/learning/detail/2844.html)
3. [SameSite Cookie，防止 CSRF 攻击](http://www.cnblogs.com/ziyunfei/p/5637945.html)
4. [SameSite——防御 CSRF & XSSI 新机制](https://rlilyyy.github.io/2016/07/10/SameSite-Cookie%E2%80%94%E2%80%94%E9%98%B2%E5%BE%A1-CSRF-XSSI/)
5. [Cross-Site Request Forgery is dead!](https://scotthelme.co.uk/csrf-is-dead/)

