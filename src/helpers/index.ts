import { Application } from 'express';
import { calculateDateForDuration, dateFormat, dateFormatDayMonth, durationFormat, timeFormat } from './date.helper';
import { currencyFormat } from './currency.helper';
import { validatePassword } from './regex.helper';

const helpers: Record<string, unknown> = {
  dateFormat,
  currencyFormat,
  validatePassword,
  dateFormatDayMonth,
  calculateDateForDuration,
  timeFormat,
  durationFormat
};

export const registerHelpers = (app: Application): void => {
  Object.assign(app.locals, helpers);
};