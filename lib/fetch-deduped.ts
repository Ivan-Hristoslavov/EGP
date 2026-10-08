const inflight = new Map<string, Promise<Response>>();

/**
 * Header, footer and page sections often ask for the same public endpoint at
 * the same moment. Callers that arrive while a request is running (or within a
 * moment of it finishing) share it; nothing is kept longer, so a refresh always
 * shows what was just changed in the admin.
 */
export function fetchDeduped(url: string): Promise<Response> {
  let request = inflight.get(url);

  if (!request) {
    request = fetch(url);
    inflight.set(url, request);

    const forget = () => {
      setTimeout(() => inflight.delete(url), 1500);
    };

    request.then(forget, forget);
  }

  return request.then((response) => response.clone());
}
