---
sidebar_position: 13
---

# Who says you have to execute JavaScript directly to attack?

Up to this point, Chapter 2, "Defense and Bypass for XSS," comes to a close.

We have spent a lot of time discussing XSS, including various ways to execute XSS, defense techniques, and bypass methods. In terms of web front-end, the most serious thing that can be done to a web page is essentially executing code.

In the examples of attacks, we basically assume "being able to inject HTML" as a premise and then find ways to transform it into XSS. Although we have only used this simple payload in the previous examples: `<img src=x onload=alert(1)>`, it may not be so easy in real-world scenarios.

For example, we briefly mentioned earlier that there is another defense line called WAF, Web Application Firewall, which is a firewall specifically designed for applications. It uses pre-written rules to block "seemingly malicious" payloads.

For instance, Dcard(a social media platform in Taiwan) uses Cloudflare's WAF. You can try clicking on this link: [https://www.dcard.tw/?a=%3Cscript%3E](https://www.dcard.tw/?a=%3Cscript%3E)

You will see a blocked message:

![](pics/13-01.png)

The most well-known open-source WAF is [ModSecurity](https://github.com/SpiderLabs/ModSecurity), which provides an infrastructure for engineers to add their own blocking rules or use ones written by others.

For example, the [OWASP ModSecurity Core Rule Set (CRS)](https://github.com/coreruleset/coreruleset/tree/v4.0/dev) is an open-source collection of rules. Let's take a look at a small section:

Source: [coreruleset/rules/REQUEST-941-APPLICATION-ATTACK-XSS.conf](https://github.com/coreruleset/coreruleset/blob/v4.0/dev/rules/REQUEST-941-APPLICATION-ATTACK-XSS.conf#L105)

``` conf
#
# -=[ XSS Filters - Category 1 ]=-
# http://xssplayground.net23.net/xssfilter.html
# script tag based XSS vectors, e.g., <script> alert(1)</script>
#
SecRule REQUEST_COOKIES|!REQUEST_COOKIES:/__utm/|REQUEST_COOKIES_NAMES|REQUEST_FILENAME|REQUEST_HEADERS:User-Agent|REQUEST_HEADERS:Referer|ARGS_NAMES|ARGS|XML:/* "@rx (?i)<script[^>]*>[\s\S]*?" \
    "id:941110,\
    phase:2,\
    block,\
    capture,\
    t:none,t:utf8toUnicode,t:urlDecodeUni,t:htmlEntityDecode,t:jsDecode,t:cssDecode,t:removeNulls,\
    msg:'XSS Filter - Category 1: Script Tag Vector',\
    logdata:'Matched Data: %{TX.0} found within %{MATCHED_VAR_NAME}: %{MATCHED_VAR}',\
    tag:'application-multi',\
    tag:'language-multi',\
    tag:'platform-multi',\
    tag:'attack-xss',\
    tag:'paranoia-level/1',\
    tag:'OWASP_CRS',\
    tag:'capec/1000/152/242',\
    ver:'OWASP_CRS/4.0.0-rc1',\
    severity:'CRITICAL',\
    setvar:'tx.xss_score=+%{tx.critical_anomaly_score}',\
    setvar:'tx.inbound_anomaly_score_pl1=+%{tx.critical_anomaly_score}'"
```

This rule uses the regular expression `<script[^>]*>[\s\S]*?` to find code containing `<script` and blocks it. Therefore, `<script>alert(1)</script>` will be detected and blocked.

There are also other rules corresponding to our favorite `<img src=x onerror=alert()>`, so in practice, we often encounter situations where we think a website is easy to attack, but it turns out to be blocked by WAF. We keep seeing error windows even though the vulnerability exists, but we can't exploit it because of the WAF.

This cat-and-mouse game between hackers and websites is one of the interesting aspects of cybersecurity, and it emphasizes the importance of experience and knowledge. Regarding WAF, many WAF bypass payloads often appear on Twitter. To bypass WAF, the content is usually intentionally "disgusting," like this (credit to [@bxmbn](https://twitter.com/bxmbn/status/1686415626649145344)):

``` html
<details/open=/Open/href=/data=; ontoggle="(alert)(document.domain)
```

Actually, the content this payload intends to execute is `<details open ontoggle=alert(document.domain)>`, but it uses a bunch of other keywords to obfuscate it. Since many WAFs rely on regular expressions for detection, as long as the payload is not easily recognizable by the WAF, it can be bypassed using this method.

But what if it can't be bypassed?

Even if a website can inject HTML, so what? If the payload that can execute XSS cannot be written, does that mean there is no solution? Not necessarily.

This kind of thinking usually stems from a limited understanding of front-end security, where XSS is the only known attack. It is often believed that executing code directly is necessary to achieve an attack. In fact, there are many other "indirect attack" methods, and some attack techniques don't even require executing JavaScript.

As I mentioned at the beginning of this series, front-end security is a vast universe. We have already spent a lot of time exploring XSS, so it's time to enter a new galaxy! Let's take a short break, and in the next post, we will officially enter Chapter 3: "Attacks without JavaScript"

In the upcoming content, I will introduce more attack techniques beyond XSS.

Chapter 3 will progress step by step, from "indirectly influencing the execution of JavaScript" to "not needing JavaScript at all," and even "not just JavaScript, but also without CSS." We will continuously explore the limits of front-end attacks.

Before entering Chapter 3, you can also think about any "attack techniques that don't execute JavaScript directly" that you have heard of. It's very likely that they will be covered in the upcoming content.

Finally, let's have a little quiz. Bob is implementing a multiplayer drawing game using a two-dimensional array to represent the canvas. Players can draw any color on any grid, and the array is updated using `onmessage`. The implementation is as follows:

``` js
onmessage = function(event){
  const { x, y, color } = event.data
  // for example, screen[10][5] = 'red'
  screen[y][x] = color
}
```

What is the problem with this code? We will reveal it in our next post.
