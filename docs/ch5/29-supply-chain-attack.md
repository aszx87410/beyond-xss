---
sidebar_position: 29
---

# 前端供應鏈攻擊：從上游攻擊下游

Supply chain attack，中文翻成供應鏈攻擊，這個手法瞄準了上游的漏洞進行攻擊，因為只要污染了上游，下游也會一併被污染。

以前端為例，你使用的 npm 套件或是程式碼中引入的第三方 script，這些就叫做「上游」，在使用這些第三方資源的同時，你有意識到這也伴隨了一定的風險嗎？

這篇文章會以 cdnjs 為例，帶大家看看前端的供應鏈攻擊與防禦。

## cdnjs

在寫前端的時候，常常會碰到許多要使用第三方 library 的場合，例如說 jQuery 或者是 Bootstrap 之類的（前者在 npm 上每週 400 萬次下載，後者 300 萬次）。先撇開現在其實大多數都會用 webpack 自己打包這點不談，在以往像這種需求，要嘛就是自己下載一份檔案，要嘛就是找現成的 CDN 來載入。

而 cdnjs 就是其中一個來源，它的官網長這樣：

![cdnjs](./pics/29-01.png)

除了 cdnjs，也有其他提供類似服務的網站，例如說在 [jQuery](https://jquery.com/download/) 官網上可以看見他們自己的 code.jquery.com ，而 [Bootstrap](https://getbootstrap.com/) 則是使用了另一個叫做 [jsDelivr](https://www.jsdelivr.com/) 的服務。

舉個實際的例子吧！

假設我現在做的網站需要用到 jQuery，我就要在頁面中用 `<script>` 標籤載入 jQuery 這個函式庫，而這個來源可以是：

1. 我自己的網站
2. jsDelivr: https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
3. cdnjs: https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
4. jQuery 官方：https://code.jquery.com/jquery-3.6.0.min.js

假設我最後選擇了 jQuery 官方提供的網址，就會寫下這一段 HTML：

``` html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

如此一來，就載入了 jQuery 這個函式庫，其他程式碼就可以使用它所提供的功能。

那為什麼我要選擇 CDN，而不是選擇下載下來，放在自己的網站上呢？可能有幾個理由：

1. 懶惰，直接用別人的最快
2. 預算考量，放別人網站可以節省自己網站流量花費跟負荷
3. 速度考量

第三點速度考量值得特別說明一下，如果載入的函式庫是來自於 CDN，下載的速度可能會比較快。

比較快的理由是他們本來就是做 CDN 的，所以在不同國家可能都有節點。假設你主機放在美國，那若是放自己網站，台灣的使用者就要連到美國的伺服器去抓這些 library，但如果是用 CDN 提供的網址，可能只要連到台灣的節點就好，省去一些延遲（latency）。

以大家熟悉的 [iT 邦幫忙](https://ithelp.ithome.com.tw/articles?tab=tech)網站為例，就有使用到來自於 google 跟 cdnjs 的資源：

![cdnjs](./pics/29-02.png)

前面講了一些使用第三方 CDN 的優點，那缺點是什麼呢？

第一個缺點是如果 CDN 掛了，你的網站可能會跟著一起掛，就算不是掛掉，連線緩慢也是一樣。例如說我網站從 cdnjs 載入了 jQuery，可是 cdnjs 突然變得很慢，那我的網站也會變得很慢，一起被牽連。

而 cdnjs 背後的公司 Cloudflare 確實有[出過事](https://techcrunch.com/2019/06/24/cloudflare-outage-affecting-numerous-sites-on-monday-am/)，連帶影響了許多網站。

第二個缺點是如果 CDN 被駭客入侵了，你引入的函式庫被植入惡意程式碼，那你的網站就會跟著一起被入侵。而這樣子的攻擊手法，就是這篇的主題：「供應鏈攻擊」，從上游入侵，連帶影響到下游。

有些人可能會想說：「這些大公司不太可能被入侵吧？而且這服務這麼多人用，一定有人在把關吧」

接著，就讓我們來看一個實際案例。

## 解析 cdnjs 的 RCE 漏洞

2021 年 7 月 16 號，一名資安研究員 [@ryotkak](https://twitter.com/ryotkak) 在他的部落格上發布了一篇文章，名為：[Remote code execution in cdnjs of Cloudflare](https://blog.ryotak.me/post/cdnjs-remote-code-execution-en/)（以下用「作者」來稱呼）。

Remote code execution 簡稱為 RCE，這種漏洞可以讓攻擊者執行任意程式碼，是風險等級很高的漏洞。而作者發現了一個 cdnjs 的 RCE 漏洞，若是有心利用這個漏洞的話，可以控制整個 cdnjs 的服務。

作者的部落格文章把過程寫得十分詳細，我在這邊簡單講一下漏洞是怎麼形成的，一共有兩個漏洞。

首先呢，Cloudflare 有把 cdnjs 相關的程式碼開源在 GitHub 上面，而其中有一個自動更新的功能引起了作者的注意。這個功能會自動去抓 npm 上打包好的 package 檔案，格式是壓縮檔 .tgz，解壓縮之後把檔案做一些處理，複製到合適的位置。

而作者知道在 Go 裡面如果用 `archive/tar` 來解壓縮的話可能會有漏洞，因為解壓縮出來的檔案沒有經過處理，所以檔名可以長得像是這樣：`../../../../../tmp/temp`

長成這樣有什麼問題呢？

假設今天你有一段程式碼是複製檔案，然後做了類似底下的操作：

1. 用目的地 + 檔名拼湊出目標位置，建立新檔案
2. 讀取原本檔案，寫入新檔案

如果目的地是 `/packages/test`，檔名是 `abc.js`，那最後就會在 `/packages/test/abc.js` 產生新的檔案。

這時候若是目的地一樣，檔名是 `../../../tmp/abc.js`，就會在 `/package/test/../../../tmp/abc.js` 也就是 `/tmp/abc.js` 底下寫入檔案。

因此透過這樣的手法，可以寫入檔案到任何有權限的地方！而 cdnjs 的程式碼就有類似的漏洞，能夠寫入檔案到任意位置。如果能利用這漏洞，去覆蓋掉原本就會定時自動執行的檔案的話，就可以達成 RCE 了。

當作者正想要做個 POC 來驗證的時候，突然很好奇針對 Git 自動更新的功能是怎麼做的（上面講的關於壓縮檔的是針對 npm 的）

而研究過後，作者發現關於 Git repo 的自動更新，有一段複製檔案的程式碼，長這個樣子：

``` go
func MoveFile(sourcePath, destPath string) error {
    inputFile, err := os.Open(sourcePath)
    if err != nil {
        return fmt.Errorf("Couldn't open source file: %s", err)
    }
    outputFile, err := os.Create(destPath)
    if err != nil {
        inputFile.Close()
        return fmt.Errorf("Couldn't open dest file: %s", err)
    }
    defer outputFile.Close()
    _, err = io.Copy(outputFile, inputFile)
    inputFile.Close()
    if err != nil {
        return fmt.Errorf("Writing to output file failed: %s", err)
    }
    // The copy was successful, so now delete the original file
    err = os.Remove(sourcePath)
    if err != nil {
        return fmt.Errorf("Failed removing original file: %s", err)
    }
    return nil
}
```

看起來沒什麼，就是複製檔案而已，開啟一個新檔案，把舊檔案的內容複製進去。

但如果這個原始檔案是個 symbolic link 的話，就不一樣了。在繼續往下之前，先簡單介紹一下什麼是 symbolic link。

Symbolic link 的概念有點像是以前在 Windows 上看到的「捷徑」，這個捷徑本身只是一個連結，連到真正的目標去。

在類 Unix 系統裡面可以用 `ln -s 目標檔案 捷徑名稱` 去建立一個 symbolic link，這邊直接舉一個例子會更好懂。

我先建立一個檔案，內容是 hello，位置是 `/tmp/hello`。接著我在當前目錄底下建立一個 symbolic link，指到剛剛建立好的 hello 檔案：`ln -s /tmp/hello link_file`

接著我如果印出 `link_file` 的內容，會出現 `hello`，因為其實就是在印出 `/tmp/hello` 的內容。如果我對 `link_file` 寫入資料，實際上也是對 `/tmp/hello` 寫入。

![cdnjs](./pics/29-03.png)

再來我們試試看用 Node.js 寫一段複製檔案的程式碼，看看會發生什麼事：

``` js
node -e 'require("fs").copyFileSync("link_file", "test.txt")'
```

執行完成之後，我們發現目錄底下多了一個 `test.txt` 的檔案，內容是 `/tmp/hello` 的檔案內容。

所以用程式在執行複製檔案時，並不是「複製一個 symbolic link」，而是「複製指向的檔案內容」。

因此呢，我們剛剛提到的 Go 複製檔案的程式碼，如果有個檔案是指向 `/etc/passwd` 的 symbolic link，複製完以後就會產生出一個內容是 `/etc/passwd` 的檔案。

我們可以在 Git 的檔案裡面加一個 symbolic link 名稱叫做 `test.js`，讓它指向 `/etc/passwd`，這樣被 cdnjs 複製過後，就會產生一個 test.js 的檔案，而且裡面是 `/etc/passwd` 的內容！

如此一來，就得到了一個任意檔案讀取（Arbitrary File Read）的漏洞。

講到這邊稍微做個總結，作者一共找到兩個漏洞，一個可以寫檔案一個可以讀檔案，寫檔案如果不小心覆蓋重要檔案會讓系統掛掉，因此作者決定從讀檔案開始做 POC，自己建了一個 Git 倉庫然後發佈新版本，等 cdnjs 去自動更新，最後觸發檔案讀取的漏洞，在 cdnjs 發布的 JS 上面就可以看到讀到的檔案內容。

而作者讀的檔案是 `/proc/self/environ`（他本來是想讀另一個 `/proc/self/maps`），這裡面有著環境變數，而且有一把 GitHub 的 api key 也在裡面，這把 key 對 cdnjs 底下的 repo 有寫入權限，所以利用這把 key，可以直接去改 cdnjs 或是 cdnjs 網站的程式碼，進而控制整個服務。

以上就是關於 cdnjs 漏洞的解釋，想看更多技術細節或是詳細發展的話，可以去看原作者的部落格文章，裡面記錄了許多細節。總之呢，就算是大公司在維護的服務，也是有被入侵的風險存在。

而 Cloudflare 也在一週後發佈了事件處理報告：[Cloudflare's Handling of an RCE Vulnerability in cdnjs](https://blog.cloudflare.com/cloudflares-handling-of-an-rce-vulnerability-in-cdnjs/)，記錄了事情發生的始末以及事後的修補措施，他們把整個架構都重寫了，把原本解壓縮的部分放到 Docker sandbox 裡面，增加了整體的安全性。

## 身為前端工程師，該如何防禦？

那我們究竟該如何防禦這類型的漏洞？或搞不好，我們根本防禦不了？

瀏覽器其實有提供一個功能：「如果檔案被竄改過，就不要載入」，這樣僅管 cdnjs 被入侵，jQuery 的檔案被竄改，我的網站也不會載入新的 jQuery 檔案，免於檔案污染的攻擊。

在 cdnjs 上面，當你決定要用某一個 library 的時候，你可以選擇要複製 URL 還是複製 script tag，若是選擇後者，就會得到這樣的內容：

``` html
<script
    src="https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js"
    integrity="sha512-TS4lzp3EVDrSXPofTEu9VDWDQb7veCZ5MOm42pzfoNEVqccXWvENKZfdm5lH2c/NcivgsTDw9jVbK+xeYfzezw=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer">
</script>
```

`crossorigin="anonymous"` 這個之前有提過了，利用 CORS 的方式送出 request，可以避免把 cookie 一起帶到後端去。

而上面的另一個標籤 `integrity` 才是防禦的重點，這個屬性會讓瀏覽器幫你確認要載入的資源是否符合提供的 hash 值，如果不符合的話，就代表檔案被竄改過，就不會載入資源。所以，就算 cdnjs 被入侵了，駭客替換掉了我原本使用的 react.js，瀏覽器也會因為 hash 值不合，不會載入被污染過的程式碼。

想知道更多的話可以參考 MDN，上面有一頁 [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) 專門在講這個。

不過這種方法只能防止「已經引入的 script」被竄改，如果碰巧在駭客竄改檔案之後才複製 script，那就沒有用了，因為那時候的檔案已經是竄改過的檔案了。

所以如果要完全避免這個風險，就是不要用這些第三方提供的服務，把這些 library 放到自己家的 CDN 上面去，這樣風險就從第三方的風險，變成了自己家服務的風險。除非自己家的服務被打下來，不然這些 library 應該不會出事。

而現在許多網站因為 library 都會經由 webpack 這類型的 bundler 重新切分，所以沒有辦法使用第三方的 library CDN，一定會放在自己家的網站上，也就排除了這類型的供應鏈攻擊。

可是要注意的是，你仍然避免不了其他供應鏈攻擊的風險。因為儘管沒有用第三方的 library CDN，還是需要從別的地方下載這些函式庫對吧？例如說 npm，你的函式庫來源可能是這裡，意思就是如果 npm 被入侵了，上面的文件被竄改，還是會影響到你的服務。這就是供應鏈攻擊，不直接攻擊你，而是從其他上游滲透進來。

不過這類型的風險可以在 build time 的時候透過一些靜態掃描的服務，看能不能抓出被竄改的檔案或是惡意程式碼，或也有公司會在內部架一個 npm registry，不直接與外面的 npm 同步，確保使用到的函式庫不會被竄改。

## 小結

攻擊手法千千百百種，發現 cdnjs 漏洞的研究員近期鍾情於 supply chain attack，不只 cdnjs，連 [Homebrew](https://blog.ryotak.me/post/homebrew-security-incident-en/) 跟 [PyPI](https://blog.ryotak.me/post/pypi-potential-remote-code-execution-en/) 甚至是 [@types](https://blog.ryotak.me/post/definitelytyped-tamper-with-arbitrary-packages-en/) 也都被找到漏洞。

如果要直接在頁面上用 script 引入第三方的網址，記得先確認對方的網站是值得信任的，如果可以的話也請加上 integrity 屬性，避免檔案被竄改，連帶影響到自己的服務。也要注意 CSP 的設定，對於 cdnjs 這種網站，若是只設置 domain 的話，已經有了可行的繞過手法，在設置前請多加注意。

希望藉由 cdnjs 的漏洞讓前端工程師們認識什麼是供應鏈攻擊。只要有意識到這個攻擊手法，日後在開發時就會多留意一些，就會注意到引入第三方 library 所帶來的風險。
