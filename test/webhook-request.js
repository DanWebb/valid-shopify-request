import test from 'ava';
import request from 'supertest';
import Koa from 'koa';
import getPort from 'get-port';
import validShopifyRequest from '../dist';

const koaInstance = async secret => {
	const app = new Koa();

	app.use(async ctx => {
		try {
			await validShopifyRequest(secret, ctx.req);
			ctx.status = 200;
		} catch (err) {
			ctx.status = 400;
		}
	});

	return app.listen(await getPort());
};

test('Returns true when a valid payload and HMAC header is used', async t => {
	const secret = 'hush';
	const hmacHeader = 'LEB1cvxkgQ2oQbuQh8di8EMtWg7gZXWNv9L0pvaEfJc=';
	const payload = {
		code: '0907a61c0c8d55e99db179b68161bc00',
		shop: 'some-shop.myshopify.com',
		timestamp: '1337178173'
	};
	const app = await koaInstance(secret);
	const response = await request(app)
		.post('/')
		.set('X-Shopify-Hmac-SHA256', hmacHeader)
		.send(payload);
	
	t.is(response.status, 200);
});

test('Passing an invalid HMAC header throws an error', async t => {
	const secret = 'hush';
	const hmacHeader = '123';
	const payload = {
		code: '0907a61c0c8d55e99db179b68161bc00',
		shop: 'some-shop.myshopify.com',
		timestamp: '1337178173'
	};
	const app = await koaInstance(secret);
	const response = await request(app)
		.post('/')
		.set('X-Shopify-Hmac-SHA256', hmacHeader)
		.send(payload);
	
	t.is(response.status, 400);
});