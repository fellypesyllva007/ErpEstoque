export class NfeWebClient {
  private readonly baseUrl = (process.env.NFEWEB_API_URL ?? process.env.ERP_NFEWEB_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

  async post(path: string, body: Record<string, unknown>) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) as Record<string, unknown> : {};
    if (!response.ok) {
      throw new Error((payload.message as string | undefined) ?? "Falha na comunicação com NfeWeb");
    }
    return payload;
  }
}
