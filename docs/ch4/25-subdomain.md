---
sidebar_position: 25
---

# 從 same-site 網站打進你家

上一篇在講 Grafana 的攻擊情境時，有提到攻擊者必須要先掌握一個 same-site 的網站，才有辦法執行後續攻擊。那這篇我們換一個角度想：「如果你掌握了一個 same-site 的網站，可以執行哪些攻擊？」，比如說 CSRF 就是一個可能的攻擊方式。

這在平常 bug bounty 的世界中也時常發生，bug bounty 是網站提供給賞金獵人們的獎金，鼓勵大家主動挖掘並回報漏洞，這樣網站就可以在漏洞被惡意利用以前先行修補，對兩邊都是雙贏。而這些 bug bounty 通常都有個說明頁面，寫說每一種嚴重程度的漏洞大概值多少錢。

除此之外，也有分核心跟非核心的網站，例如說在 `api.huli.tw` 這個 API 伺服器找到的漏洞，就比在 `2023.campaign.huli.tw` 一次性活動頁面找到的漏洞還要值錢，因為前者能造成的影響力更大。

因此當一個賞金獵人找到 `2023.campaign.huli.tw` 的漏洞時，他可能會先試著繼續研究，看有沒有辦法把這漏洞的影響範圍擴大，例如說能夠影響到 `api.huli.tw`，就能拿到更多獎金。

除了找到 same-site 網站的 XSS 以外，還有另一種方式可以控制子網域。

## Subdomain takeover

這個漏洞顧名思義，可以讓攻擊者把整個 subdomain 都拿過來，擁有 subdomain 的控制權。

聽起來很困難對吧？是不是要掌握他們的 DNS 或是打進去公司內部，才能掌握一個 subdomain？其實不一定，在各種雲端服務盛行的年代，還有一種更簡單的方式可以嘗試。

Amazon S3 是一個雲端儲存的服務，你可以把檔案丟上去並且設置權限，分享給其他人。有許多人會拿 Amazon S3 來放圖片或者是一整個網站，因為它也有提供 host 網站的功能。每一個 S3 的儲存空間都叫做 bucket，會有一個名稱，這名稱同時也對應到了一個它提供的子網域。

例如說我的 bucket 名稱如果叫 `hulitest`，子網域就是：`https://hulitest.s3.us-east-1.amazonaws.com`。因為 S3 方便好用，拿來託管靜態網站是很不錯的選擇，比如說公司架構如果是前後端完全分開好了，然後也不需要 server-side rendering，那純靜態的網站就可以放在 S3，這樣就完全不用自己管前端的 infrastructure。

唯一的問題是 `https://hulitest.s3.us-east-1.amazonaws.com` 這個網域不好看，公司通常都有自己的網域名稱，而 S3 當然有提供了自訂網域的功能，方法也很簡單。

第一步，先把 bucket 名稱改成你要的網域，例如說 `campaign.huli.tw`。

第二步，在 DNS 新增一筆 CNAME 紀錄，把 `campaign.huli.tw` 指到 `hulitest.s3.us-east-1.amazonaws.com`，如此一來，就可以使用 `https://campaign.huli.tw` 這個自己的網域。

看起來整個流程都沒問題，也都很方便，但問題就出在這個網頁不需要的時候怎麼辦？例如說可能有一個聖誕節活動頁面，因為都是純靜態網頁所以放到 S3，接著用自訂網域指到 `xmas.huli.tw`，當聖誕節結束以後活動也結束了，所以先把 S3 的 bucket 砍掉，畢竟儲存空間跟流量也還是要收一點錢。

而 DNS 的部分可能是別的部門在負責，如果沒有特別告知他們要刪，有可能就會留在那裡。

於是，就會出現一種狀況，那就是 DNS 紀錄還在，可是指向的地方已經刪除了。

以 S3 來說，只要 bucket 的名字沒有被人取走，你就可以取那個名字。而現在 `xmas.huli.tw` 這個 bucket 以經被砍掉了，所以我可以再建立一個新的，就取名叫做 `xmas.huli.tw`。如此一來，`xmas.huli.tw` 這個網域背後會指向 S3 bucket，而 S3 bucket 裡面又是我的內容，就等於我可以控制 `xmas.huli.tw` 的內容，達成了 subdomain takeover。

