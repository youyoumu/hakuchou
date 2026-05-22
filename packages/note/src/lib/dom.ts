export function parseToDoc(html: string) {
  return new DOMParser().parseFromString(html, "text/html");
}
