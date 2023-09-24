---
sidebar_position: 24
---

# Same-site cookie, the savior of CSRF?

When it comes to defending against CSRF, regardless of the method used, both the frontend and backend need to implement a comprehensive mechanism to protect against it. Previously, when discussing XSS, we mentioned CSP, which can block resources that do not comply with the rules. But does the browser provide a similar way to prevent CSRF? Is there something we can add to prevent CSRF?

Yes, there is something called a same-site cookie. In this post, let's explore what it is and whether using it can give us peace of mind.

## Exploring the same-site cookie

As the name suggests, a same-site cookie is a cookie that is only sent under same-site conditions. It is used by setting an attribute called `SameSite`, which can have three values:

1. None
2. Lax
3. Strict

`None` is the most lenient, meaning "I don't want the SameSite attribute."

On the other hand, `Strict` is the strictest. When you add it, it explicitly states that "this cookie can only be sent when the target is same-site."

For example, suppose a cookie is set with `SameSite=Strict` on `https://api.huli.tw`. In that case, requests sent from `https://example.com` to `https://api.huli.tw` will not include this cookie because these two websites are not same-site.

However, if it is `https://test.huli.tw`, the cookie will be included because it is same-site.

How strict is it? It's so strict that even "clicking on a link counts." If I click on a hyperlink `<a href="https://api.huli.tw"></a>` on `https://example.com`, it is equivalent to sending a cross-site request from `https://example.com` to `https://api.huli.tw`.

Therefore, in this case, the cookie will not be included.

But isn't this inconvenient? Let's take Google as an example. Suppose Google uses a same-site cookie to verify user identity, and there is a hyperlink in my article that leads to a Google search page. When a user clicks on the link, the opened Google page will be in a logged-out state because it doesn't have the token. This results in a poor user experience.

There are two solutions to this issue. The first is similar to Amazon's approach, which involves preparing two sets of cookies. The first set maintains the login status, while the second set is used for sensitive operations (such as purchasing items or account settings). The first set does not have the `SameSite` attribute, so it will maintain the login status regardless of where the request comes from. However, even if an attacker has the first set of cookies, they cannot do anything because they cannot perform any operations. The second set, on the other hand, completely avoids CSRF by setting the `SameSite` attribute.

However, this approach can be a bit cumbersome. So you can consider the second solution, which is to adjust to another mode of `SameSite`: `Lax`.

Lax mode relaxes some restrictions. Basically, as long as it is a "top-level navigation," such as `<a href>` or `<form method="GET">`, cookies will still be included. However, if it is a POST method form, the cookie will not be included.

This way, you can maintain flexibility, allowing users to maintain their login status when coming from other websites, while also preventing CSRF attacks.

If cross-site requests do not include cookies, attackers cannot execute CSRF attacks.

## History of Same-site cookie

