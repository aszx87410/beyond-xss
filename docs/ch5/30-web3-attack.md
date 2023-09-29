---
sidebar_position: 30
---

# 網頁前端攻擊在 Web3 上的應用

談到了 Web3，大多數人想到的都會是加密貨幣、元宇宙或是 NFT 等等的東西，而這些背後的技術是區塊鏈以及智慧合約，是一套完全不同的體系。

但可別忘記了，Web3 的世界仍然需要一個入口，而這個入口就是 Web2，也就是我們所熟悉的網頁世界。

在這一篇裡面，我會跟著大家一起看幾個從 Web2 攻擊 Web3 世界的真實案例。

## 影響力更大的 XSS

在一般的網站裡面如果成功找到了 XSS 漏洞，那可以做的事情通常都是偷取使用者在網站上的資料，例如說電話、Email 或是姓名等等。

那如果在 Web3 的世界裡面找到了 XSS 呢？或許除了偷資料以外，還可以偷更有價值的東西——加密貨幣。

在加密貨幣的世界中，每個人都有一個自己的錢包，而在瀏覽器上最知名的錢包之一就是 Metamask，當你要授權一筆交易或是簽署一個訊息的時候，會看到如下的介面：

![](./pics/30-01.png)

如果是交易或是智慧合約授權的話，上面會寫著合約的地址以及訊息等等。

大家都知道不要隨便同意來路不明的交易，看起來奇怪的網站就忽略它，但如果今天是像 PancakeSwap 這種有名的網站呢？當你在上面執行操作並按下確認時，Metamask 錢包跳出了提示視窗，要你同意交易，我想應該九成的人都會直接按下確定。

但有可能因為這個小小的點擊，導致你損失了大量的加密貨幣。

所謂的「簽署交易」這件事情，其實就是網站透過 JavaScript 去呼叫錢包所提供的 API，並且讓錢包跳出相關的介面，當使用者按下同意時，才會使用私鑰去簽署交易，這筆交易才算成立。

因此，在 Web3 的世界中，如果有駭客掌握了 JavaScript 的執行，就可以在看起來合法的網站上，跳出一筆惡意的交易，當使用者按下同意時可能就會將加密貨幣授權給駭客的智慧合約，錢就被偷走了。

例如說 2022 年時一個叫做 PREMINT 的 NFT 網站上的 JavaScript 檔案遭到竄改，導致有一些使用者在無意間同意了駭客的智慧合約的授權，更多細節請參考：[PREMINT NFT Incident Analysis](https://www.certik.com/resources/blog/77oaazrsx1mewnraJePYQI-premint-nft-incident-analysis)

找到了一個可以 XSS 的網站，就只能攻擊一個，但如果找到了許多網站共同使用的 library 的漏洞，那影響力就更大了。

前面介紹過的供應鏈攻擊也可以運用在 Web3 的網站上面，接下來要介紹的是由 Sam Curry 在 2022 年時發布的文章：[Exploiting Web3’s Hidden Attack Surface: Universal XSS on Netlify’s Next.js Library](https://samcurry.net/universal-xss-on-netlifys-next-js-library/)

在文章中，他描述了自己找到了一個 Next.js 相關套件以及 @netlify/ipx 的漏洞，能夠在任何有使用這些套件的網站上面執行 XSS。

而 netlify 原本就是一個許多人會選擇在上面部署網站的服務，尤其是 Web3 的網站，可能只是一個沒有傳統後端的靜態頁面，所有頁面的功能都可以透過 HTML、CSS 以及 JavaScript 完成，不需要後端 API。

因此，透過這個漏洞，可以攻擊像是 Gemini 或是 PancakeSwap 這種有名的大網站，利用 XSS 跳出智慧合約授權的畫面，並且誘騙使用者點擊。

## Cookie bomb 的實際應用

前面提過的 cookie bomb，在 Web3 的世界中也有了新的意義。

OtterSec 在 2023 年發佈的文章：[Web2 Bug Repellant Instructions](https://osec.io/blog/2023-08-11-web2-bug-repellant-instructions) 裡面，就有提到實際的案例。

現在有許多網站都支援圖片上傳，而有些網站甚至允許 SVG。

那 SVG 跟其他圖片格式差在哪邊呢？差別在於，SVG 檔案是可以執行 script 的，像底下這樣：

``` svg
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<svg version="1.1" xmlns="http://www.w3.org/2000/svg">
  <script type="text/javascript">
    alert("Hello");
  </script>
</svg>
```

因此，如果一個網站支援 SVG 上傳，就有滿高的機率可以利用 SVG 來達成 XSS 漏洞。

但是有一個問題，那就是許多圖片上傳的地方都會與主網站隔開，例如說直接上傳到 S3，而且沒有特別設定域名。所以充其量也只是得到了一個圖片網域的 XSS，並沒有什麼影響力。

但是對於 NFT 的網站就不同了。

以 NFT 的網站來說，圖片是很重要的一環，如果沒辦法看到圖片，整個網站的可用性會受到比較嚴重的影響。因此透過 cookie bomb 來對圖片進行 DoS，對於 NFT 網站來說是有更大的影響力。

同一個漏洞，對於不同類型的產品來說，嚴重性跟影響力也會不同。

舉例來說，同樣是 DoS 漏洞，都可以把一個網頁暫時弄到當機，對去年聖誕節的活動網頁來說就沒什麼，但是對加密貨幣交易所來說就會損失慘重。

## 小結

在這篇裡面我們看到了 Web3 的產品其實還是必須面對傳統網頁資安會碰到的問題，而且必須加以防護。如果沒有防護好，就算入侵的不是智慧合約，也可以造成一定的損害。

Web3 的攻擊面並不只有智慧合約，像是傳統網頁資安、釣魚攻擊或是私鑰安全等等，也都是需要防備的部分。

