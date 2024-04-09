import dayjs from 'dayjs';
import { convertUTCtoLocal } from './convertUTCtoLocal';

describe('convertUTCtoLocal function', () => {
  it('should convert a UTC date to local time', () => {
    const utcDate = new Date('2024-04-09T12:00:00Z');

    const localDate = convertUTCtoLocal(utcDate);

    const expectedLocalDate = new Date('2024-04-09T12:00:00');

    expect(dayjs(localDate).format('YYYY-MM-DD')).toEqual(
      dayjs(expectedLocalDate).format('YYYY-MM-DD'),
    );
  });
});
