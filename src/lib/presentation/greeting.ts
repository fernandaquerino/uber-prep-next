/**
 * Retorna a saudação adequada de acordo com a hora do dia.
 *
 * - 05:00–11:59 → "Bom dia"
 * - 12:00–17:59 → "Boa tarde"
 * - 18:00–04:59 → "Boa noite"
 */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

/**
 * Monta a saudação completa, incluindo o nome quando disponível.
 * Ex.: "Bom dia, Fernanda" ou apenas "Bom dia".
 */
export function getGreetingWithName(name?: string | null, date: Date = new Date()): string {
  const greeting = getGreeting(date);
  const trimmed = name?.trim();
  return trimmed ? `${greeting}, ${trimmed}` : greeting;
}
