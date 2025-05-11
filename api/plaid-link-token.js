export default async function handler(req, res) {
  try {
    const response = await fetch('https://sandbox.plaid.com/link/token/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        client_name: "Your App",
        language: "en",
        country_codes: ["US"],
        user: { client_user_id: "unique-user-id" },
        products: ["transactions"]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Plaid error:", data);
      return res.status(response.status).json({ error: data });
    }

    console.log("Link token created:", data.link_token);
    res.status(200).json({ link_token: data.link_token });
  } catch (err) {
    console.error("Unexpected error in plaid-link-token:", err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
}
