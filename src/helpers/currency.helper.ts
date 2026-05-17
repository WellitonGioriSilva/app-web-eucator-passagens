export const currencyFormat = (
  value: number | null | undefined,
  locale = 'pt-BR',
  currency = 'BRL',
): string => {
  if (value === null || value === undefined) return '';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};