除了 S3 以外，還有一大堆提供類似功能的服務都有這種問題，詳細清單可以參考：[Can I take over XYZ](https://github.com/EdOverflow/can-i-take-over-xyz)。而 Azure 也特地做了一個頁面來說明該如何防禦：[防止 DNS 項目懸空並避免子網域接管](https://learn.microsoft.com/zh-tw/azure/security/fundamentals/subdomain-takeover)，簡單來講呢，只要把 DNS 紀錄一起刪掉就沒事了。

## 獲取子網域控制權以後可以做的事

直接來看幾個範例吧！

第一個是 Hacktus 在 2023 年發布的文章：[Subdomain Takeover leading to Full Account Takeover](https://hacktus.tech/subdomain-takeover-leading-to-full-account-takeover)，裡面提到了某個網站 `example.com` 的 cookie 是直接寫在根網域 `example.com`，因此可以被其他子網域共享。

而他發現了其中一個子網域 `test.example.com` 是指到 `azurewebsites.net`，而且沒有人註冊這個服務，所以就把服務註冊下來，成功接管網域。接管了以後，只要使用者點了 `test.example.com`，瀏覽器就會把存在 `example.com` 的 cookie 一起發到 server，他就能拿到使用者的 cookie。

第二個案例是一間名叫 Shockwave 的資安公司發佈的文章：[Subdomain Takeover: How a Misconfigured DNS Record Could Lead to a Huge Supply Chain Attack](https://www.shockwave.cloud/blog/subdomain-takeover-how-a-misconfigured-dns-record-could-lead-to-a-huge-supply-chain-attack)，裡面提到的案例就跟我們前面講的 S3 bucket 的問題如出一轍，不過這次被接管的網域是 `assets.npmjs.com`。

NPM 的全名是 Node Package Manager，是用來管理 JavaScript 套件的網站，如果攻擊者掌握了 `assets.npmjs.com`，就可以在上面放一些惡意套件，然後欺騙開發者說這些是沒問題的。因為這個網域開發者很熟而且看起來可信度很高，釣魚成功的機率也很高。

第三個來看到 2022 年底 Smaran Chand 找到的漏洞：[Taking over the Medium subdomain using Medium](https://smaranchand.com.np/2022/10/taking-over-the-medium-subdomain-using-medium/)，部落格平台 Medium 的其中一個子網域 `platform.medium.engineering` 雖然指向 Medium，但沒有這個部落格存在。

於是攻擊者可以自己跑去開一個 Medium 部落格然後要求連結到 `platform.medium.engineering`。雖然說在這個案例中沒辦法完全控制網頁的內容，但依然可以做一些社交攻擊，例如說發假的徵才文之類的，看起來應該可信度會滿高的。

除了這些實際案例提過的運用方式以外，其實能做的還更多。

## 運用錯誤的安全假設

很多後端程式在做一些檢查時，會有錯誤的安全假設，開放了過多的權限給不該開放的東西。

舉例來說，以 CORS 的那個動態 origin 的案例來講，有些伺服器會實作以下的檢查：

``` js
const domain = 'huli.tw'
if (origin === domain || origin.endsWith('.' + domain)) {
  res.setHeader('Access-Control-Allow-Origin', origin)
}
```

如果 origin 是 `huli.tw` 或是以 `.huli.tw` 結尾的話就通過。雖然看起來沒有太大的問題，攻擊者沒辦法從自己的網域攻擊，但這個檢查安全的前提建立在：「攻擊者沒辦法掌握 `huli.tw` 的子網域」。

然而看到這邊，我相信大家都知道要掌握一個子網域可能沒有想像中困難，風險還是存在的。若是攻擊者可以掌握子網域，就能夠運用這個錯誤的前提從子網域發起攻擊。

所以這個看似安全的檢查，其實是不夠安全的，最安全的檢查應該是：

``` js
const allowOrigins = [
  'huli.tw',
  'blog.huli.tw'
]
if (allowOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin)
}
```

準備好一個清單，在清單中的 origin 才能通過檢查。雖然說這樣比較麻煩，因為每次有新的網域都要手動新增上去，但同時也增加了安全性，不會直接就相信任何的子網域。

## Cookie tossing

另一個掌握子網域以後可以做到的事情，稱為 cookie tossing。

假設現在有個網站的 API server 是 `api.huli.tw`，而身份驗證的 cookie 存在這個網域底下。同時，後端有實作 CSRF 的保護，不但主動加上了 `SameSite=Lax`，還加上了 CSRF token 的檢查，會判斷 request body 中的 `csrf_token` 與 cookie 裡的 `csrf_token` 是否一致。

而這時候我們掌握了一個叫做 `s3.huli.tw` 的子網域，可以在上面執行 XSS，下一步該怎麼做呢？

在寫入 cookie 的時候，我們是可以寫到更上層的 domain 的。舉例來說，`a.b.huli.tw` 可以寫入 cookie 到：

1. a.b.huli.tw
2. b.huli.tw
3. huli.tw

因此，我們在 `s3.huli.tw` 時可以寫入 cookie 到 `huli.tw`，於是我們就可以寫入一個也叫做 `csrf_token` 的 cookie。

像這種情況，在 `api.huli.tw` 跟 `huli.tw` 有著同名的 cookie 時，瀏覽器會怎麼辦呢？會把兩個都一起送出，而且會根據 cookie 的 `path` 屬性，比較符合的在前面。

例如說 `api.huli.tw` 的 cookie 沒有設定 path，而 `huli.tw` 的 cookie 有設定 `path=/users`，那當瀏覽器送出 request 到 `https://api.huli.tw/users` 時，會送出的 cookie 就是：`csrf_token={value_of_huli_tw}&csrf_token={value_of_api_huli_tw}`。

而後端的應用程式通常在拿 cookie 的值的時候，都預設只會拿第一個，因此就拿到了我們在 `s3.huli.tw` 寫入的那個 cookie。

透過這樣的行為，攻擊者就可以把其他 same-site 網域的 cookie 給蓋掉，就好像從子網域把 cookie 「丟」到別的網域，因此叫做 cookie tossing。

只要把 `csrf_token` 蓋掉，就等於說我們知道裡面的值，就可以執行 CSRF 攻擊。因此在這個狀況之下，same-site cookie 設定了，CSRF token 檢查也做了，卻還是逃不了被攻擊的命運。

解決方法的話，就是把 CSRF token 的 cookie 名稱從 `csrf_token` 改成 `__Host-csrf_token`，加上這個 prefix 以後，這個 cookie 在設置時就不能有 path 以及 domain 這兩個屬性，因此其他子網域就沒辦法寫入並且覆蓋，更多範例可以參考 [MDN 的頁面](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#cookie_prefixes)。

具體案例以及其他應用可以參考 @filedescriptor 在 2019 年於 HITCON CMT 的演講：[The cookie monster in your browsers](https://www.youtube.com/watch?v=njQcVWPB1is&ab_channel=HITCON)，或是看[投影片](https://speakerdeck.com/filedescriptor/the-cookie-monster-in-your-browsers)。

## 小結

這篇延續了上一篇提過的 same-site 問題，當我們在設計系統時，應該秉持著最小權限原則，不要蘊含太多不必要的安全假設。比起相信所有的 same-site 網域，更安全的做法會是相信固定清單中的網域，確保每一個信任的網域都有列出來。

另外，從這篇也可以看出一個 same-site 的網站預設就會多一些權限（例如說無視 same-site cookie），因此有許多公司其實對於比較不可信任的檔案（例如說使用者上傳的檔案）或是比較不重要的網站，都會放到一個全新的 domain 去。

例如說主站可能在 `www.huli.tw`，而活動網頁叫做 `campaign.huli.app`，如此一來就算活動網頁被駭，也能將損失控制在最小，不會影響到主站。

