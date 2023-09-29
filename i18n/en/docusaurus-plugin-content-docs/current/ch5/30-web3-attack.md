---
sidebar_position: 30
---

# Web Frontend Attacks in Web3

When it comes to Web3, most people think of things like cryptocurrencies, metaverses, or NFTs. These are all built on the underlying technologies of blockchain and smart contracts, which form a completely different system.

However, let's not forget that the Web3 world still needs an entry point, and that entry point is Web2 — the familiar web we know.

In this article, we will explore several real-world examples of attacks on the Web3 world from the perspective of Web2.

## More Impactful XSS

In a typical website, if an XSS vulnerability is successfully exploited, the attacker can usually steal user data such as phone numbers, emails, or names.

But what if an XSS vulnerability is found in the Web3 world? Besides stealing data, it could potentially lead to the theft of something more valuable—cryptocurrencies.

In the world of cryptocurrencies, everyone has their own wallet, and one of the most well-known wallets in the browser is Metamask. When you need to authorize a transaction or sign a message, you will see the following interface:

![](./pics/30-01.png)

If it's a transaction or authorization for a smart contract, you will see the contract address and other details.

We all know not to blindly accept transactions from unknown sources or ignore suspicious websites. But what if it's a well-known website like PancakeSwap? When you perform an action on such a website and click "Confirm", Metamask pops up a prompt asking you to approve the transaction. I believe that 90% of people would simply click "Confirm".

However, due to this small click, you could potentially lose a large amount of cryptocurrency.

The act of "signing a transaction" is actually a website calling the wallet's provided API through JavaScript and prompting the wallet's interface. Only when the user clicks "Approve" will the transaction be signed using the private key, making the transaction valid.

Therefore, in the Web3 world, if a hacker gains control over the execution of JavaScript, they can execute a malicious transaction on a seemingly legitimate website. When the user agrees, they may unknowingly authorize their cryptocurrencies to the hacker's smart contract, resulting in the theft of their funds.

For example, in 2022, a JavaScript file on a NFT website called PREMINT was compromised, causing some users to unintentionally authorize the hacker's smart contract. For more details, please refer to: [PREMINT NFT Incident Analysis](https://www.certik.com/resources/blog/77oaazrsx1mewnraJePYQI-premint-nft-incident-analysis)

When you find a website vulnerable to XSS, you can only attack that specific website. However, if you find vulnerabilities in libraries used by multiple websites, the impact becomes much greater.

The previously mentioned supply chain attacks can also be applied to Web3 websites. Next, let's discuss an article published by Sam Curry in 2022: [Exploiting Web3’s Hidden Attack Surface: Universal XSS on Netlify’s Next.js Library](https://samcurry.net/universal-xss-on-netlifys-next-js-library/)

In the article, he describes finding vulnerabilities in the Next.js library and @netlify/ipx, which allow XSS attacks on any website using these libraries.

Netlify is a popular platform for deploying websites, especially for Web3 websites that may be static pages without a traditional backend. All page functionalities can be achieved through HTML, CSS, and JavaScript without the need for backend APIs.

Therefore, through this vulnerability, it is possible to attack well-known websites like Gemini or PancakeSwap, using XSS to prompt the authorization interface of a smart contract and deceive users into clicking.

## Practical Application of Cookie Bomb

The previously mentioned cookie bomb also has new implications in the Web3 world.

In an article published by OtterSec in 2023: [Web2 Bug Repellant Instructions](https://osec.io/blog/2023-08-11-web2-bug-repellant-instructions), they mention real-world examples.

Many websites now support image uploads, and some even allow SVG files.

So, what's the difference between SVG and other image formats? The difference is that SVG files can execute scripts, like the example below:

``` svg
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<svg version="1.1" xmlns="http://www.w3.org/2000/svg">
  <script type="text/javascript">
    alert("Hello");
  </script>
</svg>
```

Therefore, if a website supports SVG uploads, there is a high chance of exploiting an XSS vulnerability using SVG.

However, there is one problem. Many image upload locations are separated from the main website, such as directly uploading to S3 without any specific domain configuration. So at best, you would only achieve an XSS on the image domain, which has limited impact.

However, it is different for NFT websites.

For NFT websites, images are an important part. If the images cannot be displayed, the usability of the entire website will be significantly affected. Therefore, using a cookie bomb to perform a DoS attack on the images has a greater impact on NFT websites.

The severity and impact of the same vulnerability can vary for different types of products.

For example, both a DoS vulnerability can temporarily crash a webpage, which may not be a big deal for a Christmas event webpage last year, but it can cause significant losses for a cryptocurrency exchange.

## Conclusion

In this article, we have seen that Web3 products still need to face the same security issues as traditional web pages and must be protected. If not properly protected, even if the intrusion is not into smart contracts, it can still cause certain damages.

The attack surface of Web3 is not limited to smart contracts. Traditional web security, phishing attacks, and private key security are all areas that need to be defended against.
