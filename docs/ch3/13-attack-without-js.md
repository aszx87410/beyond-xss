---
sidebar_position: 13
---

# 誰說一定要直接執行 JavaScript 才能攻擊？

寫到這裡，第二章「XSS 的防禦方式以及繞過手法」正式告一段落。

我們花了許多的篇幅在討論 XSS，包括各種能夠執行 XSS 的方式、防禦方式以及繞過手法等等，以網頁前端來說，能夠對網頁做的最嚴重的事情，基本上就是執行程式碼了。

而在攻擊的範例中，我們基本上都是以「能夠注入 HTML」做為前提，再想辦法轉變成 XSS。雖然說在之前的範例中都只是使用這個簡單的 payload：`<img src=x onload=alert(1)>`，但在現實世界的狀況中或許並不會這麼容易。

舉例來說，之前有稍微提過其實還有一道防線叫做 WAF，Web Application Firewall，應用程式專用的防火牆，利用一些已經寫好的規則阻擋「看起來就很邪惡」的 payload。

例如說 Dcard 就有用 Cloudflare 的 WAF，你可以試著點擊這個連結：https://www.dcard.tw/?a=%3Cscript%3E

就會看到被阻擋的提示：

![](pics/13-01.png)

而最知名的開源 WAF 莫過於 [ModSecurity](https://github.com/SpiderLabs/ModSecurity)，提供了一個基礎建設，讓工程師可以自己添加阻擋的規則，也可以用別人寫的。

像是 [OWASP ModSecurity Core Rule Set (CRS)](https://github.com/coreruleset/coreruleset/tree/v4.0/dev) 就是個開源的規則合集，我們來看一小段：

來源：[coreruleset/rules/REQUEST-941-APPLICATION-ATTACK-XSS.conf](https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/REQUEST-941-APPLICATION-ATTACK-XSS.conf#L105)

``` conf
#
# -=[ XSS Filters - Category 1 ]=-
# http://xssplayground.net23.net/xssfilter.html
# script tag based XSS vectors, e.g., <script> alert(1)</script>
#
SecRule REQUEST_COOKIES|!REQUEST_COOKIES:/__utm/|REQUEST_COOKIES_NAMES|REQUEST_FILENAME|REQUEST_HEADERS:User-Agent|REQUEST_HEADERS:Referer|ARGS_NAMES|ARGS|XML:/* "@rx (?i)<script[^>]*>[\s\S]*?" \
    "id:941110,\
    phase:2,\
    block,\
    capture,\
    t:none,t:utf8toUnicode,t:urlDecodeUni,t:htmlEntityDecode,t:jsDecode,t:cssDecode,t:removeNulls,\
    msg:'XSS Filter - Category 1: Script Tag Vector',\
    logdata:'Matched Data: %{TX.0} found within %{MATCHED_VAR_NAME}: %{MATCHED_VAR}',\
    tag:'application-multi',\
    tag:'language-multi',\
    tag:'platform-multi',\
    tag:'attack-xss',\
    tag:'paranoia-level/1',\
    tag:'OWASP_CRS',\
    tag:'capec/1000/152/242',\
    ver:'OWASP_CRS/4.0.0-rc1',\
    severity:'CRITICAL',\
    setvar:'tx.xss_score=+%{tx.critical_anomaly_score}',\
    setvar:'tx.inbound_anomaly_score_pl1=+%{tx.critical_anomaly_score}'"
```

這個規則就利用了正規表達式 `<script[^>]*>[\s\S]*?` 來找出含有 `<script` 的 程式碼，並且將其阻擋，因此 `<script>alert(1)</script>` 就會被偵測並且擋下。

而我們最喜歡使用的 `<img src=x onerror=alert()>` 也有其他規則對應到了，所以在實戰中常碰到的就是興高采烈地以為這網站很爛很好打，殊不知被 WAF 擋得不要不要的，一直看到畫面出現錯誤視窗，明明漏洞就是存在，卻因為 WAF 的關係打不進去。

這種駭客與網站的攻防是資安有趣的地方之一，也是為什麼經驗跟知識量很重要。以 WAF 來說，在推特上常常會出現許多的 WAF bypass payload，為了要繞過 WAF，內容通常都長得滿「噁心」的，像這個：

``` html
<details/open=/Open/href=/data=; ontoggle="(alert)(document.domain)
```

其實這個 paylod 想執行的內容就是 `<details open ontoggle=alert(document.domain)>`，但是用了一堆其他關鍵字來混淆，有很多 WAF 是根據正則表達式來判斷，因此只要讓 WAF 不容易辨識出來，就能靠這樣的方法繞過 WAF。

那如果繞不過呢？

就算網站可以插入 HTML 又怎樣，能執行 XSS 的 payload 如果寫不進去，豈不是就沒招了？這就不一定了。

會這樣認為，通常是因為對前端資安的認識只有 XSS，總覺得一定要能夠直接執行程式碼才能達成攻擊。事實上，還有很多種「間接攻擊」的方式，而有些攻擊手法甚至連 JavaScript 都不需要執行。

如同我在系列開頭所說的，前端資安是一個廣闊的宇宙，我們已經用了不少時間探索了 XSS，是時候進入一個新的星系了！讓我們短暫休息一下，從下一篇開始就會正式進入到第三章：「不直接執行 JavaScript 的攻擊手法」。

在接下來的內容中，我會介紹更多除了 XSS 以外的攻擊手法。

第三章的內容會循序漸進，從「間接影響 JavaScript 的執行」一直到「真的都不用 JavaScript」，再到「不只 JavaScript，連 CSS 也不需要」，不斷地去探索前端攻擊的極限在哪裡。

在進入第三章之前，大家也可以想一下自己聽過哪些「不直接執行 JavaScript」的攻擊手法，很有可能就是之後會出現的內容。

最後一樣來個小測驗，小明在實作一個多人繪畫遊戲，用二維陣列代表畫布，玩家可以在任何一格畫上想要的顏色，會用 `onmessage` 接收資訊並且改變陣列，實作如下：

``` js
onmessage = function(event){
  const { x, y, color } = event.data
  // for example, screen[10][5] = 'red'
  screen[y][x] = color
}
```

請問這樣的程式碼有什麼問題？我們下一篇揭曉。

