import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { customLogger } from './methods';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(minMax);

const DEFAULT_TIMEZONE = 'Europe/Rome';
dayjs.tz.setDefault(DEFAULT_TIMEZONE);

type DateInput = string | number | Date | dayjs.Dayjs;

const daytz = (
  date: DateInput,
  timezoneFormat: string = DEFAULT_TIMEZONE,
  dateFormat?: string, // Optional date format string
  keepLocalTime: boolean = false // keepLocalTime flag
) => {
  try {
    // First, parse the date with the potential format
    const parsedDate = dateFormat ? dayjs(date, dateFormat) : dayjs(date);

    // Then apply the timezone, with or without keeping local time
    const dateWithTimezone = parsedDate.tz(timezoneFormat, keepLocalTime);

    if (!dateWithTimezone.isValid()) {
      throw new Error(`Invalid date: ${date}`);
    }
    return dateWithTimezone;
  } catch (error) {
    if (error instanceof Error) {
      customLogger('error', `Error parsing date: ${error.message}`);
      throw error;
    } else {
      customLogger('error', 'An unexpected error occurred');
      throw new Error('An unexpected error occurred');
    }
  }
};

export { daytz, dayjs };
