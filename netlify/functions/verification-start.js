export default async (req) => {
  const apiKey = process.env.VERIPHONE_WEB_API_KEY;
  if (!apiKey) return Response.redirect(new URL("/?status=error&reason=Server%20is%20not%20configured", req.url), 303);

  const url = new URL(req.url);
  const phone = String(url.searchParams.get("phone") || "").replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return Response.redirect(new URL("/?status=error&reason=Enter%20a%20valid%2010-digit%20Indian%20mobile%20number", req.url), 303);
  }

  try {
    const payload = {
      prefilledPhoneNumber: {
        countryCode: "91",
        cellphoneNumber: phone,
        userCanEdit: false
      },
      metadata: {
        userId: crypto.randomUUID(),
        userAgent: req.headers.get("user-agent") || "unknown",
        ipAddress: req.headers.get("x-nf-client-connection-ip") || ""
      },
      configuration: {
        locale: "en",
        enforceInput: true
      }
    };

    const response = await fetch(
      "https://service.veriph.one/sdk-api/phone-verification/create-session/v1.0.0",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.redirectionUrl || !data.uuid) {
      console.error("Veriph.One create-session error:", response.status, data);
      return Response.redirect(new URL("/?status=error&reason=Could%20not%20start%20verification.%20Check%20API%20configuration", req.url), 303);
    }

    return Response.redirect(data.redirectionUrl, 303);
  } catch (error) {
    console.error("Create-session error:", error);
    return Response.redirect(new URL("/?status=error&reason=Network%20error%20starting%20verification", req.url), 303);
  }
};
