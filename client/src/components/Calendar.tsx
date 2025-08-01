
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Calendar = () => {
    const today = new Date();

    const current = {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
    };

    const [yearToShow, setYearToShow] = useState(current.year);
    const [monthToShow, setMonthToShow] = useState(current.month);


    const firstDayOfMonth = new Date(yearToShow, monthToShow, 1);
    const firstDayOfMonthIndex = (firstDayOfMonth.getDay() + 6) % 7; // Po = 0

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
    }

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
            if (i < firstDayOfMonthIndex) {
                const day = dateBeforeFirstDay(firstDayOfMonthIndex - i);
                row.push({
                    day: day,
                    isCurrentMonth: false
                });
            } else if (i < firstDayOfMonthIndex + daysInCurrentMonth) {
                row.push({
                    day: i - firstDayOfMonthIndex + 1,
                    isCurrentMonth: true
                });
            } else {
                row.push({
                    day: i - firstDayOfMonthIndex - daysInCurrentMonth + 1,
                    isCurrentMonth: false
                });
            }
            if ((i + 1) % 7 === 0) {
                daysToShow.push(row);
                row = []; // reset row for next week
            }
        }
        return daysToShow;
    }, [yearToShow, monthToShow, daysInCurrentMonth, firstDayOfMonthIndex]);

    const daysMapped = calendarDayNumberArray.map((row, rowIndex) => (
            <div key={rowIndex} className="row flex-fill">
                {row.map((cell, colIndex) => {
                    const isToday =
                        cell.isCurrentMonth && cell.day === current.day &&
                        monthToShow === current.month && yearToShow === current.year;
                    return (
                        <div
                            key={colIndex}
                            className={`col border position-relative text-start p-2 calendar-cell ${isToday ?
                                "bg-primary text-white"
                                : cell.isCurrentMonth
                                    ? ""
                                    : "text-muted bg-light"}`}
                        >
                            <small className="position-absolute top-0 end-0 m-1">
                                {cell.day}
                            </small>
                        </div>
                    )
                }
                )}
            </div>
        ));

    return (
        <div className="calendar-wrapper" style={{ height: "calc(100vh - 100px)" }}>
            <div className="container h-100 d-flex flex-column">
                <p className="mt-3">
                    <Link to="/dashboard">{"< Zpět na dashboard"}</Link>
                </p>
                <h3 className="mt-3 mb-4 text-center">
                    <button className="btn btn-primary me-2" onClick={getPrevMonth}>
                        &lt;
                    </button>
                    <span className="calendar-headline">
                        {months[monthToShow]} {yearToShow}
                    </span>
                    <button className="btn btn-primary ms-2" onClick={getNextMonth}>
                        &gt;
                    </button>
                </h3>

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
