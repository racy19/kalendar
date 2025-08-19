import { Key, useState } from "react";
import CheckmarkYes from "./UI/icons/CheckmarkYes";
import CheckmarkMaybe from "./UI/icons/CheckmarkMaybe";
import CheckmarkNo from "./UI/icons/CheckmarkNo";
import 'react-tooltip/dist/react-tooltip.css';
import { generateCalendarDays, getCurrentDate, getNextMonth, getPrevMonth, isDateAndStatusInVotes, isDateInSelected, isDateToday } from "../utils/dateUtils";
import DayVotesCount from "./UI/calendarComponents/DayVotesCount";
import { UserVoteStatus, VoteStatus } from "../features/event/eventTypes";

interface CalendarProps {
    eventDates?: string[];
    updatedEventDates?: string[];
    showCellRadios?: boolean;
    handleOnClick?: (date: string) => void;
    onVoteChange?: (updatedVotes: UserVoteStatus[]) => void;
    votesByDate?: any;
    userVoteStatus?: UserVoteStatus[];
}

type CalendarDay = { day: number; date: string; isCurrentMonth: boolean };

type CalendarRow = CalendarDay[];

const Calendar = ({ eventDates, showCellRadios = false, handleOnClick, onVoteChange, votesByDate = {}, updatedEventDates, userVoteStatus }: CalendarProps) => {
    const current = getCurrentDate();

    const [yearToShow, setYearToShow] = useState(current.year);
    const [monthToShow, setMonthToShow] = useState(current.month);
    const [localVotes, setLocalVotes] = useState<UserVoteStatus[]>([]);

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

    const calendarDayNumberArray = generateCalendarDays(yearToShow, monthToShow)

    const handleVoteChange = (date: string, status: VoteStatus) => {
        const updatedVotes = localVotes.filter(v => v.date !== date);
        if (status) {
            updatedVotes.push({ date, status });
        }
        setLocalVotes(updatedVotes);
        onVoteChange?.(updatedVotes);
    };

    const daysMapped = calendarDayNumberArray.map((row: CalendarRow, rowIndex: Key) => (
        <div key={rowIndex} className="row flex-fill">
            {row.map((cell: CalendarDay, colIndex: Key) => {
                const cellDate = new Date(yearToShow, monthToShow, cell.day);
                const isToday = isDateToday(cellDate);

                const isEventOption = isDateInSelected(cell.date, eventDates || []);
                const isDateInUpdated = isDateInSelected(cell.date, updatedEventDates || []);
                const isRemovedEventOption = isEventOption && !isDateInSelected(cell.date, updatedEventDates || []);

                return (
                    <div
                        key={colIndex}
                        className={`col border position-relative text-start p-1 p-sm-2 calendar-cell ${isEventOption ? "callendar-cell-event" : ""}
                            ${isDateInUpdated
                                ? "callendar-cell-event"
                                : isRemovedEventOption
                                    ? "callendar-cell-event-removed"
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
                                            checked={isDateAndStatusInVotes(cell.date, "yes", localVotes)}
                                            wasChecked={userVoteStatus && isDateAndStatusInVotes(cell.date, "yes", userVoteStatus)}
                                        />
                                        <CheckmarkNo
                                            size={24}
                                            onToggle={() => handleVoteChange(cell.date, "no")}
                                            checked={isDateAndStatusInVotes(cell.date, "no", localVotes)}
                                            wasChecked={userVoteStatus && isDateAndStatusInVotes(cell.date, "no", userVoteStatus)}
                                        />
                                        <CheckmarkMaybe
                                            size={24}
                                            onToggle={() => handleVoteChange(cell.date, "maybe")}
                                            checked={isDateAndStatusInVotes(cell.date, "maybe", localVotes)}
                                            wasChecked={userVoteStatus && isDateAndStatusInVotes(cell.date, "maybe", userVoteStatus)}
                                        />
                                    </div>
                                )}
                                <div className="d-flex justify-content-start flex-column flex-md-row gap-1 gap-md-3 ms-2">
                                    <DayVotesCount
                                        votesByDate={votesByDate}
                                        day={cell.date}
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