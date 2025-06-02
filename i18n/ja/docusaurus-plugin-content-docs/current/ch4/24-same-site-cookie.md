---
sidebar_position: 24
---

# Same-site Cookie、CSRFの救世主？

CSRFの防御方法について言及する際、どの方法を使用するにしても、フロントエンドとバックエンドの両方で、それを保護するための包括的なメカニズムを実装する必要があります。以前、XSSについて議論した際、ルールに準拠しないリソースをブロックできるCSPについて言及しました。しかし、ブラウザはCSRFを防ぐための同様の方法を提供しているのでしょうか？CSRFを防ぐために追加できるものはありますか？

はい、Same-site Cookieと呼ばれるものがあります。この記事では、それが何であるか、そしてそれを使用することで安心できるかどうかを探ってみましょう。

## Same-site Cookieの探求

名前が示すように、Same-site Cookieは、Same-siteの条件下でのみ送信されるCookieです。これは、`SameSite`という属性を設定することで使用され、3つの値を持つことができます。

1. None
2. Lax
3. Strict

`None`は最も制限が緩く、「SameSite属性を適用しない」という意味です。

一方、`Strict`は最も厳格です。追加すると、「このCookieはターゲットがSame-siteの場合にのみ送信できる」と明示的に示します。

例えば、`https://api.huli.tw`で`SameSite=Strict`が設定されたCookieがあるとします。その場合、`https://example.com`から`https://api.huli.tw`に送信されるリクエストには、これらの2つのウェブサイトがSame-siteではないため、このCookieは含まれません。

ただし、`https://test.huli.tw`の場合は、Same-siteであるためCookieが含まれます。

どれほど厳格なのでしょうか？「リンクのクリックもカウントされる」ほど厳格です。`https://example.com`でハイパーリンク`<a href="https://api.huli.tw"></a>`をクリックすると、`https://example.com`から`https://api.huli.tw`へのクロスサイトリクエストの送信と同じになります。

したがって、この場合、Cookieは含まれません。

しかし、これは不便ではないでしょうか？Googleを例にとってみましょう。GoogleがユーザーIDの検証にSame-site Cookieを使用し、私の記事にGoogle検索ページへのハイパーリンクがあるとします。ユーザーがリンクをクリックすると、開かれたGoogleページはトークンがないためログアウト状態になります。これはユーザーエクスペリエンスが悪いです。

この問題には2つの解決策があります。1つ目はAmazonのアプローチに似ており、2セットのCookieを準備します。最初のセットはログイン状態を維持し、2番目のセットは機密性の高い操作（商品の購入やアカウント設定など）に使用されます。最初のセットには`SameSite`属性がないため、リクエストの送信元に関係なくログイン状態が維持されます。ただし、攻撃者が最初のセットのCookieを持っていても、何も操作できないため何もできません。2番目のセットは、`SameSite`属性を設定することでCSRFを完全に回避します。

しかし、このアプローチは少し面倒かもしれません。そこで、2番目の解決策を検討できます。それは、`SameSite`の別のモードである`Lax`に調整することです。

Laxモードはいくつかの制限を緩和します。基本的に、`<a href>`や`<form method="GET">`のような「トップレベルナビゲーション」である限り、Cookieは引き続き含まれます。ただし、POSTメソッドのフォームの場合は、Cookieは含まれません。

これにより、他のウェブサイトから来たユーザーがログイン状態を維持できるように柔軟性を維持しながら、CSRF攻撃を防ぐことができます。

クロスサイトリクエストにCookieが含まれていない場合、攻撃者はCSRF攻撃を実行できません。

## Same-site Cookieの歴史

