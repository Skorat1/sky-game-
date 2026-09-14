export function sanitizeGameUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim();
  clean = clean.replace(/^https?:\/\/"https?:\/\//i, 'https://');
  clean = clean.replace(/^"|"$/g, '').trim();
  clean = clean.replace(/&amp;/g, '&');
  return clean;
}

export function sanitizeUser(u) {
  if (!u) return null;
  const obj = u.toObject ? u.toObject() : { ...u };
  delete obj.password;
  delete obj.__v;
  return obj;
}
