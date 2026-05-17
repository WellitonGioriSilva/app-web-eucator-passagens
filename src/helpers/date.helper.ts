export const dateFormat = (
  value: Date | null | undefined,
): string => {
  if (value === null || value === undefined) return '';

  return value.toLocaleDateString();
};

// Dia - MêsDescritivo
export const dateFormatDayMonth = (
  value: Date | null | undefined,
): string => {
  if (value === null || value === undefined) return '';
  return value.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
};

export const calculateDateForDuration = (start: Date, duration: string): Date => {
  const [hours, minutes] = duration.split(':').map(Number);
  const result = new Date(start);
  result.setHours(result.getHours() + hours);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const timeFormat = (
  value: Date | null | undefined,
): string => {
  if (value === null || value === undefined) return '';
  return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const durationFormat = (duration: string): string => {
  const [hours, minutes] = duration.split(':').map(Number);
  return `${hours}h ${minutes}m`;
}