const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.body['cf-turnstile-response'];
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip
    })
  });

  const data = await result.json();

  if (data.success) {
    return res.status(200).json({ message: "Token is valid." });
  } else {
    return res.status(400).json({ message: "Verification failed.", error: data["error-codes"] });
  }
}
