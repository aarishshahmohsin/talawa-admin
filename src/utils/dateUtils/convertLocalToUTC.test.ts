import dayjs from 'dayjs';
import { convertLocalToUTC } from './convertLocalToUTC';

describe('convertLocalToUTC function', () => {
  it('should convert a local date to UTC', () => {
    const localDate = new Date();

    const utcDate = convertLocalToUTC(localDate);

    const expectedUTCTimestamp =
      localDate.getTime() - localDate.getTimezoneOffset() * 60 * 1000;

    expect(dayjs(utcDate).format('YYYY-MM-DD')).toEqual(
      dayjs(expectedUTCTimestamp).format('YYYY-MM-DD'),
    );
  });
});
