// api/twitch-token.js
// Make sure you have 'import fetch from "node-fetch";' if you're not using Node.js 18+
// where 'fetch' is globally available. If your Vercel runtime is Node.js 16 or earlier,
// you'll need this import.
// Otherwise, remove it if you're on Node.js 18 or higher.
// import fetch from 'node-fetch'; // Uncomment if needed

export default async function handler(req, res) {
  // Add console.logs to trace execution in Vercel logs
  console.log("twitch-token.js function invoked successfully!");
  console.log("Request query parameters:", req.query);

  const { code, scope } = req.query; // Get both code and scope from the query params

  if (!code) {
    console.error("No authorization code received from Twitch.");
    return res.status(400).send('Authorization code missing.');
  }

  // Retrieve environment variables
  const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
  const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
  const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI || 'https://creator-dashboard-edwins-projects-3e70e724.vercel.app/api/twitch-token';

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
      console.error("Missing Twitch API environment variables. Ensure TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are set in Vercel.");
      // It's good practice to provide a generic 500 error to the client, but log specific details
      return res.status(500).send('Server configuration error. Please try again later.');
  }

  try {
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: TWITCH_REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => tokenResponse.text());
      console.error(`Twitch token exchange failed: HTTP Status ${tokenResponse.status}`);
      console.error('Twitch API Error Response:', errorData);

      // Respond with a more informative error from Twitch if available
      return res.status(tokenResponse.status).send(`Failed to exchange token with Twitch: ${JSON.stringify(errorData)}`);
    }

    const data = await tokenResponse.json();
    console.log("Successfully received Twitch tokens:", data);

    // --- IMPORTANT: What to do with the tokens? ---
    // At this point, `data` contains:
    // data.access_token (use this for future API calls to Twitch)
    // data.refresh_token (use this to get new access tokens when the old one expires)
    // data.expires_in (how long the access_token is valid)
    // data.scope (the scopes you were granted)
    //
    // You need to:
    // 1. **Store these tokens securely.** This is where Make.com might come in,
    //    or your database. You should associate these tokens with the user who
    //    just connected their Twitch account.
    // 2. **Potentially make an immediate call to get the user's Twitch ID/username**
    //    using the access_token, as this is critical for your portal.
    //    (e.g., `https://api.twitch.tv/helix/users` with `Authorization: Bearer YOUR_ACCESS_TOKEN` and `Client-Id: YOUR_CLIENT_ID`)
    // 3. **Redirect the user back to your frontend dashboard/success page.**

    // Example of saving to Make.com:
    const userId = "user_123"; // You need a way to identify the actual user here
                              // (e.g., from a session, or if you had an existing user ID)
    await fetch('https://hook.us2.make.com/cuj4obdh6gw5jwgy37y2nc51ov8wfkfl', { // REPLACE with your actual Make.com webhook for Twitch
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        twitch_access_token: data.access_token,
        twitch_refresh_token: data.refresh_token,
        twitch_expires_in: data.expires_in,
        twitch_scope: data.scope.join(' '), // Convert array to space-separated string
        // You might want to get the Twitch user ID here too:
        // twitch_user_id: twitchUserData.id,
        // twitch_username: twitchUserData.login,
      })
    });

    // Redirect the user to your main dashboard or a success page
    res.redirect('/dashboard?twitch_status=connected'); // Or whatever path makes sense for your portal

  } catch (error) {
    console.error("Critical error during Twitch token exchange or processing:", error);
    res.status(500).send('Internal server error during Twitch authentication process.');
  }
}
