---
sidebar_position: 22
---

# 跨來源的安全性問題

雖然說有些網站會利用 reverse proxy 或其他機制把前後端放在同一個 origin 底下，但這似乎是少數。在大多數的情況下，為了要讓前端可以存取到跨來源後端 API 的資料，開放跨來源存取幾乎是不可避免。

而 CORS header 的設定看似簡單，但實作上可不一定。如果設置有問題的話，就可以讓攻擊者存取到不該存取的資源。

除此之外，除了 CORS 的設置錯誤，像是 `<img>` 或是 `<script>` 的那種跨來源存取其實也有資安上的隱憂，這點我們也會在這篇一起談到。

## CORS misconfiguration

前面我有提到過如果跨來源非簡單請求想要帶上 cookie，那 `Access-Control-Allow-Origin` 就不能是 `*`，而是必須指定單一的 origin，否則瀏覽器就不會給過。

但現實的狀況是，我們不可能只有一個 origin。我們可能有許多的 origin，例如說 `buy.huli.tw`、`social.huli.org`、`note.huli.com.tw`，都需要去存取 `api.huli.tw`，這時候我們就沒辦法寫死 response header 裡的 origin，而是必須動態調整。

先講一種最糟糕的寫法，就是這樣：

``` js
app.use((req, res, next) => {
  res.headers['Access-Control-Allow-Credentials'] = 'true'
  res.headers['Access-Control-Allow-Origin'] = req.headers['Origin']
})
```

為了方便起見，所以直接放入 request header 裡面的 origin。這樣做的話，其實就代表任何一個 origin 都能夠通過 CORS 檢查。

這樣做會有什麼問題呢？

問題可大了。

假設我今天做一個網站，網址是 `https://fake-example.com`，並且試圖讓使用者去點擊這個網站，而網站裡面寫了一段 script：

``` js
// 用 api 去拿使用者資料，並且帶上 cookie
fetch('https://api.example.com/me', {
  credentials: 'include'
})
  .then(res => res.text())
  .then(res => {
    // 成功拿到使用者資料，我可以傳送到我自己的 server
    console.log(res)

    // 把使用者導回真正的網站
    window.location = 'https://example.com'
  })
```

因為伺服器回傳了正確的 header，認可 `https://fake-example.com` 是合格的 origin，CORS 檢查就通過了，所以在這網站上也能拿到 `http://api.example.com/me` 的資料。

因此這個攻擊只要使用者點了網站並且在 `example.com` 是登入狀態就會中招。至於影響範圍要看網站的 API，最基本的就是只拿得到使用者資料，比較嚴重一點的可能可以拿到使用者的 token（如果有這個 API 的話）。

這個攻擊有幾件事情要注意：

1. 這不是 XSS，因為我沒有在 `example.com` 執行程式碼，我是在我自己的網站 `http://fake-example.com` 上執行
2. 這有點像是 CSRF，但是網站通常對於 GET 的 API 並不會加上 CSRF token 的防護，所以可以過關
3. 如果有設定 SameSite cookie，攻擊就會失效，因為 cookie 會帶不上去

（CSRF 跟 SameSite 之後都會再提到）

因此這個攻擊要成立有幾個前提：

1. CORS header 給到不該給的 origin
2. 網站採用 cookie 進行身份驗證，而且沒有設定 SameSite
3. 使用者要主動點擊網站並且是登入狀態

針對第一點，可能沒有人會像我上面那樣子寫，直接用 request header 的 origin。比較有可能的做法是這樣：

``` js
app.use((req, res, next) => {
  res.headers['Access-Control-Allow-Credentials'] = 'true'
  const origin = req.headers['Origin']

  // 偵測是不是 example.com 結尾
  if (/example\.com$/.test(origin)) {
    res.headers['Access-Control-Allow-Origin'] = origin
  }
})
```

如此一來，底下的 origin 都可以過關：

1. example.com
2. buy.example.com
3. social.example.com

可是這樣寫是有問題的，因為這樣也可以過關：

1. fakeexample.com

像是這類型的漏洞是經由錯誤的 CORS 設置引起，所以稱為 CORS misconfiguration。

而解決方法就是不要用 RegExp 去判斷，而是事先準備好一個清單，有在清單中出現的才通過，否則都是失敗。如此一來，就可以保證不會有判斷上的漏洞，然後也記得把 cookie 加上 SameSite 屬性。

