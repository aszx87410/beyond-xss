---
sidebar_position: 10
---

# 結語

以上就是《Beyond XSS：探索網頁前端資安宇宙》的所有內容，我們從 XSS 開始談論前端資安，介紹了許多種類的 XSS 以及攻擊方式，再來談防禦手法，講到了 sanitization 以及 CSP，還有最新的 Trusted Types 以及 Sanitizer API。

接著，開始介紹一些不需要直接執行 JavaScript 也能攻擊的手法，像是 JavaScript 語言特性所造成的 prototype pollution、利用 HTML 來影響 JavaScript 的 DOM clobbering，或是根本不需要 JavaScript 也能攻擊的 CSS injection 等等，讓大家認識到不是只有利用 JavaScript 才能攻擊。

然後又看到了各種跨越限制的攻擊，瞭解了 origin 與 site 的差別，知道 CORS 的基本原理以及常見的設置錯誤會造成的問題，也看了 CSRF 以及 same-site cookie，知道了資安的防禦很多時候並不只是單點，而是一層一層的，才能確保在多數情況下都是安全的。

最後也介紹了其他有趣的資安議題，像是利用 iframe 執行的點擊劫持或是利用自動偵測 MIME type 達成的攻擊，以及我自己認為最有趣的 XSLeaks，想盡各種方式來偵測出差異，並藉由這個差異來造成影響。

如同我在第一篇裡面所說的，前端資安是個宇宙，除了 XSS 以外還有許多美麗的星球，它一直都在那邊，你只是沒有發現。

在資安的世界來講，只論前端資安的話，確實得到的關注沒有其他領域多，因為能夠造成的影響通常也比較小。舉例來說，有些 XSS 可能只能攻擊一個使用者，而且拿到的資料有限，但如果找到一個伺服器的 SQL injection 漏洞，可能一次就能拿到幾百萬筆使用者資料，甚至是 XSS 拿不到的 hash 過後的密碼。

但這並不影響我對前端資安的喜愛，我喜歡前端資安是因為它總能帶給我一些驚奇，讓我認識到對於前端這個領域，前端工程師所接觸到的其實只有其中一塊而已，還有許多是陌生的。身為前端工程師，我認為學習前端資安是必要的，資訊安全本來就是工程師應該必備的基本能力，也是專業素養的一部分。

在我看來，許多前端工程師並不是不願意理解或認識前端資安，而是根本不知道有這個東西，或甚至不知道從何開始。就像我之前有提過的，prototype pollution 似乎在資安圈是個眾所皆知的東西，但我以前學前端的時候怎麼沒人跟我講過？因此這個系列文除了總結我自己這兩年對於前端資安的認識以外，也希望能把資安的知識帶回到前端圈，讓更多人認識前端資安。

如果要說我對這個系列文有什麼期許的話，我希望它能成前端工程師的必讀經典之一（前提當然是系列文的深度以及廣度都必須到達一個程度，而且內容有一定的品質）。

我一直覺得做開發跟做資安是相輔相成的兩件事情，開發讓你更熟悉整體專案架構，知道一般工程師會怎麼做；而資安讓你知道很多細節，對每個小零件在做的事情以及整合有了更多的瞭解，而這些知識又會再進一步幫助你從另一個角度去看待開發，做出更安全的軟體。

若你對前端資安很感興趣，想要實際動手下去玩的話，我推薦 PortSwigger 的 [Web Security Academy](https://portswigger.net/web-security)，裡面有許多已經準備好的免費 lab，很適合新手遊玩。

若是還想關注一些前端資安的新知識，我也推薦大家可以追蹤底下這些人的推特，每一個都是我心目中的前端資安大師，而且研究的領域各有不同（排序為隨機排序）。

1. [@kinugawamasato](https://twitter.com/kinugawamasato)，對於前端資安非常熟悉，對於 JavaScript 的運作也非常熟，之前講過的 Teams RCE 就是他找到的，在前端資安這一塊非常專業。
2. [@terjanq](https://twitter.com/terjanq)，在 Google 工作的資安研究員，對於瀏覽器的運作很熟，對前端資安也很有研究，是 XS-Leaks Wiki 的維護者，對 XS-Leaks 非常有經驗
3. [@brutelogic](https://twitter.com/brutelogic)，XSS 大師，部落格裡面有很多可以練習 XSS 的題目
4. [@albinowax](https://twitter.com/albinowax)，PortSwigger 的首席研究員，每年都會發表新的 web 攻擊技術
5. [@garethheyes](https://twitter.com/garethheyes)，也是 PortSwigger 的資安研究員，找過很多與瀏覽器有關的前端漏洞，對於前端資安跟 JavaScript 也很在行
6. [@filedescriptor](https://twitter.com/filedescriptor)，之前在講 cookie tossing 跟 cookie bomb 時有提過他的演講
7. [@SecurityMB](https://twitter.com/SecurityMB)，經典的 Gmail DOM clobbering 以及利用 mutation XSS 繞過 DOMPurify 的漏洞都是他找的，現在似乎也在 Google 工作

還有其他前面的文章中比較少提到，但也都是前端資安圈知名的專家（沒有提到的不代表不是專家，可能只是我一時忘記而已，追蹤這些人之後推特就會自動推薦你其他專家了）：[@lbherrera_](https://twitter.com/lbherrera_)、[@RenwaX23](https://twitter.com/RenwaX23)、[@po6ix](https://twitter.com/po6ix)、[@Black2Fan](https://twitter.com/black2fan)、[@shhnjk](https://twitter.com/shhnjk) 以及 [@S1r1u5_](https://twitter.com/S1r1u5_)。

## 總結

無論你喜歡或是不喜歡這個系列，都歡迎去 [GitHub 討論區](https://github.com/aszx87410/beyond-xss/discussions)留言告訴我，有什麼想知道的資安問題或是對於文章的疑惑也都可以留言討論，感恩。

