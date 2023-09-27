---
sidebar_position: 10
---

# Conclusion

The above is all the content of "Beyond XSS: Exploring the Web Front-end Security Universe". We started by discussing frontend security with XSS, introducing various types of XSS and attack methods. We then discussed defense techniques, including sanitization, CSP, and the latest Trusted Types and Sanitizer API.

Next, we introduced some techniques that can attack without directly executing JavaScript, such as prototype pollution caused by JavaScript language features, DOM clobbering using HTML to affect JavaScript, and CSS injection that doesn't require JavaScript. We want everyone to realize that attacks are not limited to JavaScript.

We also explored various attacks that bypass restrictions, understanding the difference between origin and site, knowing the basic principles of CORS and the common configuration mistakes that can cause problems. We also looked at CSRF and same-site cookies, understanding that security defense is not just a single point but a layered approach to ensure safety in most situations.

Finally, we introduced other interesting security topics, such as clickjacking executed through iframes, attacks achieved through automatic MIME type detection, and my personal favorite, XSLeaks. We explored various ways to detect differences and cause impact through these differences.

As I mentioned in the first post, frontend security is a universe. Besides XSS, there are many beautiful planets waiting to be discovered. It has always been there; you just haven't noticed it.

In the world of security, when it comes to frontend security, it indeed receives less attention compared to other fields because the impact it can cause is usually smaller. For example, some XSS attacks may only target one user and have limited access to data. However, if a server has an SQL injection vulnerability, it could retrieve millions of user records at once, including hashed passwords that XSS cannot obtain.

But this does not affect my love for frontend security. I enjoy frontend security because it always brings me surprises and makes me realize that as a frontend engineer, I only touch a small part of the frontend domain, and there is much more that is unfamiliar. As a frontend engineer, I believe learning frontend security is necessary. Information security is a fundamental skill that engineers should possess and is part of professional competence.

In my opinion, many frontend engineers are not unwilling to understand or get familiar with frontend security; they simply do not know it exists or where to start. Just like I mentioned before, prototype pollution seems to be well-known in the security community, but why didn't anyone tell me about it when I was learning frontend? Therefore, besides summarizing my own understanding of frontend security over the past two years, I also hope this series of articles can bring security knowledge back to the frontend community and make more people aware of frontend security.

If I have any expectations for this series of articles, it is that it becomes one of the must-read classics for frontend engineers.

I have always believed that development and security go hand in hand. Development makes you familiar with the overall project structure and how engineers usually work. Security, on the other hand, provides you with knowledge of many details, giving you a deeper understanding of what each component does and how they integrate. This knowledge will further help you look at development from a different perspective and create more secure software.

If you are interested in frontend security and want to get hands-on experience, I recommend PortSwigger's [Web Security Academy](https://portswigger.net/web-security). It provides many ready-to-use free labs, which are suitable for beginners to play around with.

If you want to stay updated with the latest frontend security knowledge, I also recommend following these individuals on Twitter. Each of them is a frontend security expert in my eyes, and they specialize in different areas (the order is random).

Apart from that, I've also learned a lot from them. 

1. [@kinugawamasato](https://twitter.com/kinugawamasato): Very knowledgeable about frontend security and JavaScript operations. He discovered the Teams RCE vulnerability, showing his expertise in frontend security.
2. [@terjanq](https://twitter.com/terjanq): A security researcher working at Google, well-versed in browser operations and frontend security. He maintains the XS-Leaks Wiki and has extensive experience with XS-Leaks.
3. [@brutelogic](https://twitter.com/brutelogic): XSS master with many XSS challenges on his blog for practice.
4. [@albinowax](https://twitter.com/albinowax): Chief researcher at PortSwigger, who presents new web attack techniques every year.
5. [@garethheyes](https://twitter.com/garethheyes): Also a security researcher at PortSwigger, who has discovered many frontend vulnerabilities related to browsers. He is knowledgeable in frontend security and JavaScript.
6. [@filedescriptor](https://twitter.com/filedescriptor): Mentioned in the previous posts when discussing cookie tossing and cookie bomb.
7. [@SecurityMB](https://twitter.com/SecurityMB): Known for discovering the classic Gmail DOM clobbering and bypassing DOMPurify using mutation XSS. He is also working at Google now.

There are other well-known experts in the front-end security community that were mentioned less frequently in previous articles (not mentioning them doesn't mean they are not experts, it may just be that I forgot at the moment, and Twitter will automatically recommend other experts to you after following these people): [@lbherrera_](https://twitter.com/lbherrera_), [@RenwaX23](https://twitter.com/RenwaX23), [@po6ix](https://twitter.com/po6ix), [@Black2Fan](https://twitter.com/black2fan), [@shhnjk](https://twitter.com/shhnjk), and [@S1r1u5_](https://twitter.com/S1r1u5_).

## Conclusion

The techniques discussed in this series of articles are not original; they all come from these experts and the vast online internet. I'm simply organizing and explaining them.

In this series, I have included the source references for all the real-world examples and some lesser-known vulnerabilities or issues. I have credited the authors whenever possible as a gesture of gratitude. If there are any omissions, please do not hesitate to bring them to my attention.

Whether you like or dislike this series, feel free to leave a comment on the [GitHub Discussions](https://github.com/aszx87410/beyond-xss/discussions) and let me know. You can also leave comments to discuss any security issues you want to know or any doubts about the articles.

Thanks for exploring the universe of web frontend security with me. I hope we can meet again in other galaxies in the future!
