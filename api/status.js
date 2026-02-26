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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({error: 'Method Not Allowed'});
    return;
  }
  const counts = {};
  for (const f of FLOWERS) {
    counts[f] = parseInt(await redis.get(`stock:${f}`) || '0', 10);
  }
  res.status(200).json({counts, limit: LIMIT});
}
