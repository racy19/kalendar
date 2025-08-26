import { Key, useState } from "react";
import CheckmarkYes from "./UI/icons/CheckmarkYes";
import CheckmarkMaybe from "./UI/icons/CheckmarkMaybe";
import CheckmarkNo from "./UI/icons/CheckmarkNo";
import 'react-tooltip/dist/react-tooltip.css';
import { generateCalendarDays, getCurrentDate, getNextMonth, getPrevMonth, isDateAndStatusInVotes, isDateInSelected, isDateToday } from "../utils/dateUtils";
import DayVotesCount from "./UI/calendarComponents/DayVotesCount";
import { UserVoteStatus, VoteStatus } from "../features/event/eventTypes";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Left from "./UI/icons/Left";
import Right from "./UI/icons/Right";

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
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
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
                        className={`${isDarkMode ? "" : "border"} col position-relative text-start p-1 p-sm-2 calendar-cell ${isEventOption ? "calendar-cell-event" : ""}
                            ${isDateInUpdated
                                ? "calendar-cell-event"
                                : isRemovedEventOption
                                    ? "calendar-cell-event-removed"
                                    : isToday
                                        ? "bg-primary text-white"
                                        : cell.isCurrentMonth
                                            ? ""
                                            : `${isDarkMode ? "black-dark-mode text-secondary" : "text-muted bg-light"}`
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
                                            isDarkMode={isDarkMode}
                                        />
                                        <CheckmarkNo
                                            size={24}
                                            onToggle={() => handleVoteChange(cell.date, "no")}
                                            checked={isDateAndStatusInVotes(cell.date, "no", localVotes)}
                                            wasChecked={userVoteStatus && isDateAndStatusInVotes(cell.date, "no", userVoteStatus)}
                                            isDarkMode={isDarkMode}
                                        />
                                        <CheckmarkMaybe
                                            size={24}
                                            onToggle={() => handleVoteChange(cell.date, "maybe")}
                                            checked={isDateAndStatusInVotes(cell.date, "maybe", localVotes)}
                                            wasChecked={userVoteStatus && isDateAndStatusInVotes(cell.date, "maybe", userVoteStatus)}
                                            isDarkMode={isDarkMode}
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
        <div className={`calendar-wrapper ${isDarkMode ? "calendar-dark-mode" : ""}`}>
            <div className="container h-100 d-flex flex-column">
                <h4 className="mt-3 mb-4 text-center">
                    <Left size={26} color={isDarkMode ? "#fff" : "#000"} className="me-2 link" onClick={setPrevMonth} />
                    <span className="calendar-headline">
                        {months[monthToShow]} {yearToShow}
                    </span>
                    <Right size={26} color={isDarkMode ? "#fff" : "#000"} className="ms-2 link" onClick={setNextMonth} />
                </h4>

                <div className={`row text-center fw-bold ${isDarkMode ? "light-black-dark-mode" : "bg-light border-bottom"}`}>
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