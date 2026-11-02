# Veriph.One phone verification on Netlify

## 1. Rotate exposed credentials
The API key and secret previously pasted into chat should be revoked/rotated. Create a **Web API Key** in Veriph.One and use its new credentials. Never commit credentials or place them in `public/`.

## 2. Deploy to Netlify
- Unzip this folder.
- In Netlify choose **Add new site > Deploy manually** and drag the whole project folder (or connect a Git repository).
- For Git deployment, build command: `npm run build`; publish directory: `public`. `netlify.toml` configures the functions directory and redirects.
- For manual drag-and-drop, deploy via Netlify CLI (`netlify deploy --prod`) or connect Git; the Netlify dashboard's static folder upload does not reliably package Functions.

## 3. Add environment variables
Netlify > Site configuration > Environment variables:
- `VERIPHONE_WEB_API_KEY` = newly generated Web API key
- `VERIPHONE_API_SECRET` = secret for that Web API key

Redeploy after adding variables.

## 4. Set callback in Veriph.One
In the Web API Key configuration, set **Verification Result URL** to:
`https://YOUR-SITE.netlify.app/verification-result`

Save/update. Do not use localhost.

## 5. Test
Open `https://YOUR-SITE.netlify.app`, enter an Indian 10-digit mobile number and start verification. Veriph.One handles its own verification screen; the Netlify function checks the final result and redirects back with success/failure.

## Notes
- Netlify Functions keep credentials on the server.
- This example follows the Veriph.One session endpoint contract previously used in the starter. Confirm current request/response fields and India/carrier support in your Veriph.One documentation/dashboard before production.
- Add rate limiting and persistent session-to-user binding before using this for account security. The result callback should be protected against replay and tied to the initiating user in production.
