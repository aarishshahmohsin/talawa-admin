export const convertLocalToUTC = (localDate: Date): Date => {
  const utcDate = new Date(
    localDate.toLocaleString(undefined, {
      timeZone: 'UTC',
    }),
  );

  return utcDate;
};
