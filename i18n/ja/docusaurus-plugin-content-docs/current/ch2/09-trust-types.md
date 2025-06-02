---
sidebar_position: 9
---

# 最新のXSS防御：Trusted Typesと組み込みSanitizer API

XSSの防御について議論する際、ユーザー入力の処理の必要性に言及しました。HTMLが許可されている場合は、それを処理するための信頼できるパッケージを見つける必要があります。

多くのウェブサイトにはそのような要件があるため、ブラウザは徐々に関連機能を提供し始めています。

新しい機能をゼロから作成するには通常、提案、仕様から実装まで数年かかる場合があり、長い時間がかかります。この記事で説明するTrusted TypesとSanitizer APIのトピックは、現在Chromiumベースのブラウザでのみサポートされています。最新バージョンのFirefox（119）とSafari（17）ではまだ正式にサポートされていません。したがって、この記事で言及されている内容は、時期が来たときに本番環境で将来使用するための参考として考えることができます。

## Sanitizer API

Sanitizer APIは、ブラウザが提供する組み込みのサニタイザーです。使用法は、以前に言及したDOMPurifyと非常に似ています。以下に例を示します。

```html
<!DOCTYPE html>
<html>
<body>
  <div id=content></div>
  <script>
    const html = `
      Hello,
      <script>alert(1)<\/script>
      <img src=x onerror=alert(1)>
      <a href=javascript:alert(1)>click me</a>
      <h1 onclick=alert(1) id=a>title</h1>
      <iframe></iframe>
    `; 
    const sanitizer = new Sanitizer(); 
    document
      .querySelector("#content")
      .setHTML(html, { sanitizer });
  </script>
</body>
</html>
```

Sanitizer APIと連携するために、`setHTML` という新しいメソッドが追加されました。元のHTMLとサニタイザーを渡すことにより、Sanitizer APIはフィルタリングを実行できます。

上記のHTMLのフィルタリング結果は次のとおりです。

```html
Hello,
<img src=x>
<a>click me</a>
<h1 id=a>title</h1>
```

すべての危険な要素が削除されました。Sanitizer APIの目標は、「どのように使用または構成しても、XSSは発生しない」ことを保証することです。これは利点でもあり欠点でもあります。明確にするために別の例を挙げましょう。

```html
<!DOCTYPE html>
<html>
<body>
  <div id=content></div>
  <script>
    const html = `
      Hello, this is my channel:
      <iframe src=https://www.youtube.com/watch?v=123></iframe>
    `; 
    const sanitizer = new Sanitizer({
      allowElements: ['iframe'],
      allowAttributes: {
        'iframe': ['src']
      }
    }); 
    document
      .querySelector("#content")
      .setHTML(html, { sanitizer });
    /*
        結果：Hello, this is my channel:
    */
  </script>
</body>
</html>
```

設定ファイルには、`src` 属性を含むiframeが許可されていると記載されています。ただし、最終結果では、iframeは依然として削除されます。これは、前述のように、Sanitizer APIが危険なタグを絶対に使用できないことを保証するためです。したがって、構成に関係なく、iframeは許可されません。

