# Valid Shopify Request
Validate the HMAC signature Shopify sends to make sure requests are authentic!

This supports both Shopify's [OAuth verification](https://help.shopify.com/en/api/getting-started/authentication/oauth#verification) and [Webhook verification](https://help.shopify.com/en/api/getting-started/webhooks#verify-webhook).

## Install
```
npm i -S valid-shopify-request
```

## Usage

`validShopifyRequest` is a function which accepts a two params `secret` which should be the same as your apps secret provided in the [Shopify partner dashboard](https://help.shopify.com/en/api/getting-started/authentication/oauth#step-1-get-the-clients-credentials) when you created the app and `payload` which should either be an object containing the query parameters Shopify sends for *Oauth verification* or a node request for *Webhook verification*.

* **OAuth verification:** After merchants install your app Shopify will redirect them with several URL query parameters including a `hmac` param containing the secure signature. In this case `validShopifyRequest` will expect you to pass in the full query params as an object.
* **Webhook verification:** Whenever Shopify sends a Webhook the request headers will contain `x-shopify-hmac-sha256` which will be a signature generated from the contents of the request body. In this case `validShopifyRequest` will expect the full node request object to be passed in so the body and headers can be read to check against the HMAC provided.

If successful the function returns a promise otherwise an error will be thrown containing a relevant error message.

### Koa Example
```js
import Koa from 'koa';
import Router from 'koa-router';
import validShopifyRequest from 'valid-shopify-request';

const app = new Koa();
const router = new Router();
const secret = 'abc123'; // You should really keep this in a config or .env file

router.get('/auth', async ctx => {
  await validShopifyRequest(secret, ctx.query);
  ctx.body = 'Authentic!';
});

router.post('/webhook', async ctx => {
  try {
    await validShopifyRequest(secret, ctx.req);
    console.log('Authentic!');
  } catch (err) {
    console.log(err.message); // Simple example of error handling, this should really go in a log file or something
  }
});

app.use(router.routes());
app.listen(3000);
```

### Express Example
```js
import express from 'express';
import validShopifyRequest from 'valid-shopify-request';

const app = express();
const secret = 'abc123'; // You should really keep this in a config or .env file

app.get('/auth', async (req, res) => {
  await validShopifyRequest(secret, req.query);
  res.send = 'Authentic!';
});

app.post('/webhook', async (req, res) => {
  try {
    await validShopifyRequest(secret, req);
    console.log('Authentic!');
  } catch (err) {
    console.log(err.message); // Simple example of error handling, this should really go in a log file or something
  }
});

app.listen(3000);
```

## FAQ

* **Why?:** Verifying the HMAC signature Shopify sends in their requests makes sure the request came from Shopify. If you don't verify this your app will be vulnrable to attacks as anybody will be able to send requests to your authentication and webhook endpoints pretending to be Shopify.
* **I can't find my apps secret?:** For apps created through the Shopify partner dashboard See the credentials section of [this guide](https://help.shopify.com/en/api/getting-started/authentication/oauth#step-1-get-the-clients-credentials). Alternatively if you created a webhook directly through a stores admin intead of through the API Shopify will also provide an individual secret directly below the webhooks in the notification settings where it says "All your webhooks will be signed with {SECRET}".
* **Do I need to use async/await:** I recommend you do but no, `validShopifyRequest(secret, ctx.req).then().catch()` would work just as well.