``` js
const allowOrigins = [
  'https://example.com',
  'https://buy.example.com',
  'https://social.example.com'
]
app.use((req, res, next) => {
  res.headers['Access-Control-Allow-Credentials'] = 'true'
  const origin = req.headers['Origin']

  if (allowOrigins.includes(origin)) {
    res.headers['Access-Control-Allow-Origin'] = origin
  }
})
```

### 實際案例

第一個案例是 Jordan Milne 在 2016 年找到的 JetBrains IDE 的漏洞。

在使用 JetBrains IDE 的時候，它會自己跑一個 local server 起來，當你開啟一個檔案並按下「view in browser」的時候，就會打開網址：`http://localhost:63342/<projectname>/<your_file.html>`，背後就是那個 local server 在負責。

而這個 server 沒有寫好，它的 `Access-Control-Allow-Origin` header 就跟我前面舉的錯誤範例一樣，直接使用了請求中的 origin header，因此任意網站都可以讀取 response。

再來作者又發現了路徑遍歷（path traversal）的漏洞，可以利用這個 API 讀取到任何檔案。因此結合起來，等於是攻擊者可以在他的網站上，透過 JetBrains 的 local server API 讀取到系統上的檔案。

作者給的簡單 PoC 是這樣：

``` html
<script>
var xhr = new XMLHttpRequest();
xhr.open("GET", "http://localhost:63342/testing/something.txt", true);
xhr.onload = function() {alert(xhr.responseText)};
xhr.send();
</script>
```