[Allow Embedding #124](https://github.com/WICG/sanitizer-api/issues/124)でも誰かがこの問題を提起しています。最大の問題は、iframeが許可され、「何があっても安全である」という仮定が維持されると、考慮すべきことがたくさんあることです。

例えば、`src` 属性にフィルタリングを適用する場合、その中のURLをフィルタリングする必要がありますか？`data:` URLを削除する必要がありますか？`srcdoc` はどうですか？それも再フィルタリングする必要がありますか？この問題はまだ未解決であり、1年以上活動がありません。

[Sanitizer APIの仕様](https://wicg.github.io/sanitizer-api/#baseline-elements)では、ベースライン要素とベースライン属性のリストが定義されています。非常に長いため、ここには貼り付けません。追加したい要素または属性がこのリストにない場合、何があっても使用する方法はありません。

これはSanitizer APIの利点でもあり欠点でもあると考えられます。柔軟性に欠けるかもしれませんが、利点は、どのように使用しても問題が発生しないことです。以前に紹介したサードパーティパッケージとは異なり、構成が適切に調整されていない場合に問題が発生する可能性があります。

現在、Sanitizer APIはまだ初期段階にあります。おそらく、将来、すべての主要なブラウザがSanitizer APIをサポートし、目的の機能を実現できるようになったときに、それに切り替えるかどうかを検討できます。

サニタイズには依然としてDOMPurifyの使用をお勧めしますが、Sanitizer APIについても理解しておくのは良いことです。

使用方法の詳細については、Googleの記事[Sanitizer APIを使用した安全なDOM操作](https://web.dev/sanitizer/)を参照してください。

## Trusted Types

Trusted Typesは、Sanitizer APIと同様に非常に新しく、現在Chromiumベースのブラウザでのみサポートされています。したがって、まだ成熟していないため、今のところ見ておくだけで十分です。

フロントエンドでユーザーデータをレンダリングする場合、XSSの脆弱性を防ぐために、ユーザー入力が適切にエスケープされていることを常に確認する必要があります。ただし、`innerHTML`、`<iframe srcdoc>`、`document.write` など、問題が発生する可能性のある場所は多数あります。未処理の入力を直接渡すと、XSSの脆弱性が作成されます。

開発者がコードを書く際に注意することに加えて、これらの場所で問題を防ぐ他の方法はありますか？例えば、`div.innerHTML = str` を実行し、`str` が未処理の文字列である場合、エラーをスローして実行を停止するとします。これにより、XSSの発生を減らすことができます。

はい、これがTrusted Typesの役割です。

CSPにTrusted Typesを追加した後、Trusted Typesを有効にしてこれらのDOM APIを保護し、HTMLを挿入する前にブラウザにTrusted Types処理を強制的に実行させることができます。

```
Content-Security-Policy: require-trusted-types-for 'script';
```

以下に例を示します。

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="require-trusted-types-for 'script'">
</head>
<body>
  <div id=content></div>
  <script>
    document.querySelector("#content").innerHTML = '<h1>hello</h1>'
  </script>
</body>
</html>
```

上記のコードは実行時にエラーをスローし、次のメッセージが表示されます。

> This document requires 'TrustedHTML' assignment. Uncaught TypeError: Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment.

Trusted Typesが適用されると、文字列を `innerHTML` に直接渡すことはできなくなります。代わりに、危険なHTMLを処理するための新しいTrusted Typesポリシーを作成する必要があります。方法は次のとおりです。

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="require-trusted-types-for 'script'">
</head>
<body>
  <div id=content></div>
  <script>
    // 新しいポリシーを作成します
    const sanitizePolicy = trustedTypes.createPolicy('sanitizePolicy', {
      // サニタイズ/エスケープを追加します
      createHTML: (string) => string
        .replace(/</g, "<")
        .replace(/>/g, '>')
    });
    // safeHtmlの型はTrustedHTMLであり、Stringではありません
    const safeHtml = sanitizePolicy.createHTML('<h1>hello</h1>')
    document.querySelector("#content").innerHTML = safeHtml
  </script>
</body>
</html>
```

Trusted Typesの目的は、「HTMLに問題がないことを保証する」ことではなく、「潜在的に問題のあるDOM APIでTrusted Typesの使用を強制し、文字列の使用を禁止する」ことです。これにより、多くのリスクが大幅に軽減されます。誤ってユーザー入力を処理し忘れた場合、ブラウザは未処理の文字列をHTMLとしてレンダリングする代わりにエラーをスローします。

したがって、Trusted Typesを有効にした後は、`createHTML` の実装にのみ焦点を当て、これらの実装が安全であることを確認する必要があります。さらに、上記の例から、`createHTML` の内容は私たちが決定するため、DOMPurifyと組み合わせることもできます。

Sanitizer APIとの組み合わせはどうでしょうか？可能であり、これは[公式ドキュメント](https://github.com/WICG/sanitizer-api/blob/main/faq.md#can-i-use-the-sanitizer-api-together-with-trusted-types)でも推奨されているアプローチです。

> Sanitizer APIをTrusted Typesと一緒に使用できますか？
> 
> はい、お願いします。これらは同じ問題の異なる側面を解決するAPIと見なしています。それらは別個ですが、うまく連携するはずです。
> Sanitizer API/Trusted Typesの統合の詳細はまだ検討中です。

## まとめ

この記事では、SanitizerとTrusted Typesという2つの新しいAPIを見てきました。これらのAPIは、ブラウザがサニタイズのサポートを積極的に提供し始めていることを意味するため、フロントエンドセキュリティにとって非常に重要であり、開発者が攻撃を防ぐためのより多くの防御策を持つことができます。

これら2つのAPIはまだ成熟していませんが、そう遠くない将来、徐々に主流になるのを見ることができるかもしれません。一部のフロントエンドフレームワークは、[Angular](https://angular.io/guide/security#enforcing-trusted-types)や[Next.js](https://github.com/vercel/next.js/issues/32209)など、すでにそれらに追いついており、Trusted Typesのサポートについて議論しているか、すでにサポートしています。

本番環境でTrusted Typesをいち早く試したい場合は、W3Cが提供するこのポリフィルを使用できます：[https://github.com/w3c/trusted-types](https://github.com/w3c/trusted-types)
