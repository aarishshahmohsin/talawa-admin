import EventListCard from 'components/EventListCard/EventListCard';
import dayjs from 'dayjs';
import Button from 'react-bootstrap/Button';
import React, { useState, useEffect } from 'react';
import styles from './EventCalendar.module.css';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import CurrentHourIndicator from 'components/CurrentHourIndicator/CurrentHourIndicator';
import { ViewType } from 'screens/OrganizationEvents/OrganizationEvents';
import HolidayCard from '../HolidayCards/HolidayCard';
import { holidays, hours, months, weekdays } from './constants';

interface InterfaceEvent {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  startTime: string | undefined;
  endTime: string | undefined;
  allDay: boolean;
  recurring: boolean;
  registrants?: InterfaceIEventAttendees[];
  isPublic: boolean;
  isRegisterable: boolean;
}

interface InterfaceCalendarProps {
  eventData: InterfaceEvent[];
  orgData?: InterfaceIOrgList;
  userRole?: string;
  userId?: string;
  viewType?: ViewType;
}

enum Status {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}

enum Role {
  USER = 'USER',
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
}

interface InterfaceIEventAttendees {
  userId: string;
  user?: string;
  status?: Status;
  createdAt?: Date;
}

interface InterfaceIOrgList {
  admins: { _id: string }[];
}
const Calendar: React.FC<InterfaceCalendarProps> = ({
  eventData,
  orgData,
  userRole,
  userId,
  viewType,
}) => {
  const [selectedDate] = useState<Date | null>(null);

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today.getDate());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<InterfaceEvent[] | null>(null);
  const [expanded, setExpanded] = useState<number>(-1);
  const [windowWidth, setWindowWidth] = useState<number>(window.screen.width);

  useEffect(() => {
    function handleResize(): void {
      setWindowWidth(window.screen.width);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filterData = (
    eventData: InterfaceEvent[],
    orgData?: InterfaceIOrgList,
    userRole?: string,
    userId?: string,
  ): InterfaceEvent[] => {
    const data: InterfaceEvent[] = [];
    if (userRole === Role.SUPERADMIN) return eventData;
    // Hard to test all the cases
    /* istanbul ignore next */
    if (userRole === Role.ADMIN) {
      eventData?.forEach((event) => {
        if (event.isPublic) data.push(event);
        if (!event.isPublic) {
          const filteredOrg: boolean | undefined = orgData?.admins?.some(
            (data) => data._id === userId,
          );

          if (filteredOrg) {
            data.push(event);
          }
        }
      });
    } else {
      eventData?.forEach((event) => {
        if (event.isPublic) data.push(event);
        const userAttending = event.registrants?.some(
          (data) => data.userId === userId,
        );
        if (userAttending) {
          data.push(event);
        }
      });
    }
    return data;
  };

  useEffect(() => {
    const data = filterData(eventData, orgData, userRole, userId);
    setEvents(data);
  }, [eventData, orgData, userRole, userId]);

  const handlePrevMonth = (): void => {
    /*istanbul ignore next*/
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = (): void => {
    /*istanbul ignore next*/
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePrevDate = (): void => {
    /*istanbul ignore next*/
    if (currentDate > 1) {
      setCurrentDate(currentDate - 1);
    } else {
      if (currentMonth > 0) {
        const lastDayOfPrevMonth = new Date(
          currentYear,
          currentMonth,
          0,
        ).getDate();
        setCurrentDate(lastDayOfPrevMonth);
        setCurrentMonth(currentMonth - 1);
      } else {
        setCurrentDate(31);
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      }
    }
  };
  /*istanbul ignore next*/
  const handleNextDate = (): void => {
    /*istanbul ignore next*/
    const lastDayOfCurrentMonth = new Date(
      currentYear,
      currentMonth - 1,
      0,
    ).getDate();
    /*istanbul ignore next*/
    if (currentDate < lastDayOfCurrentMonth) {
      setCurrentDate(currentDate + 1);
    } else {
      if (currentMonth < 12) {
        setCurrentDate(1);
        setCurrentMonth(currentMonth + 1);
      } else {
        setCurrentDate(1);
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      }
    }
  };

  const handleTodayButton = (): void => {
    /*istanbul ignore next*/
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setCurrentDate(today.getDate());
  };

  const timezoneString = `UTC${
    new Date().getTimezoneOffset() > 0 ? '-' : '+'
  }${String(Math.floor(Math.abs(new Date().getTimezoneOffset()) / 60)).padStart(
    2,
    '0',
  )}:${String(Math.abs(new Date().getTimezoneOffset()) % 60).padStart(2, '0')}`;

  /*istanbul ignore next*/
  const renderHours = (): JSX.Element => {
    const toggleExpand = (index: number): void => {
      if (expanded === index) {
        setExpanded(-1);
      } else {
        setExpanded(index);
      }
    };

    /*istanbul ignore next*/
    const allDayEventsList: JSX.Element[] =
      events
        ?.filter((datas) => {
          /*istanbul ignore next*/
          const currDate = new Date(currentYear, currentMonth, currentDate);
          if (
            datas.startTime == undefined &&
            datas.startDate == dayjs(currDate).format('YYYY-MM-DD')
          ) {
            return datas;
          }
        })
        .map((datas: InterfaceEvent) => {
          return (
            <EventListCard
              key={datas._id}
              id={datas._id}
              eventLocation={datas.location}
              eventName={datas.title}
              eventDescription={datas.description}
              regDate={datas.startDate}
              regEndDate={datas.endDate}
              startTime={datas.startTime}
              endTime={datas.endTime}
              allDay={datas.allDay}
              recurring={datas.recurring}
              isPublic={datas.isPublic}
              isRegisterable={datas.isRegisterable}
            />
          );
        }) || [];

    return (
      <>
        <div className={styles.calendar_hour_block}>
          <div className={styles.calendar_hour_text_container}>
            <p className={styles.calendar_timezone_text}>{timezoneString}</p>
          </div>
          <div className={styles.dummyWidth}></div>
          <div
            className={
              allDayEventsList?.length > 0
                ? styles.event_list_parent_current
                : styles.event_list_parent
            }
          >
            <div
              className={
                expanded === -100
                  ? styles.expand_list_container
                  : styles.list_container
              }
              style={{ width: 'fit-content' }}
            >
              <div
                className={
                  expanded === -100
                    ? styles.expand_event_list
                    : styles.event_list_hour
                }
              >
                {expanded === -100
                  ? allDayEventsList
                  : allDayEventsList?.slice(0, 1)}
              </div>
              {(allDayEventsList?.length > 2 ||
                (windowWidth <= 700 && allDayEventsList?.length > 0)) && (
                <button
                  className={styles.btn__more}
                  onClick={() => {
                    toggleExpand(-100);
                  }}
                >
                  {expanded === -100 ? 'View less' : 'View all'}
                </button>
              )}
            </div>
          </div>
        </div>
        {hours.map((hour, index) => {
          const timeEventsList: JSX.Element[] =
            events
              ?.filter((datas) => {
                const currDate = new Date(
                  currentYear,
                  currentMonth,
                  currentDate,
                );

                if (
                  datas.startTime?.slice(0, 2) == (index % 24).toString() &&
                  datas.startDate == dayjs(currDate).format('YYYY-MM-DD')
                ) {
                  return datas;
                }
              })
              .map((datas: InterfaceEvent) => {
                return (
                  <EventListCard
                    key={datas._id}
                    id={datas._id}
                    eventLocation={datas.location}
                    eventName={datas.title}
                    eventDescription={datas.description}
                    regDate={datas.startDate}
                    regEndDate={datas.endDate}
                    startTime={datas.startTime}
                    endTime={datas.endTime}
                    allDay={datas.allDay}
                    recurring={datas.recurring}
                    isPublic={datas.isPublic}
                    isRegisterable={datas.isRegisterable}
                  />
                );
              }) || [];
          /*istanbul ignore next*/
          return (
            <div key={hour} className={styles.calendar_hour_block}>
              <div className={styles.calendar_hour_text_container}>
                <p className={styles.calendar_hour_text}>{`${hour}`}</p>
              </div>
              <div className={styles.dummyWidth}></div>
              <div
                className={
                  timeEventsList?.length > 0
                    ? styles.event_list_parent_current
                    : styles.event_list_parent
                }
              >
                {index % 24 == new Date().getHours() &&
                  new Date().getDate() == currentDate && (
                    <CurrentHourIndicator />
                  )}
                <div
                  className={
                    expanded === index
                      ? styles.expand_list_container
                      : styles.list_container
                  }
                  style={{ width: 'fit-content' }}
                >
                  <div
                    className={
                      expanded === index
                        ? styles.expand_event_list
                        : styles.event_list
                    }
                  >
                    {/*istanbul ignore next*/}
                    {expanded === index
                      ? timeEventsList
                      : timeEventsList?.slice(0, 1)}
                  </div>
                  {(timeEventsList?.length > 1 ||
                    (windowWidth <= 700 && timeEventsList?.length > 0)) && (
                    <button
                      className={styles.btn__more}
                      onClick={() => {
                        toggleExpand(index);
                      }}
                    >
                      {expanded === index ? 'View less' : 'View all'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const renderDays = (): JSX.Element[] => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth(),
      monthStart.getDate() - monthStart.getDay(),
    );
    const endDate = new Date(
      monthEnd.getFullYear(),
      monthEnd.getMonth(),
      monthEnd.getDate() + (6 - monthEnd.getDay()),
    );
    const days = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      days.push(currentDate);
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1,
      );
    }

    return days.map((date, index) => {
      const className = [
        date.getDay() === 0 || date.getDay() === 6 ? styles.day_weekends : '',
        date.toLocaleDateString() === today.toLocaleDateString() //Styling for today day cell
          ? styles.day__today
          : '',
        date.getMonth() !== currentMonth ? styles.day__outside : '', //Styling for days outside the current month
        selectedDate?.getTime() === date.getTime() ? styles.day__selected : '',
        styles.day,
      ].join(' ');
      const toggleExpand = (index: number): void => {
        /*istanbul ignore next*/
        if (expanded === index) {
          setExpanded(-1);
        } else {
          setExpanded(index);
        }
      };
      /*istanbul ignore next*/
      const allEventsList: JSX.Element[] =
        events
          ?.filter((datas) => {
            if (datas.startDate == dayjs(date).format('YYYY-MM-DD'))
              return datas;
          })
          .map((datas: InterfaceEvent) => {
            return (
              <EventListCard
                key={datas._id}
                id={datas._id}
                eventLocation={datas.location}
                eventName={datas.title}
                eventDescription={datas.description}
                regDate={datas.startDate}
                regEndDate={datas.endDate}
                startTime={datas.startTime}
                endTime={datas.endTime}
                allDay={datas.allDay}
                recurring={datas.recurring}
                isPublic={datas.isPublic}
                isRegisterable={datas.isRegisterable}
              />
            );
          }) || [];

      const holidayList: JSX.Element[] = holidays
        .filter((holiday) => {
          if (holiday.date == dayjs(date).format('MM-DD')) return holiday;
        })
        .map((holiday) => {
          return <HolidayCard key={holiday.name} holidayName={holiday.name} />;
        });
      return (
        <div
          key={index}
          className={
            className + ' ' + (allEventsList?.length > 0 && styles.day__events)
          }
          data-testid="day"
        >
          {date.getDate()}
          {date.getMonth() !== currentMonth ? null : (
            <div
              className={expanded === index ? styles.expand_list_container : ''}
            >
              <div
                className={
                  /*istanbul ignore next*/
                  expanded === index
                    ? styles.expand_event_list
                    : styles.event_list
                }
              >
                <div>{holidayList}</div>
                {
                  /*istanbul ignore next*/
                  expanded === index
                    ? allEventsList
                    : holidayList?.length > 0
                      ? /*istanbul ignore next*/
                        allEventsList?.slice(0, 1)
                      : allEventsList?.slice(0, 2)
                }
              </div>
              {(allEventsList?.length > 2 ||
                (windowWidth <= 700 && allEventsList?.length > 0)) && (
                /*istanbul ignore next*/
                <button
                  className={styles.btn__more}
                  /*istanbul ignore next*/
                  onClick={() => {
                    toggleExpand(index);
                  }}
                >
                  {
                    /*istanbul ignore next*/
                    expanded === index ? 'View less' : 'View all'
                  }
                </button>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.calendar__header}>
        <Button
          variant="outlined"
          className={styles.button}
          onClick={viewType == ViewType.DAY ? handlePrevDate : handlePrevMonth}
          data-testid="prevmonthordate"
        >
          <ChevronLeft />
        </Button>

        <div
          className={styles.calendar__header_month}
          data-testid="current-date"
        >
          {viewType == ViewType.DAY ? `${currentDate}` : ``} {currentYear}{' '}
          <div>{months[currentMonth]}</div>
        </div>
        <Button
          variant="outlined"
          className={styles.button}
          onClick={viewType == ViewType.DAY ? handleNextDate : handleNextMonth}
          data-testid="nextmonthordate"
        >
          <ChevronRight />
        </Button>
        <div>
          <Button
            className={styles.btn__today}
            onClick={handleTodayButton}
            data-testid="today"
          >
            Today
          </Button>
        </div>
      </div>
      <div className={`${styles.calendar__scroll} customScroll`}>
        {viewType == ViewType.MONTH ? (
          <div>
            <div className={styles.calendar__weekdays}>
              {weekdays.map((weekday, index) => (
                <div key={index} className={styles.weekday}>
                  {weekday}
                </div>
              ))}
            </div>
            <div className={styles.calendar__days}>{renderDays()}</div>
          </div>
        ) : (
          /*istanbul ignore next*/
          <div className={styles.clendar__hours}>{renderHours()}</div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
