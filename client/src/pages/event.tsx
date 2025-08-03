import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Calendar from "../components/Calendar";

const Event = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<any>(null);
    const [dates, setDates] = useState<Date[]>([]);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`);
                if (!response.ok) throw new Error("Chyba při načítání události");
                const data = await response.json();
                console.log("Event data:", data);
                setEvent(data);
                const dates = data.dates.map((date: string) => new Date(date));
                setDates(dates);
            } catch (error) {
                console.error("Chyba při načítání události:", error);
            }
        }
        fetchEvent();
    }, [id]);

    return (
        <div className="container mt-5">
            <h1>{event?.title}</h1>
            <p>{event?.description}</p>
            <p><Link to="/dashboard">zpět</Link></p>
            <Calendar
                selectedDates={dates}
            />
        </div>
    );
}

export default Event;