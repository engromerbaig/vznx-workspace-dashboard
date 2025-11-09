// src/utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  // Limit slug length to 50 characters
  if (slug.length > 50) {
    slug = slug.substring(0, 50);
  }
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug.substring(0, 45)}-${counter}`;
    counter++;
  }
  
  return slug;
}