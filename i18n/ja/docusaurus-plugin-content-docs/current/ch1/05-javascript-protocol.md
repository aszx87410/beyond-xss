---
sidebar_position: 5
---

# 危険な javascript: 疑似スキーム

前回の記事では、様々なXSSのシナリオとコード実行方法について触れ、その中で `javascript:` 疑似スキームと呼ばれるものについて言及しました。これは現代のフロントエンドの観点から見ても、開発者が特に注意すべき点だと考えます。

そのため、この記事ではこのトピックについて詳しく説明する価値があります。

始める前に、前回の記事のブレインストーミングの質問に答えましょう。`innerHTML` の注入ポイントでは、`<script>` タグは実行されません。しかし、iframeと組み合わせることで使用できます。

iframeの `srcdoc` 属性には完全なHTMLを含めることができ、全く新しいウェブページを作成するようなものです。そのため、以前は役に立たなかった `<script>` タグもここでは使用できます。さらに、これは属性なので、内容は事前にエンコードでき、結果は同じになります。

```js
document.body.innerHTML =
  '<iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe>';
```

したがって、注入ポイントが `innerHTML` であっても、`<iframe srcdoc>` と `<script>` を使ってコードを実行できます。

それでは、この記事のメイントピックである「javascript: 疑似スキーム」に移りましょう。

## javascript: 疑似スキームとは？

「pseudo」という言葉は、仮想コードを意味するpseudo codeのようなものです。

HTTP、HTTPS、FTPのような「実際のプロトコル」と比較して、疑似スキームはネットワークとは無関係な特殊なプロトコルに近いです。疑似スキームの例としては、`mailto:` や `tel:` などがあります。

`javascript:` 疑似スキームが特別な理由は、JavaScriptコードの実行に使用できるためです。

## javascript: 疑似スキームはどこで使用できるか？

1つ目は、前回の記事で言及したhref属性です。

```html
<a href="javascript:alert(1)">Link</a>
```

このリンクをクリックするだけでXSS攻撃がトリガーされます。

2つ目は、`<iframe>` のsrc属性です。

```html
<iframe src="javascript:alert(1)"></iframe>
```

`<a>` の例とは異なり、これはユーザーの操作なしでトリガーされます。

最後に、`<form>` の `action` 属性にも同じものを含めることができます。`<button>` の `formaction` 属性も同様ですが、これらは両方とも `<a>` と同様にクリックしてトリガーする必要があります。

```html
<form action="javascript:alert(1)">
  <button>submit</button>
</form>

<form id="f2"></form>
<button form="f2" formaction="javascript:alert(2)">submit</button>
```

## なぜ危険なのか？

これは見落とされがちで、実際のアプリケーションで頻繁に使用されるためです。

例えば、ウェブサイトにユーザーがYouTube動画のURLを入力し、記事に自動的に埋め込む機能があり、この機能の開発者がセキュリティ意識に欠けている場合、次のように書くかもしれません。

```php
<iframe src="<?= $youtube_url ?>" width="500" height="300"></iframe>
```

YouTubeのURLとして `javascript:alert(1)` を入力すると、XSS脆弱性になります。URLに `youtube.com` が含まれているかどうかのチェックを追加したとしても、入力値検証が不十分な場合では`javascript:alert(1);console.log('youtube.com')` などのパターンを使ってバイパスできます。

正しいアプローチは、URLがYouTube動画の形式であるかを確認し、URLが `https://` で始まることを確認することです。

上記の機能があまり一般的ではないと思う場合は、プロフィールページに自分のブログやFacebookのURLを入力し、ページにハイパーリンクを追加してみてください。この機能はより一般的ですよね？

