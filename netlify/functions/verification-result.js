export default async (req) => {
  const apiKey = process.env.VERIPHONE_WEB_API_KEY;
  const apiSecret = process.env.VERIPHONE_API_SECRET;
  if (!apiKey || !apiSecret) return Response.redirect(new URL("/?status=error&reason=Server%20is%20not%20configured", req.url), 303);

  const incoming = new URL(req.url);
  const sessionUuid = String(incoming.searchParams.get("sessionUuid") || "");
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(sessionUuid)) {
    return Response.redirect(new URL("/?status=error&reason=Missing%20or%20invalid%20verification%20session", req.url), 303);
  }

  try {
    const resultUrl = new URL("https://service.veriph.one/sdk-api/phone-verification/verification-result/v1.1.0");
    resultUrl.searchParams.set("sessionUuid", sessionUuid);

    const response = await fetch(resultUrl, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "authorization": `Basic ${apiSecret}`
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Veriph.One result error:", response.status, data);
      return Response.redirect(new URL("/?status=error&reason=Could%20not%20retrieve%20verification%20result", req.url), 303);
    }

    const successful =
      data?.result?.parsedStatus?.wasSuccessful === true ||
      data?.firstSuccessfulAttempt != null;

    return Response.redirect(new URL(successful ? "/?status=success" : "/?status=failed", req.url), 303);
  } catch (error) {
    console.error("Verification result error:", error);
    return Response.redirect(new URL("/?status=error&reason=Could%20not%20retrieve%20verification%20result", req.url), 303);
  }
};
