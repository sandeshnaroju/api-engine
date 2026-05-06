/**
 * Generic URL builder that handles:
 * 1. Absolute vs Relative paths
 * 2. Path parameter injection (:id)
 * 3. Automatic Query String generation
 */
export const buildUrl = (
  baseUrl: string, 
  path: string, 
  params: Record<string, any> = {}
): string => {
  // 1. Check if the path is an absolute URL
  const isAbsolute = /^(https?|wss?):\/\//i.test(path);
  
  // Start with the path if absolute, otherwise combine with baseUrl
  let url = isAbsolute 
    ? path 
    : `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const queryParts: string[] = [];
  const usedParams = new Set<string>();

  // 2. Handle Path Parameters (e.g., /users/:id)
  const pathRegex = /:(\w+)/g;
  url = url.replace(pathRegex, (_, key) => {
    if (params[key] !== undefined) {
      usedParams.add(key);
      return encodeURIComponent(String(params[key]));
    }
    return `:${key}`; // Keep it for debugging if param is missing
  });

  // 3. Handle remaining params as Query Strings
  Object.keys(params).forEach((key) => {
    if (!usedParams.has(key) && params[key] !== undefined) {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(v => 
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
        );
      } else {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
  });

  return queryParts.length > 0 ? `${url}?${queryParts.join('&')}` : url;
};