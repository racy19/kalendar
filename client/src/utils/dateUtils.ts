/**
 * @description return current year, month, day
 * @example const currentDate = getCurrentDate();
 * @returns currentDate.year, currentDate.month, currentDate.day
 */
export const getCurrentDate = () => {
    const today = new Date();
    return {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
    };
}

/**
* @param month 1 - leden, 2 - únor, ..., 12 - prosinec
* @description Returns the number of days in a given month of a given year.
* @example getDaysInMonth(2023, 2) // returns 28
*/
export const getDaysInMonth = (year: number, month: number): number =>
    new Date(year, month + 1, 0).getDate();

/**
 * @description return day of the previous month before the first day of the current month with given dayBeforeCount
 * @example dateBeforeFirstOfMonth(2025, 8, 3) return 28 (as 31 - 3)
 *  */
export const dateBeforeFirstOfMonth = (year: number, month: number, dayBeforeCount: number) => {
    const returnDay = new Date(year, month, 1); // first day of current month
    returnDay.setDate(returnDay.getDate() - dayBeforeCount); // go back in date with dayBeforeCount (retuns day of previous month dayBeforeCount back before 1st of current mont) 
    return returnDay.getDate();
}

/**
 * @returns number of previous month, and years if changed
 */
export const getPrevMonth = (year: number, month: number) => {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    return { prevYear, prevMonth }
}

/**
 * @returns number of next  month, and years if changed
 */
export const getNextMonth = (year: number, month: number) => {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    return { nextYear, nextMonth }
}

type CalendarDay = { day: number; date: Date; isCurrentMonth: boolean };

export const generateCalendarDays = (year: number, month: number): CalendarDay[][] => {
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfMonthIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInCurrentMonth = getDaysInMonth(year, month);

    const getCalRowCount = () =>
        Math.ceil((firstDayOfMonthIndex + daysInCurrentMonth) / 7);

    const daysToShow: CalendarDay[][] = [];
    let row: CalendarDay[] = [];

    for (let i = 0; i < getCalRowCount() * 7; i++) {
        let day: number;
        let date: Date;
        let isCurrentMonth: boolean;

        if (i < firstDayOfMonthIndex) {
            day = dateBeforeFirstOfMonth(year, month, firstDayOfMonthIndex - i);
            date = new Date(year, month - 1, day, 12);
            isCurrentMonth = false;
        } else if (i < firstDayOfMonthIndex + daysInCurrentMonth) {
            day = i - firstDayOfMonthIndex + 1;
            date = new Date(year, month, day, 12);
            isCurrentMonth = true;
        } else {
            day = i - firstDayOfMonthIndex - daysInCurrentMonth + 1;
            date = new Date(year, month + 1, day, 12);
            isCurrentMonth = false;
        }

        row.push({ day, date, isCurrentMonth });

        if ((i + 1) % 7 === 0) {
            daysToShow.push(row);
            row = []; // reset row for next week
        }
    }

    return daysToShow;
};