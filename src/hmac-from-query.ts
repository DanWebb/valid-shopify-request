import crypto from 'crypto';
import Hmacs from './types/hmacs';
import Payload from './types/payload';

const hmacFromQuery = (secret: string, payload: Payload): Hmacs => {
	const {hmac, ...payloadWithoutHmac} = payload;

	if (!hmac) {
		throw new Error('Security Error - The expected hmac parameter was not present');
	}

	const keys = Object.keys(payloadWithoutHmac).sort();
	const message = keys.map(key => `${key}=${payloadWithoutHmac[key]}`).join('&');
	const generated = Buffer.from(crypto.createHmac('sha256', secret).update(message).digest('hex'), 'hex');
	const shopify = Buffer.from(hmac, 'hex');
	return {generated, shopify};
};

export = hmacFromQuery;
