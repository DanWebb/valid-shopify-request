import crypto from 'crypto';
import {IncomingMessage} from 'http';
import getRawBody from 'raw-body';
import Hmacs from './types/hmacs';

const hmacFromBody = async (secret: string, payload: IncomingMessage): Promise<Hmacs> => {
	const hmacHeader = (payload.headers['x-shopify-hmac-sha256'] || '').toString();

	if (!hmacHeader) {
		throw new Error('Security Error - The expected x-shopify-hmac-sha256 header was not present in the request');
	}

	const body = await getRawBody(payload);
	const generated = Buffer.from(crypto.createHmac('sha256', secret).update(body).digest('base64'), 'base64');
	const shopify = Buffer.from(hmacHeader, 'base64');
	return {generated, shopify};
};

export = hmacFromBody;
