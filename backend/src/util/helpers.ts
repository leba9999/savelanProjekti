import logger from "./loggers";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function normalizeUrl(dirtyUrl: string, baseDomain: string): string {
  const parsedUrl = new URL(dirtyUrl, baseDomain);

  // If the URL is missing the protocol (e.g., http://), you can add it here
  if (!parsedUrl.protocol || parsedUrl.protocol === "http:") {
    parsedUrl.protocol = "https:";
  }
  parsedUrl.search = "";
  parsedUrl.hash = "";

  return parsedUrl.toString();
}

// Utility function to make object keys case-insensitive
const makeKeysCaseInsensitive = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  for (const key in obj) {
    result[key.toLowerCase()] = obj[key];
  }
  return result;
};
export { wait, normalizeUrl, makeKeysCaseInsensitive };
