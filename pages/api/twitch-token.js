console.log('DEBUG - TWITCH_CLIENT_ID:', process.env.TWITCH_CLIENT_ID);
console.log('DEBUG - TWITCH_CLIENT_SECRET present?', !!process.env.TWITCH_CLIENT_SECRET);
console.log('DEBUG - redirect_uri used:', 'https://creator-dashboard-parse123ea.vercel.app/api/twitch-token');


export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing Twitch auth code' });
  }

  // Step 1: Exchange code for access_token
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: 'https://creator-dashboard-parse123ea.vercel.app/api/twitch-token' // Must match Twitch app settings
  });

  const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    return res.status(tokenRes.status).json({ error: tokenData });
  }

  const access_token = tokenData.access_token;

  // Step 2: Get user info from Twitch
  const userRes = await fetch('https://api.twitch.tv/helix/users', {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Client-Id': process.env.TWITCH_CLIENT_ID
    }
  });

  const userData = await userRes.json();
  const user_id = userData.data?.[0]?.id || null;

  // Step 3: Send to your Make webhook
  await fetch('https://hook.us2.make.com/k7wkcyjjmmegxfoywnlm8ul0lsqg7y1x', { // 👈 REPLACE THIS
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token,
      user_id,
      timestamp: new Date().toISOString()
    })
  });

  // Step 4: Redirect back to your app
  res.redirect('/dashboard'); // 👈 Optional: change if needed
}
