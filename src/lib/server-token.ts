import crypto from 'crypto';

export type AdStartPayload = {
  readonly aid: string; // anonymous id
  readonly cid: string; // containerKey or client counter
  readonly iat: number; // issued at (ms)
  readonly exp: number; // expires at (ms)
};

const algo: string = 'sha256';

const getSecret = (): string => {
  const s = process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || '';
  if (!s) throw new Error('APP_SECRET is not configured');
  return s;
};

export const signToken = (payload: AdStartPayload): string => {
  const secret = getSecret();
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac(algo, secret).update(data).digest('base64url');
  return `${data}.${sig}`;
};

export const verifyToken = (token: string): AdStartPayload => {
  const secret = getSecret();
  const [data, sig] = token.split('.');
  if (!data || !sig) throw new Error('Invalid token');
  const expected = crypto
    .createHmac(algo, secret)
    .update(data)
    .digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error('Bad signature');
  }
  const payload = JSON.parse(
    Buffer.from(data, 'base64url').toString()
  ) as AdStartPayload;
  if (Date.now() > payload.exp) throw new Error('Token expired');
  return payload;
};
