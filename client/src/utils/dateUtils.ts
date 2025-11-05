import { UserVoteStatus } from "../features/event/eventTypes";

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

export const isDateToday = (date: Date): boolean => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
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

type CalendarDay = { day: number; date: string; isCurrentMonth: boolean };

export const getDateString = (date: Date): string => {
    return date.toISOString().split('T')[0] ?? ""; // returns date in YYYY-MM-DD format
}

export const getCZDateString = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('cs-CZ', options).replace(/\./g, '-'); // returns date in DD-MM-YYYY format
}

export const getCZDateDotString = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('cs-CZ', options); // returns date in DD.MM.YYYY format
}

export const getDateFromString = (dateString: string): Date => {
    return new Date(dateString); // converts YYYY-MM-DD string to Date object
}

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
        let dateD: Date;
        let isCurrentMonth: boolean;

        if (i < firstDayOfMonthIndex) {
            day = dateBeforeFirstOfMonth(year, month, firstDayOfMonthIndex - i);
            dateD = new Date(year, month - 1, day, 12);
            isCurrentMonth = false;
        } else if (i < firstDayOfMonthIndex + daysInCurrentMonth) {
            day = i - firstDayOfMonthIndex + 1;
            dateD = new Date(year, month, day, 12);
            isCurrentMonth = true;
        } else {
            day = i - firstDayOfMonthIndex - daysInCurrentMonth + 1;
            dateD = new Date(year, month + 1, day, 12);
            isCurrentMonth = false;
        }

        // Format date to YYYY-MM-DD
        let date = getDateString(dateD);

        row.push({ day, date, isCurrentMonth });

        if ((i + 1) % 7 === 0) {
            daysToShow.push(row);
            row = []; // reset row for next week
        }
    }

    return daysToShow;
};

export const isDateInSelected = (date: string, selectedDates: string[]): boolean => {
    return selectedDates.some(selectedDate => selectedDate === date);
}

/**
 * @description checks if date is in array of dates and if status matches
 * @param date Date to check
 * @param status Status to check for (e.g., "yes", "no", "maybe")
 * @param votedArray Array of votes to check against [{ date: Date, vote: string }]
 * @returns boolean indicating if the date and status match any entry in the array
 */
export const isDateAndStatusInVotes = (date: string, status: string, voteArray: UserVoteStatus[]): boolean => {
    if (voteArray.length) return voteArray.some(vote => vote.date === date && vote.status === status);
    return false;
}

export const getMinMaxDate = (dateArray: string[]) => {
    if (!dateArray.length) {
        return { min: null, max: null };
    }

    const dates = dateArray.map(d => new Date(d));

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    return { min: minDate.toLocaleDateString(), max: maxDate.toLocaleDateString() };
}