---
sidebar_position: 25
---

# From same-site websites to your home

In the previous post about Grafana attack scenarios, it was mentioned that attackers must first gain control of a same-site website in order to execute subsequent attacks. In this post, let's consider a different perspective: "If you have control over a same-site website, what kind of attacks can you perform?" For example, CSRF is a possible attack method.

This often happens in the world of bug bounty, where websites offer rewards to bounty hunters for actively discovering and reporting vulnerabilities. This allows the website to patch the vulnerabilities before they can be maliciously exploited, benefiting both parties. These bug bounty programs usually have an explanation page that specifies the monetary value for different severity levels of vulnerabilities.

In addition, there are also core and non-core websites. For example, vulnerabilities found on the `api.huli.tw` API server are worth more than vulnerabilities found on the `2023.campaign.huli.tw` one-time event page because the former can cause greater impact.

Therefore, when a bounty hunter discovers a vulnerability on `2023.campaign.huli.tw`, they may try to further investigate if there is a way to expand the scope of this vulnerability, such as affecting `api.huli.tw`, in order to earn more rewards.

Apart from finding XSS on same-site websites, there is another way to control subdomains.

## Subdomain takeover

As the name suggests, this vulnerability allows attackers to take over an entire subdomain and gain control over it.

Sounds difficult, right? Do you need to gain control of their DNS or infiltrate the company's internal systems to take over a subdomain? Actually, it's not always necessary. In the era of various cloud services, there is a simpler method to try.

Amazon S3 is a cloud storage service where you can upload files and set permissions to share them with others. Many people use Amazon S3 to store images or even host entire websites because it provides website hosting functionality. Each storage space in S3 is called a bucket and has a name, which also corresponds to a subdomain provided by S3.

For example, if my bucket is named `hulitest`, the subdomain would be: `https://hulitest.s3.us-east-1.amazonaws.com`. Since S3 is convenient and easy to use, it is a good choice for hosting static websites. For example, if a company's architecture separates the frontend and backend completely and does not require server-side rendering, a purely static website can be hosted on S3, eliminating the need to manage the frontend infrastructure.

The only problem is that the domain `https://hulitest.s3.us-east-1.amazonaws.com` doesn't look good. Companies usually have their own domain names, and S3 provides the functionality to customize the domain, which is also quite simple.

First, change the bucket name to the desired domain, for example, `campaign.huli.tw`.

Second, add a CNAME record in DNS, pointing `campaign.huli.tw` to `hulitest.s3.us-east-1.amazonaws.com`. This way, you can use `https://campaign.huli.tw` as your own domain.

The entire process seems fine and convenient, but what about when you no longer need this webpage? For example, there may be a Christmas event page hosted on S3 using a custom domain `xmas.huli.tw`. After Christmas and the event are over, the S3 bucket is deleted since storage space and traffic still incur costs.

However, the DNS part may be handled by another department, and if they are not specifically informed to delete it, it may remain there.

As a result, a situation arises where the DNS record still exists, but the destination it points to has been deleted.

In the case of S3, as long as the bucket name is not taken by someone else, you can claim that name. Now that the `xmas.huli.tw` bucket has been deleted, I can create a new one with the same name, `xmas.huli.tw`. This way, the domain `xmas.huli.tw` will point to the S3 bucket, and since the S3 bucket contains my content, I effectively control the content of `xmas.huli.tw`, achieving subdomain takeover.

