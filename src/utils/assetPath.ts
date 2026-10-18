export const assetPath = (path: string, revision?: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}${revision ? `?v=${encodeURIComponent(revision)}` : ''}`;