これは簡単に見落とされる領域です。私自身、台湾のオンラインコースプラットフォームである[Hahow](https://zeroday.hitcon.org/vulnerability/ZD-2020-00903)でこの脆弱性を発見しました。

![](pics/05-01.png)

バックエンドの実装をコードとして書くと、次のようになります。

```php
<a href="<?php echo htmlspecialchars($data) ?>">link</a>`
```

`<>"` がエンコードされていても、タグの追加や属性を追加するための二重引用符のエスケープが妨げられていても、攻撃者は `javascript:alert(1)` を注入できます。なぜなら、その中には不正な文字が含まれていないからです。

さらに、現代のフロントエンドフレームワークは通常、エスケープを自動的に処理します。Reactで `dangerouslySetInnerHTML` を使用したり、Vueで `v-html` を使用したりしていない場合は、問題ないはずです。ただし、`href` は前述の理由から異なります。その内容はサニタイズされません。

したがって、Reactでこのように書くと問題が発生します。

```jsx
import React from "react";

export function App(props) {
  // Assume the following data comes from the user input
  const href = "javascript:alert(1)";
  return <a href={href}>click me</a>;
}
```

これはXSS脆弱性であり、クリックするだけでコードが実行されます。

ただし、Reactはv16.9でこの動作に対する警告を導入し、ドキュメントにも記載されています：[Deprecating javascript: URLs](https://legacy.reactjs.org/blog/2019/08/08/react-v16.9.0.html#deprecating-javascript-urls)。警告メッセージは次のとおりです。

> Warning: A future version of React will block javascript: URLs as a security precaution. Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead.

ReactのGitHubイシューでも、このトピックに関するさらなる議論があります。

1. [React@16.9 block javascript:void(0); #16592](https://github.com/facebook/react/issues/16592)
2. [False-positive security precaution warning (javascript: URLs) #16382](https://github.com/facebook/react/issues/16382)

一方、Vueでは次のように書くことができます。

```js
<script setup>
import { ref } from 'vue'

const link = ref('javascript:alert(1)')
</script>

<template>
  <a :href="link">click me</a>
</template>
```

これもJavaScriptを正常に実行します。この攻撃方法はVueのドキュメントで[URL Injection](https://vuejs.org/guide/best-practices/security.html#potential-dangers)として言及されています。開発者はフロントエンドまで待つのではなく、バックエンドでURLの検証と処理を行うことが推奨されています。

フロントエンドで処理する必要がある場合は、[sanitize-url](https://github.com/braintree/sanitize-url)ライブラリを使用することが提案されています。

## ページリダイレクトもリスクを伴う

多くのウェブサイトでは、「ログイン後にリダイレクト」機能を実装しており、ログイン前にユーザーが元々意図していたページにリダイレクトします。次のようになります。

```js
const searchParams = new URLSearchParams(location.search);
window.location = searchParams.get("redirect");
```

では、このコードの問題点は何でしょうか？

問題は、`window.location` の値も `javascript:` 疑似スキームになり得るということです！

```js
window.location = "javascript:alert(document.domain)";
```

上記のコードを実行すると、おなじみのアラートウィンドウが表示されます。これはフロントエンドエンジニアが注意すべき点です。前述のように、リダイレクトは一般的な機能であり、実装する際には問題のあるコードを書かないようにこの問題に注意する必要があります。

実際、私はMatters Newsという別のウェブサイトでこの脆弱性を発見しました。これが彼らのログインページです。

![](pics/05-02.png)

確認ボタンをクリックすると、`redirectToTarget` という関数が呼び出され、この関数のコードは次のとおりです。

```js
/**
 * Redirect to "?target=" or fallback URL with page reload.
 *
 * (works on CSR)
 */
export const redirectToTarget = ({
  fallback = "current",
}: {
  fallback?: "homepage" | "current",
} = {}) => {
  const fallbackTarget =
    fallback === "homepage"
      ? `/` // FIXME: to purge cache
      : window.location.href;
  const target = getTarget() || fallbackTarget;

  window.location.href = decodeURIComponent(target);
};
```

ターゲットを取得した後、リダイレクトに直接 `window.location.href = decodeURIComponent(target)` を使用します。そして `getTarget` は、クエリ文字列からターゲットの値を取得するだけです。したがって、ログインURLが `https://matters.news/login?target=javascript:alert(1)` の場合、ユーザーがログインをクリックして成功すると、アラートがポップアップし、XSSがトリガーされます。

さらに、このXSSがトリガーされると、ログインページで発生するため、その影響は重大です。したがって、このページで実行されるXSSは入力値を直接キャプチャでき、つまりユーザーのユーザー名とパスワードを盗むことができます。実際の攻撃を実行するには、ウェブサイトのユーザーにフィッシングメールを送信し、この悪意のあるリンクを含めてクリックさせることができます。URLは正常に見え、結果のページも実際のウェブサイトのページであるため、信頼性は非常に高いはずです。

ユーザーがユーザー名とパスワードを入力してログインした後、XSSを介してユーザー名とパスワードを盗み、ユーザーをホームページにリダイレクトすることで、痕跡を残さずにユーザーのアカウントを侵害し、アカウント乗っ取りを達成できます。

要するに、誰もがXSSの基本的な概念には精通していると思いますが、`javascript:` 疑似スキームの攻撃対象領域についてはそれほど精通していないかもしれません。したがって、このような属性に遭遇した際にはより注意を払い、適切な防御策を講じることができるように、この問題について具体的に説明したいと思います。

## 防御方法

まず、前述の[sanitize-url](https://github.com/braintree/sanitize-url)のようなライブラリがあれば理想的です。完全にリスクがないわけではありませんが、広く使用されており、広範なテストを経ているため、多くの問題やバイパス方法はすでに対処されている可能性があります。

自分で処理しますか？可能ですが、自分で処理すると通常何が起こるか見てみましょう。

攻撃文字列は `javascript:alert(1)` なので、`javascript:` で始まるかどうかを確認したり、文字列から `javascript` のすべてのインスタンスを削除したりすれば十分だと考える人もいるかもしれません。

ただし、これは `href` 属性の内容であり、HTMLの属性内容はエンコードできるため、このアプローチは効果的ではありません。つまり、次のようにできます。

```html
<a href="&#106avascript&colon;alert(1)">click me</a>
```

内部にはフィルタリングしたいコンテンツはなく、`javascript:` で始まっていないため、制限をバイパスできます。

より良いアプローチは、`http://` または `https://` で始まる文字列のみを許可することです。これにより、通常は問題が発生しなくなります。より厳密な方法の中には、次のようにJavaScriptを使用してURLを解析するものがあります。

```js
console.log(new URL("javascript:alert(1)"));
/*
  {
    // ...
    href: "javascript:alert(1)",
    origin: "null",
    pathname: "alert(1)",
    protocol: "javascript:",
  }
*/
```

これにより、プロトコルに基づいてプロトコルが有効かどうかを判断し、許可リストにないコンテンツをブロックできます。

もう1つのよくある間違いは、次のようにホスト名またはオリジンに基づいてURL解析を使用することです。

```js
console.log(new URL("javascript:alert(1)"));
/*
  {
    // ...
    hostname: "",
    host: "",
    origin: null
  }
*/
```

`hostname` または `host` が空の場合、無効なURLであることを意味します。この方法は一見問題ないように見えるかもしれませんが、JavaScriptで `//` がコメントとして扱われる機能と改行文字を組み合わせて、URLのように見えるが実際には `javascript:` 疑似スキームである文字列を作成できます。

```js
console.log(new URL("javascript://huli.tw/%0aalert(1)"));
/*
  {
    // ...
    hostname: "",
    host: "",
    origin: null
  }
*/
```

URLのように見えますが、Chromeでは問題なく動作し、誤検知もありません。ただし、Safariの動作は異なります。Safari 16.3で同じコードを実行すると、出力は次のようになります。

```js
console.log(new URL("javascript://huli.tw/%0aalert(1)"));
/*
  {
    // ...
    hostname: "huli.tw",
    host: "huli.tw",
    origin: "null"
  }
*/
```

Safariでは、ホスト名とホストを正常に解析します。ちなみに、このトリックは[Masatoさんのツイート](https://twitter.com/kinugawamasato/status/1636406640042971136)から学びました。

本当にRegExpを使用して `javascript:` 疑似スキームかどうかを確認したい場合は、Reactの[ソースコード](https://github.com/facebook/react/blob/v18.2.0/packages/react-dom/src/shared/sanitizeURL.js#L22)の実装を参照できます（多くのライブラリが同様のRegExpを使用しています）。

```js
// A javascript: URL can contain leading C0 control or \u0020 SPACE,
// and any newline or tab are filtered out as if they're not part of the URL.
// https://url.spec.whatwg.org/#url-parsing
// Tab or newline are defined as \r\n\t:
// https://infra.spec.whatwg.org/#ascii-tab-or-newline
// A C0 control is a code point in the range \u0000 NULL to \u001F
// INFORMATION SEPARATOR ONE, inclusive:
// https://infra.spec.whatwg.org/#c0-control-or-space

/* eslint-disable max-len */
const isJavaScriptProtocol =
  /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
```

この正規表現から、`javascript:` の柔軟性がわかります。先頭に追加の文字を含めることができ、文字列内に無制限の改行やタブを含めることさえできます。これが、仕様に精通してこれらの動作を理解する必要があるため、自分で処理するのは難しいと述べた理由です。

前述の方法に加えて、単に `target="_blank"` を追加するだけで大きな効果があります。なぜなら、多くのブラウザがすでにこの問題に対処しているからです。

Chromeでは、リンクをクリックすると、URL `about:blank#blocked` の新しいタブが開きます。Firefoxでは、URLなしの新しいタブが開きます。Safariでは何も起こりません。これらのデスクトップブラウザはいずれもJavaScriptを実行しません。

テストされたバージョンはChrome 115、Firefox 116、Safari 16.3です。

実際のところ、ほとんどのリンクには `target="_blank"` 属性が付いています。

ただし、ユーザーが左マウスボタンではなく中央マウスボタンでリンクをクリックした場合、状況が異なる可能性があります。したがって、状況に関係なく、ブラウザの保護に頼るのではなく、根本原因を修正する必要があります。

詳細については、[The curious case of XSS and the mouse middle button.](http://blog.dclabs.com.br/2021/05/the-curious-case-of-xss-and-mouse.html) および [Anchor Tag XSS Exploitation in Firefox with Target="\_blank"](https://soroush.me/blog/2023/08/anchor-tag-xss-exploitation-in-firefox-with-target_blank/) を参照してください。

## 実例

少し前（2023年6月）にTelegramウェブ版で発見された脆弱性を見てみましょう。これは `javascript:` 疑似スキームに関連しており、Slonserの記事 [История одной XSS в Telegram](https://habr.com/ru/articles/744316/)（ロシア語）で言及されていました。

Telegram Web A（Telegramには複数のウェブ版があります）には、URLに `://` があるかどうかを確認する `ensureProtocol` という関数があります。ない場合は、自動的に `http://` を追加します。

```js
export function ensureProtocol(url?: string) {
  if (!url) {
    return undefined;
  }
  return url.includes("://") ? url : `http://${url}`;
}
```

`javascript:alert('://')` のようなものを使用することで、このチェックを簡単にバイパスできます。これにより、`javascript:` 疑似スキームの使用が成功します。ただし、問題は、サーバーもURLが有効なアドレスであるかどうかを確認し、前の文字列は明らかにそうではないことです。

URLの先頭にはユーザー名とパスワードを含めることができます（HTTP認証で使用されます）。これらはコロン（`:`）で区切られます。次のようになります。

```
https://username:password@www.example.com/
```

したがって、Slonserはこの文字列を使用してチェックをバイパスできることを発見しました。

```
javascript:alert@github.com/#://
```

この場合、`javascript` はユーザー名、`alert` はパスワード、ホスト名は `github.com` です。`http://` や `https://` で始まっていませんが、サーバーは依然として有効なURLと見なします。

最後に、URLエンコーディングを組み合わせることで、有効な文字のみを含むパスワードを持つURLが生成されます。

```
javascript:alert%28%27Slonser%20was%20here%21%27%29%3B%2F%2F@github.com#;alert(10);://eow5kas78d0wlv0.m.pipedream.net%27

// デコード後
javascript:alert('Slonser was here!');//@github.com#;alert(10);://eow5kas78d0wlv0.m.pipedream.net'
```

サーバーは上記の文字列をリンクとして認識し、クライアントは `://` チェックをバイパスできます。ユーザーがこのリンクをクリックすると、XSS攻撃がトリガーされます。

Telegramは後に、前述の方法を実装することでこの問題を修正しました。これはURLをチェックし、プロトコルが `javascript:` でないことを確認するものです。[Link: Fix protocol verification (#3417)](https://github.com/Ajaxy/telegram-tt/commit/a8d025395bc0032d964c2afc8c4fb5d2fa631a44):

```js
export function ensureProtocol(url?: string) {
  if (!url) {
    return undefined;
  }

  // HTTP was chosen by default as a fix for https://bugs.telegram.org/c/10712.
  // It is also the default protocol in the official TDesktop client.
  try {
    const parsedUrl = new URL(url);
    // eslint-disable-next-line no-script-url
    if (parsedUrl.protocol === "javascript:") {
      return `http://${url}`;
    }

    return url;
  } catch (err) {
    return `http://${url}`;
  }
}
```

## まとめ

この記事では、`javascript:` 疑似スキームの危険な側面を見てきました。これは `<a>` タグの `href` 属性内に配置でき、これは一般的なユースケースです。さらに、開発者は潜在的なリスクを忘れがちであるか、それらに気づいていない可能性があり、脆弱性につながります。

ほとんどの場合、ハイパーリンクは新しいタブで開かれ、JavaScriptコードの実行を防ぎますが、動作が一貫している保証はありません（たとえば、target属性が指定されていない場合など）。また、古いブラウザや新しいタブを開くための代替方法を使用する場合も同様です。これはユーザーにとってリスクとなります。

さらに、リダイレクトを実行する際には、`javascript:` 疑似スキームに関連する問題を考慮することが重要です。適切な予防策を講じないと、XSS脆弱性につながる可能性があります。

開発者として、有名な引用句にあるように、これらの問題を常に認識し、コードで適切に処理することが重要です。

> ユーザー入力を決して信頼しないでください。

最後に、皆さんに小さな質問を残します。次のコードの問題点は何でしょうか？必ずしもXSS脆弱性である必要はありません。セキュリティ関連の問題であれば何でも構いません。

```js
// これは、ユーザーがお気に入りのYouTube動画をプロフィールページに埋め込むことができる機能です
const url = "value from user";

// YouTube動画のURLであることを確認します
if (url.startsWith("https://www.youtube.com/watch")) {
  document.querySelector("iframe").src = url;
}
```

参考資料：[リダイレクト機能を実装する際に注意すべき問題：オープンリダイレクト](https://blog.huli.tw/2021/09/26/what-is-open-redirect/)
