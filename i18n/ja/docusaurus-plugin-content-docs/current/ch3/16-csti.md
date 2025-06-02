---
sidebar_position: 16
---

# フロントエンドのテンプレートインジェクション攻撃：CSTI

CSTI（Client Side Template Injection）は、フロントエンドでのテンプレートインジェクションを指します。フロントエンド版があるということは、対応するバックエンド版もあり、それはSSTI（Server Side Template Injection）と呼ばれます。

フロントエンド版を紹介する前に、バックエンド版を見てみましょう。

## サーバーサイドテンプレートインジェクション

バックエンドでHTMLを出力する必要がある場合、純粋なPHPのように直接出力することを選択できます。

```php
<?php
  echo '<h1>hello</h1>';
?>
```

しかし、HTMLに動的な部分がある場合、コードはますます複雑になります。したがって、実際の開発では、通常、テンプレートエンジンと呼ばれるものが使用されます。これは、サニタイズについて話したときに少し触れました。

例えば、私のブログの記事ページには、次のようなテンプレートの一部があります。

```html
<article class="article content gallery" itemscope itemprop="blogPost">
    <h1 class="article-title is-size-3 is-size-4-mobile" itemprop="name">
        <%= post.title %>
    </h1>
    <div class="article-meta columns is-variable is-1 is-multiline is-mobile is-size-7-mobile">
        <span class="column is-narrow">
            <time datetime="<%= date_xml(post.date) %>" itemprop="datePublished"><%= format_date_full(post.date) %></time>
        </span>
        <% if (post.categories && post.categories.length){ %>
        <span class="column is-narrow article-category">
            <i class="far fa-folder"></i>
            <%- (post._categories || post.categories).map(category =>
                    `<a class="article-category-link" href="${url_for(category.path)}">${category.name}</a>`)
                    .join('<span>></span>') %>
        </span>
        <% } %>
    </div>
    
    <div class="article-entry is-size-6-mobile" itemprop="articleBody">
        <%- post.content %>
    </div>
</article>
```

レンダリング時には、`post` オブジェクトを渡してテンプレートと組み合わせるだけで、完全な記事ページをレンダリングできます。

テンプレートインジェクションは、「攻撃者が `post` のようなデータを操作できる」という意味ではなく、「攻撃者がテンプレート自体を操作できる」という意味です。

例えば、マーケティングメールサービスがあるとします。通常、企業はユーザーデータをインポートし、次のような独自のテンプレートを設定します。

```html
こんにちは、{{name}} 様

弊社の製品にご満足いただけていますでしょうか？
ご不便な点がございましたら、お気軽にご都合の良い時間に10分間のオンラインミーティングを予約してください。

こちらから予約できます：<a href="{{link}}?q={{email}}">予約リンク</a>

Huli
```

テンプレートがバックエンドによって直接使用される場合、PythonとJinja2を例にとると、次のようになります。

```python
from jinja2 import Template

data = {
    "name": "Peter",
    "link": "https://example.com",
    "email": "test@example.com"
}

template_str = """
こんにちは、{{name}} 様

弊社の製品にご満足いただけていますでしょうか？
ご不便な点がございましたら、お気軽にご都合の良い時間に10分間のオンラインミーティングを予約してください。

こちらから予約できます：<a href="{{link}}?q={{email}}">予約リンク</a>

Huli
"""
template = Template(template_str)
rendered_template = template.render(
    name=data['name'],
    link=data['link'],
    email=data['email'])
print(rendered_template)
```

最終的な出力は次のとおりです。

```html
こんにちは、Peter 様

弊社の製品にご満足いただけていますでしょうか？
ご不便な点がございましたら、お気軽にご都合の良い時間に10分間のオンラインミーティングを予約してください。

こちらから予約できます：<a href="https://example.com?q=test@example.com">予約リンク</a>

Huli
```

問題ないように見えますが、テンプレートを変更するとどうなるでしょうか？このように：

```python
from jinja2 import Template

data = {
    "name": "Peter",
    "link": "https://example.com",
    "email": "test@example.com"
}

template_str = """
Output: {{ 
    self.__init__.__globals__.__builtins__
    .__import__('os').popen('uname').read()
}}
"""
template = Template(template_str)
rendered_template = template.render(
    name=data['name'],
    link=data['link'],
    email=data['email'])
print(rendered_template)
```

出力は `Output: Darwin` になります。Darwinは `uname` コマンドを実行した結果です。

簡単に言うと、`{{}}` 内のコンテンツはテンプレートエンジンが実行するコードと考えることができます。

以前は単純な `{{name}}` しか記述していませんでしたが、実際には `{{ name + email }}` のような操作も可能です。上記のケースでは、`self` から始まり、Pythonの魔法を使用して `__import__` を読み込み、他のモジュールをインポートしてコマンド実行を達成しています。