後續作者又找到其他問題，並成功達成了 RCE，但那些部分與這篇關注的 CORS 設定問題無關，因此我就不細講了，有興趣的可以去原文觀看：[JetBrains IDE Remote Code Execution and Local File Disclosure](http://blog.saynotolinux.com/blog/2016/08/15/jetbrains-ide-remote-code-execution-and-local-file-disclosure-vulnerability-analysis/)。

第二個案例是 James Kettle 在 2017 年 AppSec EU 研討會上分享的比特幣交易所的漏洞。

他找到了一個交易所有個 API 同樣有著相同的漏洞，允許任意 origin 跨來源讀取 response，而其中一個 API 是 `/api/requestApiKey`，可以拿到使用者的 apiKey，而這個 apiKey 可以讓你把使用者的比特幣轉到自己的帳戶去。

想看更多可以參考：[AppSec EU 2017 Exploiting CORS Misconfigurations For Bitcoins And Bounties by James Kettle](https://www.youtube.com/watch?v=wgkj4ZgxI4c&ab_channel=OWASP)

最後一個來看我自己在 2020 年回報的 Asiayo 漏洞，root cause 一模一樣，可以在別的網站拿到使用者的資料，包括姓名、手機以及 email 等等：

![](pics/22-01.png)

原始報告：[Asiayo 網站 CORS misconfiguration 漏洞](https://zeroday.hitcon.org/vulnerability/ZD-2020-00829)

## 其他各種 COXX 系列 header

除了我們最熟悉的 CORS 以外，還有幾個以 CO 開頭的 header：

1. CORB（Cross-Origin Read Blocking）
2. CORP（Cross-Origin Resource Policy）
3. COEP（Cross-Origin-Embedder-Policy）
4. COOP（Cross-Origin-Opener-Policy）

這些 header 的 CO 也都是 Cross-origin 的簡寫，因此也跟跨來源的資料存取有關，接著我們就來看看這些 header 到底是在做什麼的。

## 嚴重的安全漏洞：Meltdown 與 Spectre

在 2018 年 1 月 3 號，Google 的 Project Zeror 對外發布了一篇名為：[Reading privileged memory with a side-channel](https://googleprojectzero.blogspot.com/2018/01/reading-privileged-memory-with-side.html) 的文章，裡面講述了三種針對 CPU data cache 的攻擊：

* Variant 1: bounds check bypass (CVE-2017-5753)
* Variant 2: branch target injection (CVE-2017-5715)
* Variant 3: rogue data cache load (CVE-2017-5754)

而前兩種又被稱為 Spectre，第三種被稱為是 Meltdown。如果你有印象的話，在當時這可是一件大事，因為問題是出在 CPU，而且並不是個容易修復的問題。

而這個漏洞的公佈我覺得對於瀏覽器的運作機制有滿大的影響（或至少加速了瀏覽器演進的過程），尤其是 spectre 可以拿來攻擊瀏覽器，而這當然也影響了這系列的主題：跨來源資源存取。

因此，稍微理解一下 Spectre 在幹嘛我覺得是很有必要的。如果想要完全理解這個攻擊，需要有滿多的背景知識，但這不是這一篇主要想講的東西，因此底下我會以非常簡化的模型來解釋 Spectre，想要完全理解的話可以參考上面的連結。

## 超級簡化版的 Spectre 攻擊解釋

再次強調，這是為了方便理解所簡化過的版本，跟原始的攻擊有一定出入，但核心概念應該是類似的。

假設現在有一段程式碼（C 語言）長這樣子：

``` c
uint8_t arr1[16] = {1, 2, 3}; 
uint8_t arr2[256]; 
unsigned int array1_size = 16;

void run(size_t x) {
  if(x < array1_size) {
    uint8_t y = array2[array1[x]];
  }
}

size_t x = 1;
run(x);
```

我宣告了兩個陣列，型態是 `uint8_t`，所以每個陣列的元素大小都會是 1 個 byte（8 bit）。而 arr1 的長度是 16，arr2 的長度是 256。

接下來我有一個 function 叫做 `run`，會吃一個數字 x，然後判斷 x 是不是比 `array1_size` 小，是的話我就先把 `array1[x]` 的值取出來，然後作為索引去存取 `array2`，再把拿到的值給 y。

以上面的例子來說，`run(1)` 的話，就會執行：

``` C
uint8_t y = array2[array1[1]];
```

而 `array1[1]` 的值是 2，所以就是 `y = array2[2]`。

這段程式碼看起來沒什麼問題，而且我有做了陣列長度的判斷，所以不會有超出陣列索引（Out-of-Bounds，簡稱 OOB）的狀況發生，只有在 x 比 array1_size 小的時候才會繼續往下執行。 

不過這只是你看起來而已。

在 CPU 執行程式碼的時候，有一個機制叫做 branch prediction。為了增進程式碼執行的效率，所以 CPU 在執行的時候如果碰到 if 條件，會先預測結果是 true 還是 false，如果預測的結果是 true，就會先幫你執行 if 裡面的程式碼，把結果先算出來。

剛剛講的都只是「預測」，等到實際的 if 條件執行完之後，如果跟預測的結果相同，那就皆大歡喜，如果不同的話，就會把剛剛算完的結果丟掉，這個機制稱為：預測執行（speculatively execute）

因為 CPU 會把結果丟掉，所以我們也拿不到預測執行的結果，除非 CPU 有留下一些線索。

而這就是 Spectre 攻擊成立的主因，因為還真的有留下線索。

一樣是為了增進執行的效率，在預測執行的時候會把一些結果放到 CPU cache 裡面，增進之後讀取資料的效率。

假設現在有 ABC 三個東西，一個在 CPU cache 裡面，其他兩個都不在，我們要怎麼知道是哪一個在？

答案是，透過存取這三個東西的時間來分辨！因為在 CPU cache 裡面的東西讀取一定比較快，所以如果讀取 A 花了 10ms，B 花了 10ms，C 只花了 1ms，我們就知道 C 一定是在 CPU cache 裡面。這種透過其他線索來得知資訊的攻擊方法，叫做 side-channel attack，從其他管道來得知資訊。

上面的方法我們是透過時間來判斷，所以又叫做 timing attack。

結合上述知識之後，我們再回來看之前那段程式碼：

``` c
uint8_t arr1[16] = {1, 2, 3}; 
uint8_t arr2[256]; 
unsigned int array1_size = 16;

void run(size_t x) {
  if(x < array1_size) {
    uint8_t y = array2[array1[x]];
  }
}

size_t x = 1;
run(x);
```

假設現在我跑很多次 `run(10)`，CPU 根據 branch prediction 的機制，合理推測我下一次也會滿足 if 條件，執行到裡面的程式碼。就在這時候我突然把 x 設成 100，跑了一個 `run(100)`。

這時候 if 裡面的程式碼會被預測執行：

``` C
uint8_t y = array2[array1[100]];
```

假設 array1[100] 的值是 38 好了，那就是 `y = array2[38]`，所以 `array2[38]` 會被放到 CPU cache 裡面，增進之後載入的效率。

接著實際執行到 if condition 發現條件不符合，所以把剛剛拿到的結果丟掉，什麼事都沒發生，function 執行完畢。

然後我們根據剛剛上面講的 timing attack，去讀取 array2 的每一個元素，並且計算時間，會發現 `array2[38]` 的讀取時間最短。

這時候我們就知道了一件事：

> array1[100] 的內容是 38

你可能會問說：「那你知道這能幹嘛？」，能做的事情可多了。array1 的長度只有 16，所以我讀取到的值並不是 array1 本身的東西，而是其他部分的記憶體，是我不應該存取到的地方。而我只要一直複製這個模式，就能把其他地方的資料全都讀出來。

這個攻擊如果放在瀏覽器上面，我就能讀取同一個 process 的其他資料，換句話說，如果同一個 process 裡面有其他網站的內容，我就能讀取到那個網站的內容！

這就是 Spectre 攻擊，透過 CPU 的一些機制來進行 side-channal attack，進而讀取到本來不該讀到的資料，造成安全性問題。

所以用一句白話文解釋：「在瀏覽器上面，Spectre 可以讓你有機會讀取到其他網站的資料」。

有關 Spectre 的解釋就到這裡了，上面簡化了很多細節，而那些細節我其實也沒有完全理解，想知道更多的話可以參考：

1. [Reading privileged memory with a side-channel](https://googleprojectzero.blogspot.com/2018/01/reading-privileged-memory-with-side.html)
2. [解读 Meltdown & Spectre CPU 漏洞](https://zhuanlan.zhihu.com/p/32757727)
3. [浅谈处理器级Spectre Attack及Poc分析](https://yangrz.github.io/blog/2018/01/09/cpu/)
4. [[閒聊] Spectre & Meltdown漏洞概論(翻譯)](https://www.ptt.cc/bbs/NetSecurity/M.1515146856.A.750.html)
5. [Spectre漏洞示例代码注释](https://github.com/hdzitao/spectre-attack-zh)
6. [Google update: Meltdown/Spectre](https://developers.google.com/web/updates/2018/02/meltdown-spectre)
7. [Mitigating Spectre with Site Isolation in Chrome](https://security.googleblog.com/2018/07/mitigating-spectre-with-site-isolation.html)

而那些 COXX 的東西，目的都是差不多的，都是要防止一個網站能夠讀取到其他網站的資料。只要不讓惡意網站跟目標網站處在同一個 process，這類型的攻擊就失效了。

從這個角度出發，我們來看看各種相關機制。

## CORB（Cross-Origin Read Blocking）

Google 於 Spectre 攻擊公開的一個月後，也就是 2018 年 2 月，在部落格上面發了一篇文章講述 Chrome 做了哪些事情來防堵這類型的攻擊：[Meltdown/Spectre](https://developers.google.com/web/updates/2018/02/meltdown-spectre)。

文章中的 Cross-Site Document Blocking 就是 CORB 的前身。根據 [Chrome Platform Status](https://www.chromestatus.com/feature/5629709824032768)，在 Chrome for desktop release 67 的時候正式預設啟用，那時候大概是 2018 年 5 月，也差不多那個時候，被 merge 進去 fetch 的 spec，成為規格的一部分（[CORB: blocking of nosniff and 206 responses](https://github.com/whatwg/fetch/pull/686)）。

前面有提到過 Spectre 能夠讀取到同一個 process 底下的資料，所以防禦的其中一個方式就是不要讓其他網站的資料出現在同一個 process 底下。

一個網站有許多方式可以把跨來源的資源設法弄進來，例如說 `fetch` 或是 `xhr`，但這兩種已經被 CORS 給控管住了，而且拿到的 response 應該是存在 network 相關的 process 而不是網站本身的 process，所以就算用 Spectre 也讀不到。

但是呢，用 `<img>` 或是 `<script>` 這些標籤也可以輕易地把其他網站的資源載入。例如說：`<img src="https://bank.com/secret.json">`，假設 `secret.json` 是個機密的資料，我們就可以把這個機密的資料給「載入」。

你可能會好奇說：「這樣做有什麼用？那又不是一張圖片，而且我用 JavaScript 也讀取不到」。沒錯，這不是一張圖片，但以 Chrome 的運作機制來說，Chrome 在下載之前不知道它不是圖片（有可能副檔名是 .json 但其實是圖片對吧），因此會先下載，下載之後把結果丟進 render process，這時候才會知道這不是一張圖片，然後引發載入錯誤。

看起來沒什麼問題，但別忘了 Spectre 開啟了一扇新的窗，那就是「只要在同一個 process 的資料都有機會讀取到」。因此光是「把結果丟進 render process」這件事情都不行，因為透過 Spectre 攻擊，攻擊者還是拿得到存在記憶體裡面的資料。

因此 CORB 這個機制的目的就是：

> 如果你想讀的資料類型根本不合理，那根本不需要讀到 render process，直接把結果丟掉就好！

延續上面的例子，那個 JSON 檔案的 MIME type 如果是 `application/json`，代表它絕對不會是一張圖片，因此也不可能放到 img 標籤裡面，這就是我所說的「讀的資料類型不合理」。

CORB 主要保護的資料類型有三種：HTML、XML 跟 JSON，那瀏覽器要怎麼知道是這三種類型呢？不如就從 response header 的 content type 判斷吧？

很遺憾，沒辦法。原因是有很多網站的 content type 是設定錯誤的，有可能明明就是 JavaScript 檔案卻設成 `text/html`，就會被 CORB 擋住，網站就會壞掉。

因此 Chrome 會根據內容來探測（[sniffing](https://mimesniff.spec.whatwg.org/)）檔案類型是什麼，再決定要不要套用 CORB。

但這其實也有誤判的可能，所以如果你的伺服器給的 content type 都確定是正確的，可以傳一個 response header 是 `X-Content-Type-Options: nosniff`，Chrome 就會直接用你給的 content type 而不是自己探測。

![CORB 的錯誤畫面](pics/22-02.png)

總結一下，CORB 是個已經預設在 Chrome 裡的機制，會自動阻擋不合理的跨來源資源載入，像是用 `<img>` 來載入 JSON 或是用 `<script>` 載入 HTML 等等。

更詳細的解釋可以參考：

1. [Cross-Origin Read Blocking for Web Developers](https://www.chromium.org/Home/chromium-security/corb-for-developers)
2. [Cross-Origin Read Blocking (CORB)](https://chromium.googlesource.com/chromium/src/+/master/services/network/cross_origin_read_blocking_explainer.md)

## CORP（Cross-Origin Resource Policy）

CORB 是瀏覽器內建的機制，自動保護了 HTML、XML 與 JSON，不讓他們被載入到跨來源的 render process 裡面，就不會被 Spectre 攻擊。但是其他資源呢？如果其他類型的資源，例如說有些照片跟影片可能也是機密資料，我可以保護他們嗎？

這就是 CORP 這個 HTTP response header 的功能。CORP 的前身叫做 From-Origin，下面引用一段來自 [Cross-Origin-Resource-Policy (was: From-Origin) #687](https://github.com/whatwg/fetch/issues/687) 的敘述：

> Cross-Origin Read Blocking (CORB) automatically protects against Spectre attacks that load cross-origin, cross-type HTML, XML, and JSON resources, and is based on the browser’s ability to distinguish resource types. We think CORB is a good idea. From-Origin would offer servers an opt-in protection beyond CORB.

如果你自己知道該保護哪些資源，那就可以用 CORP 這個 header，指定這些資源只能被哪些來源載入。CORP 的內容有三種：

1. same-site
2. same-origin
3. cross-origin

第三種的話就跟沒有設定是差不多的（但其實跟沒設還是有差，之後會解釋），就是所有的跨來源都可以載入資源。接下來我們實際來看看設定這個之後會怎樣吧！

我們先用 express 跑一個簡單的 server，加上 CORP 的 header 然後放一張圖片，圖片網址是 `http://b.example.com/logo.jpg`：

``` js
app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'same-origin')
  next()
})
app.use(express.static('public'));
```

接著在 `http://a.example.com` 引入這張圖片：

``` html
<img src="http://b.example.com/logo.jpg" />
```

重新整理打開 console，就會看到圖片無法載入的錯誤訊息，打開 network tab 還會詳細解釋原因：

![](pics/22-03.png)

如果把 header 改成 `same-site` 或是 `cross-origin`，就可以看到圖片被正確載入。

所以這個 header 其實就是「資源版的 CORS」，原本的 CORS 比較像是 API 或是「資料」間存取的協議，讓跨來源存取資料需要許可。而資源的載入例如說使用 `<img>` 或是 `<script>`，想要阻止跨來源載入的話，原本只能透過 server side 自行去判斷 `Origin` 或是 `Referer` 之類的值，動態決定是否回傳資料。

而 CORP 這個 header 出現之後，提供了阻止「任何跨來源載入」的方法，只要設定一個 header 就行了。所以這不只是安全性的考量而已，安全性只是其中一點，重點是你可以阻止別人載入你的資源。

就如同 CORP 的前身 From-Origin 的 [spec](https://www.w3.org/TR/from-origin/) 所寫到的：

> The Web platform has no limitations on embedding resources from different origins currently. E.g. an HTML document on http://example.org can embed an image from http://corp.invalid without issue. This has led to a number of problems:

對於這種 embedded resource，基本上 Web 沒有任何限制，想載入什麼就載入什麼，雖然方便但也會造成一些問題，像是：

> Inline linking — the practice of embedding resources (e.g. images or fonts) from another server, causing the owner of that server to get a higher hosting bill.
> 
> Clickjacking — embedding a resource from another origin and attempting to let the visitor click on a concealed link thereof, causing harm to the visitor.

例如說在我的部落格直接連到別人家的圖片，這樣流量就是別人家 server 的，帳單也是他要付。除此之外，也會有 Clickjacking 的問題。

> Privacy leakage — sometimes resource availability depends on whether a visitor is signed in to a particular website. E.g. only with a I'm-signed-in-cookie will an image be returned, and if there is no such cookie an HTML document. An HTML document embedding such a resource (requested with the user's credentials) can figure out the existence of that resource and thus whether the visitor is signed in and therefore has an account with a particular service.

在隱私部分也有一些問題，例如說有個網站可以得知你在其他網站是不是登入狀態（之後會介紹到）。

那它怎麼知道的呢？因為有些資源可能只有在登入的時候有權限存取。假設某個圖片網址只有登入狀態下會正確回傳圖片，沒登入的話就會回傳 server error，那我只要這樣寫就好：

``` html
<img src=xxx onerror="alert('not login')" onload="alert('login')">
```

透過圖片是否載入成功，就知道你是否登入。

> License checking — certain font licenses require that the font be prevented from being embedded on other origins.

字型網站會阻止沒有 license 的使用者載入字型，這種狀況也很適合用這個 header。

總而言之呢，前面介紹的 CORB 只是「阻止不合理的讀取」，例如說用 img 載入 HTML，這純粹是為了安全性考量而已。

但是 CORP 則是可以阻止任何的讀取（除了 iframe，對 iframe 沒作用），可以保護你網站的資源不被其他人載入，是功能更強大而且應用更廣泛的一個 header。

現在主流的瀏覽器都已經支援這個 header 了。

## Site Isolation

要防止 Spectre 攻擊，有兩條路線：

1. 不讓攻擊者有機會執行 Spectre 攻擊
2. 就算執行攻擊，也拿不到想要的資訊

前面有提過 Spectre 攻擊的原理，透過讀取資料的時間差得知哪一個資料被放到 cache 裡面，就可以從記憶體裡面「偷」資料出來。那如果瀏覽器上面提供的計時器時間故意不精準的話，不就可以防禦了嗎？因為攻擊者算出來的秒數會差不多，根本不知道哪一個讀取比較快。

Spectre 攻擊出現之後瀏覽器做了兩件事：

1. 降低 `performance.now` 的精準度
2. 停用 `SharedArrayBuffer`

第一點很好理解，降低拿時間函式的精準度，就可以讓攻擊者無法判斷正確的讀取速度。那第二點是為什麼呢？

先講一下 `SharedArrayBuffer` 這東西好了，這東西可以讓你 document 的 JavaScript 跟 web worker 共用同一塊記憶體，共享資料。所以在 web worker 裡面你可以做一個 counter 一直累加，然後在 JavaScript 裡面讀取這個 counter，就達成了計時器的功能。

所以 Spectre 出現之後，瀏覽器就做了這兩個調整，從「防止攻擊源頭」的角度下手，這是第一條路。

而另一條路則是不讓惡意網站拿到跨來源網站的資訊，就是前面所提到的 CORB，以及現在要介紹的：Site Isolation。

這個名詞在之前的「瀏覽器的安全模型」裡面有稍微提過，先來一段 [Site Isolation for web developers](https://developers.google.com/web/updates/2018/07/site-isolation) 的介紹：

> Site Isolation is a security feature in Chrome that offers an additional line of defense to make such attacks less likely to succeed. It ensures that pages from different websites are always put into different processes, each running in a sandbox that limits what the process is allowed to do. It also blocks the process from receiving certain types of sensitive data from other sites

簡單來說呢，Site Isolation 會確保來自不同網站的資源會放在不同的 process，所以就算在自己的網站執行了 Spectre 攻擊也沒關係，因為讀不到其他網站的資料。

Site Isolation 目前在 Chrome 是預設啟用的狀態，相對應的缺點是使用的記憶體會變多，因為開了更多的 process，其他的影響可以參考上面那篇文章。

而除了 Site Isolation 之外，還有另外一個很容易搞混的東西，叫做：「cross-origin isolated state」。

這兩者的差別在哪裡呢？根據我自己的理解，在 [Mitigating Spectre with Site Isolation in Chrome](https://security.googleblog.com/2018/07/mitigating-spectre-with-site-isolation.html) 這篇文章中有提到：

> Note that Chrome uses a specific definition of "site" that includes just the scheme and registered domain. Thus, https://google.co.uk would be a site, and subdomains like https://maps.google.co.uk would stay in the same process.

Site Isolation 的「Site」的定義就跟 same site 一樣，`http://a.example.com` 跟 `http://b.example.com` 是 same site，所以儘管在 Site Isolation 的狀況下，這兩個網頁還是會被放在同一個 process 裡面。

而 cross-origin isolated state 應該是一種更強的隔離，只要不是 same origin 就隔離開來，就算是 same site 也一樣。因此 `http://a.example.com` 跟 `http://b.example.com` 是會被隔離開來的。而且 Site Isolation 隔離的對象是 process，cross-origin isolated 看起來是隔離 browsing context group，不讓跨來源的東西處在同一個 browsing context group。

而這個 cross-origin isolated state 並不是預設的，必須在網頁上設置這兩個 header 才能啟用：

1. Cross-Origin-Embedder-Policy: require-corp
2. Cross-Origin-Opener-Policy: same-origin

至於為什麼是這兩個，待會告訴你。

## COEP（Cross-Origin-Embedder-Policy）

要達成 cross-origin isolated state 的話，必須保證你對於自己網站上所有的跨來源存取，都是合法的並且有權限的。

COEP（Cross-Origin-Embedder-Policy）這個 header 有兩個值：

1. unsafe-none
2. require-corp

第一個是預設值，就是沒有任何限制，第二個則是跟我們前面提到的 CORP(Cross-Origin-Resource-Policy) 有關，如果用了這個 require-corp 的話，就代表告訴瀏覽器說：「頁面上所有我載入的資源，都必須有 CORP 這個 header 的存在（或是 CORS），而且是合法的」

現在假設我們有個網站 `a.example.com`，我們想讓它變成 cross-origin isolated state，因此幫他加上一個 header：`Cross-Origin-Embedder-Policy: require-corp`，然後網頁裡面引入一個資源：

``` html
<img src="http://b.example.com/logo.jpg">
```

接著我們在 b 那邊傳送正確的 header：

``` js
app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
})
```

如此一來就達成了第一步。

另外，前面我有講過 CORP 沒有設跟設定成 `cross-origin` 有一個細微的差異，就是差在這邊。上面的範例如果 b 那邊沒有送這個 header，那 Embedder Policy 就不算通過。

## COOP（Cross-Origin-Opener-Policy）

而第二步則是這個 COOP（Cross-Origin-Opener-Policy）的 header，當你用 `window.open` 開啟一個網頁的時候，你可以操控那個網頁的 location；而開啟的網頁也可以用 `window.opener` 來操控你的網頁。

而這樣子讓 window 之間有關連，就不符合跨來源的隔離。因此 COOP 這個 header 就是來規範 window 跟 opener 之間的關係，一共有三個值：

1. Cross-Origin-Opener-Policy: `unsafe-none`
2. Cross-Origin-Opener-Policy: `same-origin`
3. Cross-Origin-Opener-Policy: `same-origin-allow-popups` 

第一個就是預設值，不解釋，因為沒什麼作用。其他兩個有點複雜，直接用個簡單的範例總結一下。

假設現在有一個網頁 A 用 window.open 開啟了一個網頁 B：

1. 如果 AB 是 cross-origin，瀏覽器本來就有限制，只能存取 `window.location` 或是 `window.close` 之類的方法。沒辦法存取 DOM 或其他東西
2. 如果 AB 是 same-origin，那他們可以互相存取幾乎完整的 window，包括 DOM。
3. 如果 A 加上 COOP header，而且值是 `same-origin`，代表針對第二種情況做了更多限制，只有 B 也有這個 header 而且值也是 `same-origin` 的時候才能互相存取 window。
4. 如果 A 加上 COOP header，而且值是 `same-origin-allow-popups`，也是對第二種情況做限制只是比較寬鬆，只要 B 的 COOP header 不是 `same-origin` 就可以互相存取 window。

總之呢，要「有機會互相存取 window」，一定要先是 same origin，這點是不會變的。實際上是不是存取的到，就要看有沒有設定 COOP header 以及 header 的值。

如果有設定 COOP header 但不符合規則，那 `window.opener` 會直接變成 `null`，連 location 都拿不到（沒設定規則的話，就算是 cross origin 也拿得到）。

其實根據 [spec](https://html.spec.whatwg.org/multipage/origin.html#cross-origin-opener-policies) 還有第四種：same-origin-plus-COEP，但看起來更複雜就先不研究了。

## 再回到 cross-origin isolated state

前面提到了 cross-origin isolated state 需要設置這兩個 header：

1. Cross-Origin-Embedder-Policy: require-corp
2. Cross-Origin-Opener-Policy: same-origin

為什麼呢？因為一旦設置了，就代表頁面上所有的跨來源資源都是你有權限存取的，如果沒有權限的話會出錯。所以如果設定而且通過了，就代表跨來源資源也都允許你存取，就不會有安全性的問題。

在網站上可以用：

``` js
self.crossOriginIsolated
```

來判定自己是不是進入 cross-origin isolated state。是的話就可以用一些被封印的功能，因為瀏覽器知道你很安全。

另外，如果進入了這個狀態，之前講過的透過修改 `document.domain` 繞過 same-origin policy 的招數就不管用了，瀏覽器就不會讓你修改這個東西了。

想知道更多 COOP 與 COEP 還有 cross-origin isolated state，可以參考：

1. [Making your website "cross-origin isolated" using COOP and COEP](https://web.dev/coop-coep/)
2. [Why you need "cross-origin isolated" for powerful features](https://web.dev/why-coop-coep/)
3. [COEP COOP CORP CORS CORB - CRAP that's a lot of new stuff!](https://scotthelme.co.uk/coop-and-coep/)
4. [Making postMessage() work for SharedArrayBuffer (Cross-Origin-Embedder-Policy) #4175](https://github.com/whatwg/html/issues/4175)
5. [Restricting cross-origin WindowProxy access (Cross-Origin-Opener-Policy) #3740](https://github.com/whatwg/html/issues/3740)
6. [Feature: Cross-Origin Resource Policy](https://www.chromestatus.com/feature/4647328103268352)

## 小結

這篇其實講了不少東西，都是圍繞著安全性在打轉。一開始我們講了 CORS 設定錯誤會造成的結果以及防禦方法，也舉了幾個實際的案例。

接著，講了各種 CO 開頭的 header：

1. CORB（Cross-Origin Read Blocking）
2. CORP（Cross-Origin Resource Policy）
3. COEP（Cross-Origin-Embedder-Policy）
4. COOP（Cross-Origin-Opener-Policy）

如果要各用一段話總結這四個東西的話，或許是：

1. CORB：瀏覽器預設的機制，主要是防止載入不合理的資源，像是用 `<img>` 載入 HTML
2. CORP：是一個 HTTP response header，決定這個資源可以被誰載入，可以防止 cross-origin 載入圖片、影片或任何資源
3. COEP：是一個 HTTP response header，確保頁面上所有的資源都是合法載入的
4. COOP：是一個 HTTP response header，幫 same-origin 加上更嚴格的 window 共享設定

之所以會用這麼大的篇幅，一來是因為有不少來龍去脈要解釋，二來就可以看出 origin 這件事情對於瀏覽器的重要程度，重要到需要用這麼多東西去保護，去確保同源政策。

看完了這一大堆同源的跨來源的東西之後，我們下一篇換個口味，來看看經典的 CSRF。

