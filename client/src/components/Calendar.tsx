import { useMemo, useState } from "react";
import { Vote } from "../types/types";
import CheckmarkYes from "./UI/icons/CheckmarkYes";
import CheckmarkMaybe from "./UI/icons/CheckmarkMaybe";
import CheckmarkNo from "./UI/icons/CheckmarkNo";
import 'react-tooltip/dist/react-tooltip.css';
import { dateBeforeFirstOfMonth, getCurrentDate, getDaysInMonth, getNextMonth, getPrevMonth } from "../utils/dateUtils";
import DayVotesCount from "./UI/calendarComponents/DayVotesCount";

interface CalendarProps {
    eventDates?: Date[];
    updatedEventDates?: Date[];
    showCellRadios?: boolean;
    handleOnClick?: (date: Date) => void;
    onVoteChange?: (updatedVotes: Vote[]) => void;
    votesByDate?: any;
    userVoteStatus?: any;
}

const Calendar = ({ eventDates, showCellRadios = false, handleOnClick, onVoteChange, votesByDate = {}, updatedEventDates, userVoteStatus }: CalendarProps) => {
    const current = getCurrentDate();

    console.log('user vote status: ', userVoteStatus)

    const [yearToShow, setYearToShow] = useState(current.year);
    const [monthToShow, setMonthToShow] = useState(current.month);
    const [localVotes, setLocalVotes] = useState<Vote[]>([]);

    const firstDayOfMonth = new Date(yearToShow, monthToShow, 1);
    const firstDayOfMonthIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const daysInCurrentMonth = getDaysInMonth(yearToShow, monthToShow);

    const getCalRowCount = () =>
        Math.ceil((firstDayOfMonthIndex + daysInCurrentMonth) / 7);

    const dayRow = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
    const months = [
        "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
        "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
    ];

    const setPrevMonth = () => {
        const { prevYear, prevMonth } = getPrevMonth(yearToShow, monthToShow);
        setMonthToShow(prevMonth);
        setYearToShow(prevYear);
    };

    const setNextMonth = () => {
        const { nextYear, nextMonth } = getNextMonth(yearToShow, monthToShow);
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
                day = dateBeforeFirstOfMonth(yearToShow, monthToShow, firstDayOfMonthIndex - i);
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

    console.log('pole dni kalendare: ', calendarDayNumberArray)

    const handleVoteChange = (date: Date, vote: string) => {
        const updatedVotes = localVotes.filter(v => v.date.getTime() !== date.getTime());
        if (vote) {
            updatedVotes.push({ date, vote });
        }
        setLocalVotes(updatedVotes);
        onVoteChange?.(updatedVotes);
    };

    const daysMapped = calendarDayNumberArray.map((row, rowIndex) => (
        <div key={rowIndex} className="row flex-fill">
            {row.map((cell, colIndex) => {
                const isToday =
                    cell.isCurrentMonth &&
                    cell.day === current.day &&
                    monthToShow === current.month &&
                    yearToShow === current.year;

                const isEventOption = eventDates?.some(
                    (d) => d.getTime() === cell.date.getTime()
                );

                const isUpdated = updatedEventDates?.some(
                    (d) => d.getTime() === cell.date.getTime()
                );

                return (
                    <div
                        key={colIndex}
                        className={`col border position-relative text-start p-1 p-sm-2 calendar-cell ${isEventOption
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
                        {isEventOption && (
                            <div className="d-flex justify-content-start flex-row flex-md-column mt-3 mt-lg-0">
                                {showCellRadios && (
                                    <div className="d-flex justify-content-start flex-column flex-md-row">
                                        <CheckmarkYes
                                            size={24}
                                            onToggle={() => handleVoteChange(cell.date, "yes")}
                                            checked={localVotes.some(v => v.date.getTime() === cell.date.getTime() && v.vote === "yes")}
                                            wasChecked={userVoteStatus && userVoteStatus.some((v: any) => v.date === cell.date.toISOString() && v.vote === "yes")}
                                        />
                                        <CheckmarkNo
                                            size={24}
                                            onToggle={() => handleVoteChange(cell.date, "no")}
                                            checked={localVotes.some(v => v.date.getTime() === cell.date.getTime() && v.vote === "no")}
                                            wasChecked={userVoteStatus && userVoteStatus.some((v: any) => v.date === cell.date.toISOString() && v.vote === "no")}
                                        />
                                        <CheckmarkMaybe
                                            size={24}
                                            onToggle={() => handleVoteChange(cell.date, "maybe")}
                                            checked={localVotes.some(v => v.date.getTime() === cell.date.getTime() && v.vote === "maybe")}
                                            wasChecked={userVoteStatus && userVoteStatus.some((v: any) => v.date === cell.date.toISOString() && v.vote === "maybe")}
                                        />
                                    </div>
                                )}
                                <div className="d-flex justify-content-start flex-column flex-md-row gap-1 gap-md-3 ms-2">
                                    <DayVotesCount
                                        votesByDate={votesByDate}
                                        day={cell.date.toISOString()}
                                    />
                                </div>
                            </div>
                        )
                        }
                    </div>
                );
            })}
        </div>
    ));

    return (
        <div className="calendar-wrapper">
            <div className="container h-100 d-flex flex-column">
                <h4 className="mt-3 mb-4 text-center">
                    <button type="button" className="btn btn-primary me-2" onClick={setPrevMonth}>
                        &lt;
                    </button>
                    <span className="calendar-headline">
                        {months[monthToShow]} {yearToShow}
                    </span>
                    <button type="button" className="btn btn-primary ms-2" onClick={setNextMonth}>
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