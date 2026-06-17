export async function readApiResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { error: await res.text() };

  if (!res.ok) {
    const message =
      typeof data?.error === "string" && data.error.trim()
        ? data.error
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}
