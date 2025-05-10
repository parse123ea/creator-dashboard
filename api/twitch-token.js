export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing Twitch auth code' });
  }

  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: 'https://creator-dashboard.vercel.app/api/twitch-token'
  });

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (response.ok) {
    res.status(200).json(data);
  } else {
    res.status(response.status).json({ error: data });
  }
}