攻撃者がテンプレートを制御できる脆弱性はテンプレートインジェクションと呼ばれます。バックエンドで発生する場合はSSTI、フロントエンドで発生する場合はCSTIと呼ばれます。

防御方法は単純です。ユーザー入力をテンプレートの一部として扱わないことです。どうしてもそうする必要がある場合は、テンプレートエンジンがサンドボックス機能を提供しているかどうかを確認し、信頼できないコードを安全な環境で実行できるようにしてください。

## SSTIの実際の事例

最初の例は、2016年にOrange氏がUberで発見した脆弱性です。ある日、Orange氏はUberから送られてきたメールに `2` が含まれていることに突然気づき、氏名欄に `{{ 1+1 }}` と入力したことを思い出しました。これはSSTIの脆弱性を探す際によく使われるテクニックで、入力可能な場所に大量のペイロードを入力し、結果からSSTIの問題があるかどうかを判断します。

次に、前述のテクニックを使用して、使用可能な変数を見つけ、連結しました。UberもJinja2を使用していたため、最終的なペイロードは先ほど記述したものと似ており、SSTIを使用してRCE（リモートコード実行）を正常に達成しました。

より詳細なプロセスについては、以下を参照してください：[Uber Remote Code Execution via Flask Jinja2 Template Injection](http://blog.orange.tw/2016/04/bug-bounty-uber-ubercom-remote-code_7.html)

2番目の例は、2019年にMahmoud Gamal氏が報告したShopifyのHandlebars SSTIです。

Shopifyのマーチャントバックエンドには、マーチャントがユーザーに送信するメールをカスタマイズできる機能があります（先ほど挙げた例と似ています）。`{{order.number}}` のような構文を使用してコンテンツをカスタマイズできます。バックエンドはNode.jsとHandlebarsをテンプレートエンジンとして使用しています。

Handlebarsにはいくつかの保護機能があり、より複雑であるため、ハッカーは攻撃方法を理解するのに多くの時間を費やしました。結局のところ、SSTIがあることは一つのことですが、すべてのテンプレートエンジンがRCEに悪用できるわけではありません。

最終的に彼らが思いついたペイロードは非常に長いものでした。

```js
{{#with this as |obj|}}
    {{#with (obj.constructor.keys "1") as |arr|}}
        {{#with obj.constructor.name as |str|}}
            {{#blockHelperMissing str.toString}}
              {{#with (arr.constructor (str.toString.bind "return JSON.stringify(process.env);"))}}
                  {{#with (obj.constructor.getOwnPropertyDescriptor this 0)}}
                      {{#with (obj.constructor.defineProperty obj.constructor.prototype "toString" this)}}
                          {{#with (obj.constructor.constructor "test")}}
                            {{this}}
                          {{/with}}
                      {{/with}}
                  {{/with}}
              {{/with}}
            {{/blockHelperMissing}}
        {{/with}}
  {{/with}}
{{/with}}
```

詳細については、著者の元の記事を参照してください：[Handlebars template injection and RCE in a Shopify app](https://mahmoudsec.blogspot.com/2019/04/handlebars-template-injection-and-rce.html)

## クライアントサイドテンプレートインジェクション

SSTIを理解すると、CSTIを理解するのがより簡単になります。原理は似ており、唯一の違いは、このテンプレートがフロントエンドのテンプレートであることです。

待ってください、フロントエンドにもテンプレートがあるのですか？もちろんあります！

例えば、Angularはその一つです。以下はAngularの[公式サイト](https://angular.io/quick-start)からの例です。

```js
// 必要なパッケージをインポートします
import 'zone.js';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

// コンポーネントを記述します
@Component({
  selector: 'add-one-button', // マークアップで使用されるコンポーネント名
  standalone: true, // コンポーネントは自己完結型
  template: // コンポーネントのマークアップ
  `
   <button (click)="count = count + 1">Add one</button> {{ count }}
  `,
})

// コンポーネントをエクスポートします
export class AddOneButtonComponent {
  count = 0;
}

bootstrapApplication(AddOneButtonComponent);
```

`template` というパラメータがあることがはっきりとわかります。`{{ count }}` を `{{ constructor.constructor('alert(1)')() }}` に変更すると、アラートウィンドウがポップアップ表示されます。

`constructor.constructor('alert(1)')()` を使用するのは、テンプレートが `window` に直接アクセスできないため、Functionコンストラクタを介して新しい関数を作成するためです。

Angularのドキュメントでは、[Angularのクロスサイトスクリプティングセキュリティモデル](https://angular.io/guide/security#angulars-cross-site-scripting-security-model)で次のように述べられています。

> レンダリングに使用される値とは異なり、Angularテンプレートはデフォルトで信頼されていると見なされ、実行可能なコードとして扱われるべきです。ユーザー入力とテンプレート構文を連結してテンプレートを作成しないでください。これを行うと、攻撃者がアプリケーションに任意のコードを注入できるようになります。

テンプレートは実行可能なコードとして扱われるべきであり、ユーザーがテンプレートを制御することは決して許可されるべきではありません。

ところで、AngularJSとAngularの違いを知っていますか？

2010年に初めてリリースされたときはAngularJSと呼ばれ、バージョン番号は0.x.xまたは1.x.xでした。しかし、バージョン2以降、Angularに改名され、使用法は似ていますが、設計は完全に書き直されました。ここでは主に古いバージョンのAngularJSについて言及します。古いバージョンであるため問題が多く、攻撃を支援するのに適したライブラリです。

AngularJSが初めてリリースされたとき、`{{ constructor.constructor('alert(1)')() }}` を使用して任意のコードを実行することも可能でした。しかし、バージョン1.2.0以降、あらゆる方法で `window` へのアクセスを防ぐためにサンドボックスメカニズムが追加されました。しかし、攻撃と防御に関しては、セキュリティ研究者は負けません。彼らはサンドボックスをバイパスする方法を見つけました。

バイパスされ、サンドボックスが強化され、再びバイパスされるというこのサイクルは続きました。最終的に、AngularJSはバージョン1.6以降、サンドボックスを完全に削除することを発表しました。その理由は、サンドボックスは実際にはセキュリティ機能ではないからです。テンプレートが制御できる場合、解決すべき問題はサンドボックスではなく、その問題自体であるべきです。詳細については、元の発表記事を参照してください：[AngularJS expression sandbox bypass](https://sites.google.com/site/bughunteruniversity/nonvuln/angularjs-expression-sandbox-bypass)。バイパスの歴史については、[DOM based AngularJS sandbox escapes](https://portswigger.net/research/dom-based-angularjs-sandbox-escapes)を参照してください。

AngularJS 1.xバージョンでは、`ng-app` 要素だけで使用がより便利で簡単でした。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
</head>
<body>
  <div ng-app>
    {{ 'hello world'.toUpperCase() }}
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js"></script>
</body>
</html>
```

理想的には、フロントエンド全体がAngularJSによって制御され、バックエンドとの通信はAPIを介して行われ、バックエンドはビューのレンダリングに関与しないはずですが、当時はSPAの概念もまだ普及しておらず、多くのウェブサイトではバックエンドがビューのレンダリングを担当していました。したがって、次のコードを記述する可能性が非常に高かったのです。

```php
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
</head>
<body>
  <div ng-app>
    Hello, <?php echo htmlspecialchars($_GET['name']) ?>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js"></script>
</body>
</html>
```

バックエンドでレンダリングする際に、データを直接HTMLに挿入します。

上記のコードは入力をエンコードしていますが、`{{ alert(1) }}` には不正な文字が含まれていないため、依然としてXSSが発生する可能性があります。

防御方法はSSTIと同じです。ユーザー入力をテンプレートコンテンツの一部として扱わないことです。そうしないと、簡単に問題が発生する可能性があります。

## CSTIの実際の事例

ホットな事例を挙げましょう。日本のサイバーセキュリティ研究者であるMasato Kinugawa氏は、2022年のPwn2OwnでMicrosoftのコミュニケーションソフトウェアTeamsのRCE脆弱性を実証しました。相手にメッセージを送信するだけで、相手のコンピューターでコードを実行できます！この脆弱性は、Pwn2Ownで15万ドルの賞金を獲得しました。

TeamsのデスクトップソフトウェアはElectronで構築されているため、本質的にはウェブページです。RCEを達成するには、通常、まずXSSを見つける必要があります。これにより、ウェブページでJavaScriptコードを実行できます。

Teamsもユーザー入力を処理します。フロントエンドとバックエンドの両方にサニタイザーがあり、奇妙なものを削除し、最終的にレンダリングされるコンテンツが安全であることを保証します。一部のHTMLは制御できますが、多くの属性とコンテンツはフィルタリングされます。

例えば、クラス名でさえ、特定のクラス名のみが許可されています。Masato氏は、サニタイザーがクラス名の処理にいくつかの操作の余地があることを発見しました。例えば、`swift-*` のようなルールがあり、`swift-abc` と `swift-;[]()'%` はどちらも許可されたクラス名です。

しかし、クラス名を操作するだけでは何の意味があるのでしょうか？

ここが鍵です。TeamsのウェブページはAngularJSで記述されており、AngularJSには多くの魔法のような機能があります。その1つに、初期化に使用される `ng-init` 属性があります。

```html
<!DOCTYPE html>
<html lang="en">
<body>
  <div ng-app>
    <div ng-init="name='test'">
      {{ name }}
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js"></script>
</body>
</html>
```

これにより、ページに `test` が表示され、`ng-init` 内のコードが実行されることがわかります。

したがって、それを `ng-init="constructor.constructor('alert(1)')()"` に変更すると、アラートがポップアップ表示されます。

さて、これは先ほど言及したクラス名と何の関係があるのでしょうか？この `ng-init` はクラス名内でも使用できることがわかりました。

```html
<div class="ng-init:constructor.constructor('alert(1)')()">
</div>
```

したがって、前述のクラス名チェックルールと組み合わせることで、上記のペイロードを含むクラス名を構築し、XSSを正常に実行できます。

元の記事には、AngularJSがクラス名をどのように解析するか、およびこのバージョンのAngularJSサンドボックスをバイパスする方法に関するセクションも含まれています。XSSをRCEに変換するにはある程度の労力が必要ですが、これらはこの記事で説明するCSTIとは関係がないためスキップされています。元のプレゼンテーションを強くお勧めします：[How I Hacked Microsoft Teams and got $150,000 in Pwn2Own](https://speakerdeck.com/masatokinugawa/how-i-hacked-microsoft-teams-and-got-150000-dollars-in-pwn2own)

（ちなみに、Masato氏は本当に素晴らしいです。彼の技術記事の多くは私を感心させました。フロントエンド、JavaScript、AngularJSに関する彼の理解は一流です。幸運にも彼としばらく一緒に仕事をする機会があり、彼のすごさを間近で感じました。）

## AngularJSとCSPバイパス

AngularJSは、実戦で最も一般的にCSPバイパスに使用されます。CSPで許可されているパス内にAngularJSを見つけることができれば、バイパスできる可能性が非常に高いです。例えば：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Security-Policy" content="script-src https://cdnjs.cloudflare.com">
</head>
<body>
  <div ng-app ng-csp>
    <input id=x autofocus ng-focus=$event.composedPath()|orderBy:'(z=alert)(1)'>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js"></script>
</body>
</html>
```

CSPは厳格で、`https://cdnjs.cloudflare.com` のみを許可していますが、これによりAngularJSを導入でき、XSSが発生します。

単純に見えますが、よく見ると簡単ではありません。考えてみてください。CSPには `unsafe-eval` がないため、文字列をコードとして実行することはできません。しかし、`ng-focus` 内のすべての文字列はどのように実行されるのでしょうか？それは文字列をコードとして実行しているのではないでしょうか？

これがAngularJSの素晴らしいところです。デフォルトモードでは、AngularJSは `eval` または同様のメソッドを使用して渡された文字列を解析します。しかし、[ng-csp](https://docs.angularjs.org/api/ng/directive/ngCsp)を追加すると、AngularJSに別のモードに切り替えるように指示します。独自のインタープリターを使用して文字列を解析し、対応するアクションを実行します。

したがって、AngularJSは独自の `eval` を実装して、これらのデフォルト関数を使用せずに文字列をコードとして実行できると考えることができます。

以前CSPバイパスについて話した際、パス構成をより厳密にすることで、「リスクを完全に排除する」のではなく「リスクを軽減する」ことができると述べました。例として、`https://www.google.com` の代わりに `https://www.google.com/recaptcha/` と設定することを挙げました。

実際、GoogleCTF 2023では、`https://www.google.com/recaptcha/` のCSPをバイパスする課題があり、その解決策はAngularJSを使用していました。これが、厳密なパスがリスクを軽減できるが完全に回避できない理由です。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Security-Policy" content="script-src https://www.google.com/recaptcha/">
</head>
<body>
  <div
    ng-controller="CarouselController as c"
    ng-init="c.init()"
  >
  [[c.element.ownerDocument.defaultView.alert(1)]]
  <div carousel><div slides></div></div>

  <script src="https://www.google.com/recaptcha/about/js/main.min.js"></script>
</body>
</html>
```

AngularJS CSPバイパスにさらに興味がある場合は、以前に書いた記事「[AngularJS CSP Bypassにおけるprototype.jsの代替を自動的に見つける](https://blog.huli.tw/2022/09/01/en/angularjs-csp-bypass-cdnjs/)」を参照してください。別のバイパス方法を紹介しています。

## まとめ

今回説明したCSTIも、「JavaScriptを直接実行しない」攻撃手法の一種です。

すべての出力をエンコードして安全だと思っているのに、フロントエンドにAngularJSがあることを忘れていると、攻撃者はCSTIを使用して、一見安全な `{{}}` を介してXSSを達成できます。

現在、AngularJSを使用しているウェブサイトはますます少なくなっており、ユーザー入力をテンプレートの一部として扱う人も少なくなっていますが、世界には脆弱性が不足しているのではなく、発見が不足しています。多くの脆弱性はまだ発見されていないだけです。

サービスでAngularJSを使用している場合は、CSTIの問題がないことを確認してください。