Apart from S3, there are many other services that provide similar functionality and have this issue. You can refer to the detailed list here: [Can I take over XYZ](https://github.com/EdOverflow/can-i-take-over-xyz). Azure has also created a page specifically explaining how to defend against this: [Prevent dangling DNS entries and subdomain takeover](https://learn.microsoft.com/zh-tw/azure/security/fundamentals/subdomain-takeover). In simple terms, just delete the DNS record, and there will be no problem.

## Things You Can Do After Gaining Subdomain Control

Let's take a look at a few examples!

The first example is an article published by Hacktus in 2023: [Subdomain Takeover leading to Full Account Takeover](https://hacktus.tech/subdomain-takeover-leading-to-full-account-takeover). It mentions that the website `example.com` has its cookies directly written on the root domain `example.com`, making them shareable with other subdomains.

Hacktus discovered that one of the subdomains, `test.example.com`, was pointing to `azurewebsites.net` and was not registered by anyone. So, Hacktus registered the service and successfully took over the domain. After taking over, whenever a user visits `test.example.com`, the browser sends the cookies stored in `example.com` to the server, allowing Hacktus to obtain the user's cookies.

The second case is an article published by a cybersecurity company called Shockwave: [Subdomain Takeover: How a Misconfigured DNS Record Could Lead to a Huge Supply Chain Attack](https://www.shockwave.cloud/blog/subdomain-takeover-how-a-misconfigured-dns-record-could-lead-to-a-huge-supply-chain-attack). The case mentioned in the article is similar to the S3 bucket issue we discussed earlier, but this time the domain taken over is `assets.npmjs.com`.

NPM stands for Node Package Manager, a website used to manage JavaScript packages. If an attacker gains control of `assets.npmjs.com`, they can upload malicious packages and deceive developers into thinking they are safe. Since developers are familiar with this domain and it appears highly credible, the probability of successful phishing is also high.

The third case involves a vulnerability discovered by Smaran Chand towards the end of 2022: [Taking over the Medium subdomain using Medium](https://smaranchand.com.np/2022/10/taking-over-the-medium-subdomain-using-medium/). One of the subdomains of the blogging platform Medium, `platform.medium.engineering`, points to Medium but does not exist as a blog.

An attacker can create their own Medium blog and request a link to `platform.medium.engineering`. Although they cannot fully control the content of the webpage in this case, they can still engage in social engineering attacks, such as posting fake job advertisements, which appear highly credible.

Apart from the application methods mentioned in these practical examples, there are actually more possibilities.

## Exploiting Incorrect Security Assumptions

Many backend programs make incorrect security assumptions and grant excessive permissions to entities that should not have them.

For example, let's consider the case of dynamic origin in CORS. Some servers implement the following check:

``` js
const domain = 'huli.tw'
if (origin === domain || origin.endsWith('.' + domain)) {
  res.setHeader('Access-Control-Allow-Origin', origin)
}
```

If the origin is `huli.tw` or ends with `.huli.tw`, it passes. Although it may not seem like a big issue, the security of this check is based on the assumption that "attackers cannot control subdomains of `huli.tw`".

However, by now, I believe everyone knows that gaining control of a subdomain may not be as difficult as imagined, and the risk still exists. If an attacker can control a subdomain, they can exploit this incorrect assumption to launch attacks from the subdomain.

Therefore, this seemingly secure check is actually not secure enough. The most secure check should be:

``` js
const allowOrigins = [
  'huli.tw',
  'blog.huli.tw'
]
if (allowOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin)
}
```

Prepare a whitelist, and only origins in the whitelist can pass the check. Although this may be more cumbersome because every new domain needs to be manually added, it also increases security by not blindly trusting any subdomain.

## Cookie Tossing

Another thing you can do after gaining control of a subdomain is called cookie tossing.

Let's assume there is a website with an API server at `api.huli.tw`, and the authentication cookie is stored under this domain. Additionally, the backend has implemented CSRF protection, adding `SameSite=Lax` and checking the CSRF token to ensure that the `csrf_token` in the request body matches the one in the cookie.

Now, suppose we have control over a subdomain called `s3.huli.tw` and can execute XSS attacks on it. What should we do next?

When writing cookies, we can write them to higher-level domains. For example, `a.b.huli.tw` can write cookies to:

1. a.b.huli.tw
2. b.huli.tw
3. huli.tw

Therefore, when we are on `s3.huli.tw`, we can write a cookie to `huli.tw`, allowing us to write a cookie called `csrf_token`.

In a scenario where both `api.huli.tw` and `huli.tw` have cookies with the same name, what will the browser do? It will send both cookies together, and based on the `path` attribute of the cookie, the more specific one will be sent first.

For example, if the cookie on `api.huli.tw` does not have a `path` set, and the cookie on `huli.tw` has a `path=/users` set, when the browser sends a request to `https://api.huli.tw/users`, the sent cookies will be: `csrf_token={value_of_huli_tw}&csrf_token={value_of_api_huli_tw}`.

Usually, when retrieving cookie values on the backend, only the first one is taken by default. Therefore, we will retrieve the cookie we wrote on `s3.huli.tw`.

Through this behavior, an attacker can overwrite cookies from other same-site domains, as if they are "throwing" cookies from a subdomain to another domain. This is known as cookie tossing.

By overwriting the `csrf_token` cookie, we essentially know its value and can execute a CSRF attack. Therefore, in this situation, even with same-site cookie settings and CSRF token checks, we cannot escape the fate of being attacked.

The solution is to change the cookie name of the CSRF token from `csrf_token` to `__Host-csrf_token`. With this prefix, the cookie cannot have the `path` and `domain` attributes when setting it. Therefore, other subdomains cannot write and overwrite it. For more examples, you can refer to the [MDN page](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#cookie_prefixes).

For specific examples and other applications, you can refer to @filedescriptor's talk at HITCON CMT in 2019: [The cookie monster in your browsers](https://www.youtube.com/watch?v=njQcVWPB1is&ab_channel=HITCON), or check out the [slides](https://speakerdeck.com/filedescriptor/the-cookie-monster-in-your-browsers).

## Conclusion

This article continues the same-site issue mentioned in the previous one. When designing systems, we should adhere to the principle of least privilege and avoid unnecessary security assumptions. Instead of trusting all same-site domains, a more secure approach would be to trust a fixed list of domains and ensure that every trusted domain is listed.

Furthermore, from this article, we can see that a same-site website inherently has more privileges (e.g., ignoring same-site cookies). Therefore, many companies actually place less trusted files (e.g., user-uploaded files) or less important websites on a completely new domain.

For example, the main site may be at `www.huli.tw`, while the campaign webpage is called `campaign.huli.app`. This way, even if the campaign webpage is compromised, the damage can be minimized and it won't affect the main site.