The [first draft specification](https://datatracker.ietf.org/doc/html/draft-west-first-party-cookies-00) of the Same-site cookie was published in October 2014. At that time, it was called "First-Party Cookie" instead of the current "Same-site cookie." It was not until January 2016 that the name was changed to Same-site cookie.

Google officially introduced this feature with Chrome 51 in May 2016: [SameSite cookie](https://www.chromestatus.com/feature/4672634709082112). Firefox also added support in Firefox 60, released in May 2018. Safari, with the slowest progress, only fully supported this feature with the release of Safari 15 in September 2021.

Due to the increased security and privacy protection provided by the SameSite attribute, in October 2019, Chrome directly released an article titled [Developers: Get Ready for New SameSite=None; Secure Cookie Settings](https://blog.chromium.org/2019/10/developers-get-ready-for-new.html), announcing that starting from February 2020, cookies without the SameSite attribute will default to Lax.

And after the outbreak of the pandemic, although we had tested this feature for a while before going live, Chrome still wanted to ensure that all websites were stable and not broken. Therefore, in April 2020, they decided to temporarily rollback this change: [Temporarily rolling back SameSite Cookie Changes](https://blog.chromium.org/2020/04/temporarily-rolling-back-samesite.html).

However, after the pandemic eased slightly in July, this change was gradually redeployed and was fully deployed by August.

In addition to Chrome, Firefox also announced in August 2020 that they would follow suit. Cookies without the SameSite attribute would default to Lax. The article at that time was: [Changes to SameSite Cookie Behavior – A Call to Action for Web Developers](https://hacks.mozilla.org/2020/08/changes-to-samesite-cookie-behavior/).

As for Safari, they announced in March 2020 that they would [completely block third-party cookies](Full Third-Party Cookie Blocking and More), but the actual behavior seems to be a black box.

## Mid-Break for Reflection

By now, everyone should be somewhat familiar with the principles and defense methods of CSRF. The same-site cookie introduced in this article seems quite reliable, and browsers even automatically make it the default, allowing you to enjoy the benefits without making any adjustments.

With the default `SameSite=Lax`, CSRF seems to have exited the stage, officially declared dead, becoming a tear of the times. It's okay not to add a CSRF token because the same-site cookie will automatically handle everything.

However, is it really like that?

Is the default `SameSite=Lax` really that powerful? Do we still need to add a CSRF token with it? Will there be any issues if we don't add it? What situations can cause problems?

Think about these questions first, and then continue reading.

## CSRF with GET Requests

In the previous examples, when I introduced CSRF, I always used POST requests. The reason is simple: CSRF focuses on executing actions, and generally, GET requests are not used for executing actions because it does not align with the semantics of the GET method (or, in more professional terms, GET is only suitable for idempotent operations).

However, "not suitable" does not mean "cannot be done".

As I mentioned in the first example when talking about CSRF, some people may take shortcuts and use GET to implement deletion or other functions, like this: `/delete?id=3`.

In this case, SameSite lax cannot provide protection because lax allows the following behavior:

``` js
location = 'https://api.example.com/delete?id=3'
```

Redirecting to pages like this is one of the allowed behaviors. Therefore, even with the default same-site cookie, it still cannot provide protection.

In the future, when you see someone writing this kind of "executing actions with GET," besides telling them that it is a bad practice, now you have another reason: "Doing this will have security issues."

However, there should be only a few people who write it this way, right? So, the problem should not be significant?

For this kind of writing, it is indeed rare, but there is another common mechanism we can utilize: method override.

The `method` attribute in HTML forms represents the HTTP method used when the request is sent. It only supports two values: GET and POST.

What if we want to use PUT, PATCH, or DELETE? It cannot be done. Either we have to use `fetch()` to send the request or implement a workaround on the backend, which many frameworks support.

For some web frameworks, if a request has the `X-HTTP-Method-Override` header or the query string has the `_method` parameter, the value inside will be used as the request method instead of the original HTTP method.

This was originally used in the scenario I just mentioned, where you want to update data but can only use POST. You can add a `_method` parameter to let the server know that it is actually a PATCH request:

``` html
<form action="/api/update/1" method="POST">
  <input type=hidden name=_method value=PATCH>
  <input name=title value=new_title>
</form>
```

But it can also be used in our CSRF attack. For example, `GET /api/deleteMyAccount?_method=POST` will be treated as a POST request by the server, not GET.

Through this method, the protection of lax can be bypassed, attacking servers that support this method override. As for which web frameworks have this mechanism enabled by default, you can refer to: [Bypassing Samesite Cookie Restrictions with Method Override](https://hazanasec.github.io/2023-07-30-Samesite-bypass-method-override.md/)

## Hidden Rules of Same-site Cookies

So, if there is no support for method override and no inappropriate operations using GET, does that mean everything is fine? Of course, it's not that simple.

The default same-site cookie actually has a hidden rule, or rather, a lesser-known rule that was mentioned in the previous announcement by Firefox:

> For any flows involving POST requests, you should test with and without a long delay. This is because both Firefox and Chrome implement a two-minute threshold that permits newly created cookies without the SameSite attribute to be sent on top-level, cross-site POST requests (a common login flow).

This means that for a cookie without the SameSite attribute, it can bypass some of the lax restrictions within the first two minutes of being written, allowing "top-level cross-site POST requests," in plain terms, `<form method=POST>`.

Therefore, let's assume a user has just logged into a website, and the cookie used for authentication has just been written. At this time, the user opens a webpage created by an attacker, and the content of the webpage is a CSRF exploit:

``` html
<form id=f action="https://api.huli.tw/transfer" method="POST">
    <input type=hidden name=target value=attacker_account>
    <input type=hidden name=amount value=1000>
</form>
<script>
  f.submit()
</script>
```

Due to the exception mentioned earlier, the CSRF attack will be successful.

This exception was originally added to prevent certain websites from breaking, but at the same time, it also opened a backdoor for attackers. As long as certain conditions are met, the "default lax" restrictions can be ignored.

If a website explicitly specifies `SameSite=Lax`, then this issue would not exist. So, does that mean it is truly secure?

I think you know what I'm about to say.

## Is Same-site Cookie Enough to Prevent CSRF?

Although CSRF stands for cross-site, most of the time it is more like cross-origin. In other words, if an attacker can launch an attack from `assets.huli.tw` to `huli.tw`, we would generally consider it as CSRF, even though these two websites are not cross-site.

Same-site cookies only ensure that cookies are not sent in cross-site scenarios. But if two websites are same-site, it doesn't care.

Continuing from the previous example, let's say the main website of Facebook is `www.facebook.com`, and it has a testing environment called `sandbox.facebook.com`, where an XSS vulnerability was found.

If the website only relies on same-site cookies to prevent CSRF, then it is completely useless in this scenario because `www.facebook.com` and `sandbox.facebook.com` are obviously same-site. Therefore, we can easily launch a CSRF attack on the main website using the XSS vulnerability found on the sandbox.

But this is clearly a vulnerability that should be defended against because we don't want subdomains to be able to attack other domains.

Therefore, relying solely on same-site cookies to defend against CSRF is an insecure choice. The [RFC for Cookies](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-12#name-samesite-cookies) also states:

> Developers are strongly encouraged to deploy the usual server-side defenses (CSRF tokens, ensuring that "safe" HTTP methods are idempotent, etc) to mitigate the risk more fully.

It is strongly recommended that developers implement the usual defense measures, such as CSRF tokens, in addition to same-site cookies.

So, even with same-site cookies, it doesn't mean that the previous defense measures can be removed. We still need CSRF tokens, combined with same-site cookies, to build a more robust defense wall and prevent various attack scenarios.

## Real-life Example

In 2022, jub0bs and abrahack discovered a CSRF vulnerability in the open-source monitoring system Grafana, with the identifier [CVE-2022-21703](https://github.com/grafana/grafana/security/advisories/GHSA-cmf4-h3xc-jw8w).

The root cause is that Grafana only uses `SameSite=Lax` as CSRF protection, so any same-site request can execute a CSRF attack. Interestingly, in 2019, Grafana originally intended to add a CSRF token, but after some changes, they thought "having a same-site cookie seems sufficient" and stopped development. You can find more details in this PR: [WIP: security: csrf protection #20070](https://github.com/grafana/grafana/pull/20070).

However, there is a reason why Grafana thinks this way. The Grafana API only accepts requests with the `application/json` content type, and this content type cannot be sent via a form. You can only use `fetch`, and this content type falls under non-simple requests, so it requires a preflight.

Since there is a preflight, other origin requests should be blocked, so theoretically, there should be no issue.

But by carefully reading the CORS specification and a small bug in the server, this limitation was successfully bypassed.

A MIME type consists of three parts: type, subtype, and parameters. We often see `application/json`, where the type is application, the subtype is json, and there are no parameters.

However, `text/plain; charset=utf-8` has a type of text, a subtype of plain, and the parameter `charset=utf-8`.

The CORS specification only requires the type and subtype to be one of the following:

1. application/x-www-form-urlencoded
2. multipart/form-data
3. text/plain

But it does not restrict the content of the parameters.

Therefore, this content type can be a simple request: `text/plain; application/json`. `application/json` is the parameter, and `text/plain` is the type + subtype, which fully complies with the specification.

The handling logic on the API side is as follows:

``` go
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

Here, `strings.contains` is used directly on the entire content type, so even though the content type we pass in is essentially `text/plain`, it is treated as a valid JSON by the server due to the parameters.

After bypassing this limitation, we can use `fetch` to initiate a CSRF attack from a same-site website.

Assuming Grafana is hosted at `https://grafana.huli.tw`, we would need to find at least one XSS vulnerability or gain control over the entire `*.huli.tw` domain to launch an attack. Although it may be challenging, it is not impossible.

As I mentioned earlier, this is an attack initiated from the same site, so same-site cookies cannot prevent it. Strictly speaking, if we consider the literal meaning, it cannot be called CSRF because it is not cross-site. However, giving it a new name seems odd.

## Conclusion

In this article, we introduced the new measures that major browsers have recently implemented, which is setting cookies to `SameSite=Lax` by default. Although this does increase some security, do not think that using this alone can completely prevent CSRF.

Just like defending against XSS, defending against CSRF also requires multiple layers of protection to ensure that if one line of defense is breached, there are other defenses to hold up. For example, if only same-site cookies are used, it means surrendering when another same-site website is compromised. Instead, it is better to implement additional protection measures such as CSRF tokens, which can at least mitigate the impact when the same-site is compromised.

Speaking of which, is it easy to gain control over other same-site websites? And what can be done once control is obtained? Everyone can think about these questions, and we will discuss them in the next article.

References:

1. [Preventing CSRF with the same-site cookie attribute](https://www.sjoerdlangkemper.nl/2016/04/14/preventing-csrf-with-samesite-cookie-attribute/)
2. [再见，CSRF：讲解set-cookie中的SameSite属性](http://bobao.360.cn/learning/detail/2844.html)
3. [SameSite Cookie，防止 CSRF 攻击](http://www.cnblogs.com/ziyunfei/p/5637945.html)
4. [SameSite——防御 CSRF & XSSI 新机制](https://rlilyyy.github.io/2016/07/10/SameSite-Cookie%E2%80%94%E2%80%94%E9%98%B2%E5%BE%A1-CSRF-XSSI/)
5. [Cross-Site Request Forgery is dead!](https://scotthelme.co.uk/csrf-is-dead/)

I'm sorry, but you haven't provided the Markdown content that needs to be translated. Please paste the Markdown content here so that I can assist you with the translation.
