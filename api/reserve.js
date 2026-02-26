import { Redis } from '@upstash/redis';

const FLOWERS = [
  "lalea",
  "bujor",
  "trandafir",
  "margareta",
  "floarea_soarelui",
  "floare_albastra"
];
const LIMIT = 6;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

function genClaimCode(token, flower) {
  return `${flower}-${token.slice(0,8)}`;
}

const LUA_RESERVE = `
  local stock_key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local current = tonumber(redis.call('get', stock_key) or '0')
  if current >= limit then
    return -1
  else
    redis.call('incr', stock_key)
    return current + 1
  end
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({error: 'Method Not Allowed'});
    return;
  }
  const { token, preferences } = req.body || {};
  if (!token || !Array.isArray(preferences) || preferences.length === 0) {
    res.status(400).json({error: 'Invalid input'});
    return;
  }
  // Idempotency
  const reservationKey = `reservation:${token}`;
  const existing = await redis.get(reservationKey);
  if (existing) {
    const parsed = JSON.parse(existing);
    res.status(200).json(parsed);
    return;
  }
  let soldOut = [];
  let reserved = null;
  let claimCode = null;
  for (const flower of preferences) {
    const result = await redis.eval(LUA_RESERVE, [ `stock:${flower}` ], [ LIMIT ]);
    if (result !== -1) {
      reserved = flower;
      claimCode = genClaimCode(token, flower);
      break;
    } else {
      soldOut.push(flower);
    }
  }
  if (!reserved) {
    res.status(409).json({error: "SOLD_OUT_ALL"});
    return;
  }
  const response = { flower: reserved, claimCode, soldOut };
  await redis.set(reservationKey, JSON.stringify(response));
  res.status(200).json(response);
}
