export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString();
}

export function isToday(date: Date | string): boolean {
  return new Date(date).toDateString() === new Date().toDateString();
}
