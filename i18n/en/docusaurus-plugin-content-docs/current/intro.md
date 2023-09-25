---
sidebar_position: 1
slug: /
---

# About This Series

As a software engineer, you must be familiar with information security. In your work projects, you may have gone through security audits, including static code scanning, vulnerability scanning, or penetration testing. You may have even done more comprehensive red team exercises. Apart from that, you may have heard of OWASP and have a general idea of what OWASP Top 10 includes and what common security vulnerabilities exist.

However, when we narrow down the scope to "information security in web front-end development," many people may only know about XSS and nothing else.

If we compare the field of web front-end security to a universe, XSS might be the biggest and brightest planet that captures most people's attention. But besides XSS, there are many other smaller planets and stars in the universe that have always been there, you just haven't noticed them.

Apart from XSS, there are many other security topics worth learning, such as prototype pollution that exploits JavaScript features, CSS injection attacks that can be executed without JavaScript, or side-channel attacks like XSLeaks in web front-end development.

![The diversity of security](pics/01-01.png)

As a front-end engineer, when I stepped into the field of security, it felt like entering a different world. In that world, I saw familiar HTML, CSS, and JavaScript, but they were used in ways I had never seen before. After working in this field for five or six years, I thought I had seen about 80% of the usage methods, but after diving into security, I realized it was the other way around - about 80% of the things were completely new to me!

Therefore, this series of articles aims to introduce some front-end security topics and explore the universe of front-end security together!

The topics covered in this series include:

1. XSS (Cross-Site Scripting)
2. CSP (Content Security Policy)
3. Sanitization
4. HTML injection
5. CSS injection
6. DOM clobbering
7. Prototype pollution
8. CSRF (Cross-site request forgery)
9. CORS (Cross-origin resource sharing)
10. Cookie tossing
11. Cookie bomb
12. Clickjacking
13. MIME sniffing
14. XSLeaks (Cross-site leaks)
15. CSTI (Client-side template injection)
16. Subdomain takeover
17. Dangling markup injection

This series of articles can be roughly divided into the following five chapters:

Chapter 1: Starting with XSS
Chapter 2: Defense and bypass for XSS  
Chapter 3: Attacks without JavaScript  
Chapter 4: Cross-site attacks  
Chapter 5: Other interesting topics  

The target audience for this series includes front-end engineers and people interested in security. It is assumed that readers have at least some basic technical knowledge, such as understanding the difference between front-end and back-end and having a basic understanding of HTML, CSS, and JavaScript.

In the world of security, knowledge is crucial. There are things you don't know that you don't know. When developing, you may unknowingly introduce a security vulnerability by not knowing that a certain way of writing code is problematic. I hope that through this series of articles, you can learn some new knowledge. If it sparks your interest in front-end security, that's great. But even if it doesn't, I hope it can at least show you a different aspect of front-end development and make you feel what I felt when I first encountered security - in simple words, "Wow, how did I not know about these things before?"

Lastly, the field of information security is vast and deep. If there are any technical errors in my articles, I welcome readers to point them out. Thank you.

## The Origin of This Series

I started writing this series because of an online event in Taiwan called [2023 iT Ironman Contest](https://ithelp.ithome.com.tw/2023ironman/event). It is a competition where you need to publish articles continuously for 30 days. That's why this series contains 30 articles. After completing the challenge, I extracted the content and built this website using Docusaurus for easier access to the full content.

All the articles are written in my mother tongue, traditional chinese, and the translation is done by ChatGPT.

## About Me

![](./pics/huli-logo-1080.jpg)

You can refer to my blog for more details: https://blog.huli.tw/en/about/

Twitter: https://twitter.com/aszx87410
