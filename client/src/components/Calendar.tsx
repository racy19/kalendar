import { useMemo, useState } from "react";
import { Vote, VoteCount } from "../types/types";
import CheckmarkYes from "./svg/CheckmarkYes";
import CheckmarkMaybe from "./svg/CheckmarkMaybe";
import CheckmarkNo from "./svg/CheckmarkNo";

interface CalendarProps {
    eventOptions?: Date[];
    updatedEventDates?: Date[];
    showCellRadios?: boolean;
    handleOnClick?: (date: Date) => void;
    onVoteChange?: (updatedVotes: Vote[]) => void;
    voteCountByDate?: Record<string, VoteCount>;
}

const Calendar = ({ eventOptions, showCellRadios = false, handleOnClick, onVoteChange, voteCountByDate = {}, updatedEventDates }: CalendarProps) => {
    const today = new Date();

    const current = {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
    };

    const [yearToShow, setYearToShow] = useState(current.year);
    const [monthToShow, setMonthToShow] = useState(current.month);

    const [localVotes, setLocalVotes] = useState<Vote[]>([]);

    const firstDayOfMonth = new Date(yearToShow, monthToShow, 1);
    const firstDayOfMonthIndex = (firstDayOfMonth.getDay() + 6) % 7;

    /**
    * @param month 1 - leden, 2 - únor, ..., 12 - prosinec
    * @description Returns the number of days in a given month of a given year.
    * @example getDaysInMonth(2023, 2) // returns 28
    */
    const getDaysInMonth = (year: number, month: number): number =>
        new Date(year, month + 1, 0).getDate();

    const daysInCurrentMonth = getDaysInMonth(yearToShow, monthToShow);

    // return day of the month before the first day of the current month
    const dateBeforeFirstDay = (dayCount: number) => {
        const returnDay = new Date(yearToShow, monthToShow, 1);
        returnDay.setDate(returnDay.getDate() - dayCount);
        return returnDay.getDate();
    };

    const getCalRowCount = () =>
        Math.ceil((firstDayOfMonthIndex + daysInCurrentMonth) / 7);

    const dayRow = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
    const months = [
        "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
        "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
    ];

    const getPrevMonth = () => {
        const prevMonth = monthToShow === 0 ? 11 : monthToShow - 1;
        const prevYear = monthToShow === 0 ? yearToShow - 1 : yearToShow;
        setMonthToShow(prevMonth);
        setYearToShow(prevYear);
    };

    const getNextMonth = () => {
        const nextMonth = monthToShow === 11 ? 0 : monthToShow + 1;
        const nextYear = monthToShow === 11 ? yearToShow + 1 : yearToShow;
        setMonthToShow(nextMonth);
        setYearToShow(nextYear);
    };

    const calendarDayNumberArray = useMemo(() => {
        const daysToShow: any[][] = [];
        let row: any[] = [];

        for (let i = 0; i < getCalRowCount() * 7; i++) {
            let day: number;
            let date: Date;
            let isCurrentMonth: boolean;

            if (i < firstDayOfMonthIndex) {
                day = dateBeforeFirstDay(firstDayOfMonthIndex - i);
                date = new Date(yearToShow, monthToShow - 1, day, 12);
                isCurrentMonth = false;
            } else if (i < firstDayOfMonthIndex + daysInCurrentMonth) {
                day = i - firstDayOfMonthIndex + 1;
                date = new Date(yearToShow, monthToShow, day, 12);
                isCurrentMonth = true;
            } else {
                day = i - firstDayOfMonthIndex - daysInCurrentMonth + 1;
                date = new Date(yearToShow, monthToShow + 1, day, 12);
                isCurrentMonth = false;
            }

            row.push({ day, date, isCurrentMonth });

            if ((i + 1) % 7 === 0) {
                daysToShow.push(row);
                row = []; // reset row for next week
            }
        }

        return daysToShow;
    }, [yearToShow, monthToShow, daysInCurrentMonth, firstDayOfMonthIndex]);

    const handleVoteChange = (date: Date, vote: string) => {
        const updatedVotes = localVotes.filter(v => v.date.getTime() !== date.getTime());
        if (vote) {
            updatedVotes.push({ date, vote });
        }
        setLocalVotes(updatedVotes);
        onVoteChange?.(updatedVotes);
    };

    const cellVotes = (dateKey: string) => {
        const { yes, no, maybe } = voteCountByDate[dateKey] || { yes: 0, no: 0, maybe: 0 };
        return (
            <div className="d-flex justify-content-between">
                <span style={{ color: '00A000', marginRight: '.3rem', fontWeight: 'bold' }}>{yes}</span>
                <span style={{ color: '#FFA500', marginRight: '.3rem', fontWeight: 'bold' }}>{maybe}</span>
                <span style={{ color: '#B22222', fontWeight: 'bold' }}>{no}</span>
            </div>
        );
    }

    const daysMapped = calendarDayNumberArray.map((row, rowIndex) => (
        <div key={rowIndex} className="row flex-fill">
            {row.map((cell, colIndex) => {
                const isToday =
                    cell.isCurrentMonth &&
                    cell.day === current.day &&
                    monthToShow === current.month &&
                    yearToShow === current.year;

                const isEventOption = eventOptions?.some(
                    (d) => d.getTime() === cell.date.getTime()
                );

                const isUpdated = updatedEventDates?.some(
                    (d) => d.getTime() === cell.date.getTime()
                );

                return (
                    <div
                        key={colIndex}
                        className={`col border position-relative text-start p-2 calendar-cell ${isEventOption
                            ? "callendar-cell-event"
                            : isUpdated
                                ? "bg-success text-white"
                                : isToday
                                    ? "bg-primary text-white"
                                    : cell.isCurrentMonth
                                        ? ""
                                        : "text-muted bg-light"
                            }`}
                        onClick={() => handleOnClick?.(cell.date)}
                    >
                        <small className="position-absolute top-0 end-0 m-1">
                            {cell.day}
                        </small>
                        {(showCellRadios && isEventOption) && (
                            <>
                                <CheckmarkYes
                                    size={24}
                                    onToggle={() => handleVoteChange(cell.date, "yes")}
                                    checked={localVotes.some(v => v.date.getTime() === cell.date.getTime() && v.vote === "yes")}
                                />
                                <CheckmarkNo
                                    size={24}
                                    onToggle={() => handleVoteChange(cell.date, "no")}
                                    checked={localVotes.some(v => v.date.getTime() === cell.date.getTime() && v.vote === "no")}
                                />
                                <CheckmarkMaybe
                                    size={24}
                                    onToggle={() => handleVoteChange(cell.date, "maybe")}
                                    checked={localVotes.some(v => v.date.getTime() === cell.date.getTime() && v.vote === "maybe")}
                                />
                            </>)}
                        {(isEventOption) && (
                            <div className="position-absolute bottom-0 end-0">
                                {cellVotes(cell.date.toISOString())}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    ));

    return (
        <div className="calendar-wrapper" style={{ height: "calc(100vh - 100px)" }}>
            <div className="container h-100 d-flex flex-column">
                <h4 className="mt-3 mb-4 text-center">
                    <button type="button" className="btn btn-primary me-2" onClick={getPrevMonth}>
                        &lt;
                    </button>
                    <span className="calendar-headline">
                        {months[monthToShow]} {yearToShow}
                    </span>
                    <button type="button" className="btn btn-primary ms-2" onClick={getNextMonth}>
                        &gt;
                    </button>
                </h4>

                <div className="row bg-light border-bottom text-center fw-bold">
                    {dayRow.map((day, index) => (
                        <div key={index} className="col py-2 calendar-cell-header">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="calendar-body flex-grow-1">{daysMapped}</div>
            </div>
        </div>
    );
};

export default Calendar;
