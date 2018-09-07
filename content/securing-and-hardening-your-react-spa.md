---
date: 2018-09-06T21:13:59+01:00
lastmod: 2018-09-06T21:13:59+01:00
title: "Securing and hardening your React single page application"
description: ""
authors: ["manuelkiessling"]
slug: 2018/09/06/securing-and-hardening-your-react-single-page-application
draft: true
---

- Securing: Protect against known attack vectors
- Hardening: Lower the risk of exploitation of unknown attack vectors
- Demonstrate classical CSRF via iFrame POST
- CSRF: Always send a header that only JS is allowed to set, check on the server that it is set
- XSS: Disallow any JS in the body



## Authentication

* REST requests must include the `X-Requested-With: XMLHttpRequest` header
* Client-side app receives session token after successful auth via REST response(?)
* Token must be large enough avoid guessing
* REST response also stores the token in a cookie
* Non-universal app: The client-side app can request `GET /api/sessiontokens/current`; the request will contain the
  cookie and the `X-Requested-With: XMLHttpRequest` header, thus the backend can respond with the token in the response
  body; this is secure against CSRF (see https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)_Prevention_Cheat_Sheet#Protecting_REST_Services:_Use_of_Custom_Request_Headers)
* Universal app: upon full-page requests, the session token is transmitted to the backend via cookie, thus it's
  straightforward to include it in the inital app state
* Do we need the token in the client app at all?
