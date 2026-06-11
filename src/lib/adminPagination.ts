export const ADMIN_PAGE_SIZE = 10;

export function slicePage<T>(items: T[], page: number, pageSize: number = ADMIN_PAGE_SIZE): T[] {
  const start = (Math.max(1, page) - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
