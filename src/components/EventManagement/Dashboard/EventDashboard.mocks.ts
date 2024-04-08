import { EVENT_DETAILS } from 'GraphQl/Queries/Queries';
import type { Time } from 'utils/types';

// Mock 1
export const MOCKS_WITH_TIME = [
  {
    request: {
      query: EVENT_DETAILS,
      variables: {
        id: 'event123',
      },
    },
    result: {
      data: {
        event: {
          _id: 'event123',
          title: 'Event Title',
          description: 'Event Description',
          startDate: '2023-01-01',
          endDate: '2023-02-16',
          startTime: '08:00:00' as Time,
          endTime: '09:00:00' as Time,
          allDay: false,
          location: 'India',
          organization: {
            _id: 'org1',
            members: [{ _id: 'user1', firstName: 'John', lastName: 'Doe' }],
          },
          attendees: [{ _id: 'user1' }],
        },
      },
    },
  },
];

// Mock 2
export const MOCKS_WITHOUT_TIME = [
  {
    request: {
      query: EVENT_DETAILS,
      variables: {
        id: 'event123',
      },
    },
    result: {
      data: {
        event: {
          _id: 'event123',
          title: 'Event Title',
          description: 'Event Description',
          startDate: '2023-01-01',
          endDate: '2023-02-16',
          startTime: null,
          endTime: null,
          allDay: false,
          location: 'India',
          organization: {
            _id: 'org1',
            members: [{ _id: 'user1', firstName: 'John', lastName: 'Doe' }],
          },
          attendees: [{ _id: 'user1' }],
        },
      },
    },
  },
];