Same-site Cookieの[最初の仕様草案](https://datatracker.ietf.org/doc/html/draft-west-first-party-cookies-00)は2014年10月に公開されました。当時は現在の「Same-site Cookie」ではなく「First-Party Cookie」と呼ばれていました。名前がSame-site Cookieに変更されたのは2016年1月になってからです。

Googleは2016年5月にChrome 51でこの機能を正式に導入しました：[SameSite cookie](https://www.chromestatus.com/feature/4672634709082112)。Firefoxも2018年5月にリリースされたFirefox 60でサポートを追加しました。進捗が最も遅かったSafariは、2021年9月にリリースされたSafari 15でようやくこの機能を完全にサポートしました。

SameSite属性によって提供されるセキュリティとプライバシー保護の強化により、2019年10月、Chromeは「[Developers: Get Ready for New SameSite=None; Secure Cookie Settings](https://blog.chromium.org/2019/10/developers-get-ready-for-new.html)」という記事を直接公開し、2020年2月からSameSite属性のないCookieはデフォルトでLaxになると発表しました。

そしてパンデミックが発生した後、ライブ配信前にしばらくこの機能をテストしていましたが、Chromeはすべてのウェブサイトが安定していて壊れていないことを確認したかったのです。そのため、2020年4月に、この変更を一時的にロールバックすることを決定しました：[Temporarily rolling back SameSite Cookie Changes](https://blog.chromium.org/2020/04/temporarily-rolling-back-samesite.html)。

しかし、7月にパンデミックがやや緩和された後、この変更は徐々に再展開され、8月までに完全に展開されました。

Chromeに加えて、Firefoxも2020年8月に追随すると発表しました。SameSite属性のないCookieはデフォルトでLaxになります。当時の記事は次のとおりです：[Changes to SameSite Cookie Behavior – A Call to Action for Web Developers](https://hacks.mozilla.org/2020/08/changes-to-samesite-cookie-behavior/)。

Safariについては、2020年3月に[サードパーティCookieを完全にブロックする](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)と発表しましたが、実際の動作はブラックボックスのようです。

## 考察のための中間休憩

ここまでで、皆さんはCSRFの原理と防御方法についてある程度理解できたはずです。この記事で紹介したSame-site Cookieは非常に信頼性が高いように思われ、ブラウザも自動的にデフォルトにしているため、何も調整しなくてもその恩恵を受けることができます。

デフォルトの`SameSite=Lax`により、CSRFは舞台から姿を消し、正式に死んだと宣言され、時代の涙となったようです。CSRFトークンを追加しなくても問題ありません。なぜなら、Same-site Cookieがすべてを自動的に処理してくれるからです。

しかし、本当にそうなのでしょうか？

デフォルトの`SameSite=Lax`は本当にそんなに強力なのでしょうか？それがあってもCSRFトークンを追加する必要があるのでしょうか？追加しないと問題が発生するのでしょうか？どのような状況で問題が発生するのでしょうか？

まずこれらの質問について考えてから、読み進めてください。

## GETリクエストによるCSRF

以前の例では、CSRFを紹介する際に常にPOSTリクエストを使用していました。理由は簡単です。CSRFはアクションの実行に焦点を当てており、一般的にGETリクエストはアクションの実行には使用されません。なぜなら、GETメソッドのセマンティクスに合致しないからです（より専門的な用語では、GETはべき等な操作にのみ適しています）。

しかし、「適していない」は「できない」という意味ではありません。

CSRFについて話す際の最初の例で述べたように、一部の人々は近道をして、このように削除やその他の機能を実装するためにGETを使用するかもしれません：`/delete?id=3`。

この場合、SameSite laxは保護を提供できません。なぜなら、laxは次の動作を許可するからです。

```js
location = 'https://api.example.com/delete?id=3'
```

このようなページへのリダイレクトは許可される動作の1つです。したがって、デフォルトのSame-site Cookieがあっても、保護を提供することはできません。

将来、このような「GETでアクションを実行する」という記述を見かけたら、それが悪い習慣であることを伝えるだけでなく、もう1つの理由があります。「これを行うとセキュリティ上の問題が発生します」。

しかし、このように書く人は少数のはずですよね？だから、問題はそれほど大きくないはずですよね？

このような書き方については、確かにまれですが、私たちが利用できる別の一般的なメカニズムがあります。それはメソッドオーバーライドです。

HTMLフォームの`method`属性は、リクエスト送信時に使用されるHTTPメソッドを表します。GETとPOSTの2つの値のみをサポートしています。

PUT、PATCH、またはDELETEを使用したい場合はどうすればよいでしょうか？それはできません。`fetch()`を使用してリクエストを送信するか、バックエンドで回避策を実装するしかありませんが、多くのフレームワークが後者をサポートしています。

一部のWebフレームワークでは、リクエストに`X-HTTP-Method-Override`ヘッダーがあるか、クエリ文字列に`_method`パラメータがある場合、元のHTTPメソッドの代わりに内部の値がリクエストメソッドとして使用されます。

これは元々、先ほど述べたような、データを更新したいがPOSTしか使用できないフォームのような場合に使用されていました。`_method`パラメータを追加して、実際にはPATCHリクエストであることをサーバーに知らせることができます。

```html
<form action="/api/update/1" method="POST">
  <input type=hidden name=_method value=PATCH>
  <input name=title value=new_title>
</form>
```

しかし、これはCSRF攻撃にも使用できます。例えば、`GET /api/deleteMyAccount?_method=POST`は、GETではなくPOSTリクエストとしてサーバーによって扱われます。

この方法により、laxの保護をバイパスし、このメソッドオーバーライドをサポートするサーバーを攻撃できます。どのWebフレームワークがデフォルトでこのメカニズムを有効にしているかについては、以下を参照してください：[Bypassing Samesite Cookie Restrictions with Method Override](https://hazanasec.github.io/2023-07-30-Samesite-bypass-method-override.md/)

## Same-site Cookieの隠されたルール

では、メソッドオーバーライドのサポートがなく、GETを使用した不適切な操作もない場合、すべて問題ないということでしょうか？もちろん、そんなに単純ではありません。

デフォルトのSame-site Cookieには実際には隠されたルールがあります。というか、あまり知られていないルールで、Firefoxの以前の発表で言及されていました。

> POSTリクエストを含むフローについては、遅延の有無にかかわらずテストする必要があります。これは、FirefoxとChromeの両方が、SameSite属性のない新しく作成されたCookieをトップレベルのクロスサイトPOSTリクエスト（一般的なログインフロー）で送信できるようにする2分間のしきい値を実装しているためです。

これは、SameSite属性のないCookieの場合、書き込まれてから最初の2分間はlaxの制限の一部をバイパスでき、「トップレベルのクロスサイトPOSTリクエスト」、平たく言えば`<form method=POST>`を許可することを意味します。

したがって、ユーザーがウェブサイトにログインしたばかりで、認証に使用されるCookieが書き込まれたばかりだとします。このとき、ユーザーは攻撃者によって作成されたウェブページを開き、ウェブページの内容はCSRFエクスプロイトです。

```html
<form id=f action="https://api.huli.tw/transfer" method="POST">
    <input type=hidden name=target value=attacker_account>
    <input type=hidden name=amount value=1000>
</form>
<script>
  f.submit()
</script>
```

前述の例外により、CSRF攻撃は成功します。

この例外は元々、特定のウェブサイトが壊れるのを防ぐために追加されましたが、同時に攻撃者にとってもバックドアを開きました。特定の条件が満たされれば、「デフォルトのlax」制限を無視できます。

ウェブサイトが明示的に`SameSite=Lax`を指定していれば、この問題は発生しません。では、それで本当に安全なのでしょうか？

私が何を言おうとしているか、お分かりだと思います。

## CSRFを防ぐにはSame-site Cookieだけで十分か？

CSRFはクロスサイトの略ですが、ほとんどの場合、クロスオリジンに近いです。言い換えれば、攻撃者が`assets.huli.tw`から`huli.tw`に攻撃を開始できる場合、これらの2つのウェブサイトがクロスサイトでなくても、一般的にCSRFと見なされます。

Same-site Cookieは、クロスサイトのシナリオでCookieが送信されないようにするだけです。しかし、2つのウェブサイトがSame-siteの場合、それは気にしません。

前の例を続けると、Facebookのメインウェブサイトが`www.facebook.com`であり、`sandbox.facebook.com`というテスト環境があり、そこでXSS脆弱性が発見されたとします。

ウェブサイトがCSRFを防ぐためにSame-site Cookieのみに依存している場合、`www.facebook.com`と`sandbox.facebook.com`は明らかにSame-siteであるため、このシナリオではまったく役に立ちません。したがって、サンドボックスで見つかったXSS脆弱性を使用して、メインウェブサイトに対して簡単にCSRF攻撃を開始できます。

しかし、これは明らかに防御すべき脆弱性です。なぜなら、サブドメインが他のドメインを攻撃できることを望まないからです。

したがって、CSRF対策としてSame-site Cookieのみに依存するのは安全でない選択です。[CookieのRFC](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-12#name-samesite-cookies)にも次のように記載されています。

> 開発者は、リスクをより完全に軽減するために、通常のサーバー側の防御（CSRFトークン、「安全な」HTTPメソッドがべき等であることを保証するなど）を展開することを強く推奨します。

開発者は、Same-site Cookieに加えて、CSRFトークンなどの通常の防御策を実装することを強く推奨します。

したがって、Same-site Cookieがあっても、以前の防御策を削除できるわけではありません。より堅牢な防御壁を構築し、さまざまな攻撃シナリオを防ぐために、依然としてCSRFトークンとSame-site Cookieを組み合わせる必要があります。

## 実際の事例

2022年、jub0bs氏とabrahack氏は、オープンソースの監視システムであるGrafanaにCSRF脆弱性を発見しました。識別子は[CVE-2022-21703](https://github.com/grafana/grafana/security/advisories/GHSA-cmf4-h3xc-jw8w)です。

根本的な原因は、GrafanaがCSRF保護として`SameSite=Lax`のみを使用しているため、Same-siteリクエストであればCSRF攻撃を実行できることです。興味深いことに、2019年にGrafanaは元々CSRFトークンを追加する予定でしたが、いくつかの変更の後、「Same-site Cookieがあれば十分そうだ」と考え、開発を中止しました。詳細については、このPRを参照してください：[WIP: security: csrf protection #20070](https://github.com/grafana/grafana/pull/20070)。

しかし、Grafanaがこのように考えるのには理由があります。Grafana APIは`application/json`コンテンツタイプのリクエストのみを受け付け、このコンテンツタイプはフォーム経由では送信できません。`fetch`を使用するしかなく、このコンテンツタイプは非シンプルリクエストに該当するため、プリフライトが必要です。

プリフライトがあるので、他のオリジンリクエストはブロックされるはずなので、理論的には問題ないはずです。

しかし、CORSの仕様を注意深く読み、サーバーの小さなバグを突くことで、この制限は正常に回避されました。

MIMEタイプは、タイプ、サブタイプ、パラメータの3つの部分で構成されます。よく目にする`application/json`では、タイプはapplication、サブタイプはjsonで、パラメータはありません。

ただし、`text/plain; charset=utf-8`のタイプはtext、サブタイプはplain、パラメータは`charset=utf-8`です。

CORS仕様では、タイプとサブタイプが次のいずれかであることのみが要求されます。

1. application/x-www-form-urlencoded
2. multipart/form-data
3. text/plain

しかし、パラメータの内容は制限していません。

したがって、このコンテンツタイプは単純なリクエストになります：`text/plain; application/json`。`application/json`はパラメータであり、`text/plain`はタイプ+サブタイプであり、これは仕様に完全に準拠しています。

API側の処理ロジックは次のとおりです。

```go
func bind(ctx *macaron.Context, obj interface{}, ifacePtr ...interface{}) {
  contentType := ctx.Req.Header.Get("Content-Type")
  if ctx.Req.Method == "POST" || ctx.Req.Method == "PUT" || len(contentType) > 0 {
    switch {
    case strings.Contains(contentType, "form-urlencoded"):
      ctx.Invoke(Form(obj, ifacePtr...))
    case strings.Contains(contentType, "multipart/form-data"):
      ctx.Invoke(MultipartForm(obj, ifacePtr...))
    case strings.Contains(contentType, "json"):
      ctx.Invoke(Json(obj, ifacePtr...))
    // ...
  } else {
    ctx.Invoke(Form(obj, ifacePtr...))
  }
}
```

ここでは、`strings.contains`がコンテンツタイプ全体に直接使用されているため、渡すコンテンツタイプは本質的に`text/plain`ですが、パラメータのためにサーバーによって有効なJSONとして扱われます。

この制限を回避した後、`fetch`を使用してSame-siteのウェブサイトからCSRF攻撃を開始できます。

Grafanaが`https://grafana.huli.tw`でホストされていると仮定すると、攻撃を開始するには、少なくとも1つのXSS脆弱性を見つけるか、`*.huli.tw`ドメイン全体を制御する必要があります。困難かもしれませんが、不可能ではありません。

前述の通り、これはSame-siteから開始された攻撃なので、Same-site Cookieでは防げません。厳密に言えば、文字通りの意味を考えると、クロスサイトではないためCSRFとは呼べません。しかし、新しい名前を付けるのも奇妙に思えます。

元のwriteupはこちらで確認できます：[CVE-2022-21703: cross-origin request forgery against Grafana](https://jub0bs.com/posts/2022-02-08-cve-2022-21703-writeup/)

## まとめ

この記事では、主要なブラウザが最近実装した新しい対策、つまりCookieをデフォルトで`SameSite=Lax`に設定することを紹介しました。これによりセキュリティは向上しますが、これだけでCSRFを完全に防げるとは考えないでください。

XSS対策と同様に、CSRF対策にも複数の防御層が必要です。1つの防御線が破られても、他の防御線が持ちこたえられるようにするためです。例えば、Same-site Cookieのみを使用する場合、別のSame-siteウェブサイトが侵害されると降伏することを意味します。代わりに、CSRFトークンなどの追加の保護策を実装する方がよく、少なくともSame-siteが侵害された場合の影響を軽減できます。

そういえば、他のSame-siteウェブサイトの制御権を取得するのは簡単なのでしょうか？そして、制御権を取得したら何ができるのでしょうか？皆さんもこれらの問題について考えてみてください。次の記事でそれらについて議論します。

参考文献：

1. [Preventing CSRF with the same-site cookie attribute](https://www.sjoerdlangkemper.nl/2016/04/14/preventing-csrf-with-samesite-cookie-attribute/)
2. [再见，CSRF：讲解set-cookie中的SameSite属性](http://bobao.360.cn/learning/detail/2844.html)
3. [SameSite Cookie，防止 CSRF 攻击](http://www.cnblogs.com/ziyunfei/p/5637945.html)
4. [SameSite——防御 CSRF & XSSI 新机制](https://rlilyyy.github.io/2016/07/10/SameSite-Cookie%E2%80%94%E2%80%94%E9%98%B2%E5%BE%A1-CSRF-XSSI/)
5. [Cross-Site Request Forgery is dead!](https://scotthelme.co.uk/csrf-is-dead/)
