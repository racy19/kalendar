import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Calendar from "../components/Calendar";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import ButtonSubmit from "../components/ButtonSubmit";
import { EventOption, Vote, VoteCount } from "../types/types";

const Event = () => {
    const { publicId } = useParams<{ publicId: string }>();
    const [event, setEvent] = useState<any>(null);
    const [eventCreator, setEventCreator] = useState<string>("");
    const [datesToVote, setDatesToVote] = useState<Date[]>([]);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [voteCountByDate, setVoteCountByDate] = useState<any>(null);
    const [updatedDates, setUpdatedDates] = useState<Date[]>([]);

    const { id: userId } = useSelector((state: RootState) => ({
        id: state.auth.user?.id
    }));

    const handleDateToggle = (date: Date) => {
        setUpdatedDates(prevDates =>
            prevDates.includes(date)
                ? prevDates.filter(d => d.getTime() !== date.getTime())
                : [...prevDates, date]
        );
        console.log("Updated dates:", updatedDates);
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (votes.length === 0) {
            alert("Musíte vybrat alespoň jedno datum.");
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${publicId}/vote`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    votes: votes.map(vote => ({
                        date: vote.date,
                        status: vote.vote
                    }))
                }),
            });

            if (!response.ok) throw new Error("Chyba při ukládání hlasování");

            const data = await response.json();
            console.log("Hlasování uloženo:", data);
            alert("Vaše hlasování bylo úspěšně uloženo.");
        } catch (error) {
            console.error("Chyba při ukládání hlasování:", error);
            alert("Došlo k chybě při ukládání hlasování. Zkuste to prosím znovu.");
        }
    }

    const handleUpdateEvent = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (updatedDates.length === 0) {
            alert("Musíte vybrat alespoň jedno datum.");
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${publicId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dates: updatedDates
                }),
            });
            if (!response.ok) throw new Error("Chyba při ukládání hlasování");
            const data = await response.json();
            console.log("Událost aktualizována:", data);
            alert("Událost byla úspěšně aktualizována.");
        } catch (error) {
            console.error("Chyba při aktualizaci události:", error);
            alert("Došlo k chybě při aktualizaci události. Zkuste to prosím znovu.");
            return;
        }
    }

    useEffect(() => {
        const fetchEvent = async () => {
            if (!publicId) return;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${publicId}`);
                if (!response.ok) throw new Error("Chyba při načítání události");
                const data = await response.json();
                console.log("Event data:", data);
                // transform data to match expected structure
                const filteredData = {
                    ...data,
                    dates: data.options.map((option: EventOption) => option.date)
                }
                setEvent(filteredData);
                const dates = filteredData.dates.map((date: string) => new Date(date));
                setDatesToVote(dates);
                console.log("filtereddata:", filteredData);
                const votesByDate = filteredData.options.reduce(
                    (acc: any, option: any) => {
                        const dateKey =
                            option.date instanceof Date
                                ? option.date.toISOString()
                                : new Date(option.date).toISOString();

                        const voteCount: VoteCount = { yes: 0, no: 0, maybe: 0 };
                        option.votes.forEach((vote: any) => {
                            if (vote.status === "yes") voteCount.yes++;
                            else if (vote.status === "no") voteCount.no++;
                            else if (vote.status === "maybe") voteCount.maybe++;
                        });

                        acc[dateKey] = voteCount;
                        return acc;
                    },
                    {}
                );
                setVoteCountByDate(votesByDate);
            } catch (error) {
                console.error("Chyba při načítání události:", error);
            }
        }
        fetchEvent();
    }, [publicId]);

    useEffect(() => {
        const fetchEventCreator = async () => {
            if (!publicId) return;
            const creatorId = event?.user;
            if (!creatorId) return;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${creatorId}`);
                if (!response.ok) throw new Error("Chyba při načítání tvůrce události");
                const data = await response.json();
                console.log("creator:", data);
                setEventCreator(data);
            } catch (error) {
                console.error("Chyba při tvůrce události:", error);
            }
        }
        fetchEventCreator();
    }, [event?.user, publicId]);

    const isUserSameAsEventCreator = event?.user === userId;
    console.log('hlasovani:', votes);

    return (
        <div className="container mt-5">
            <h1>{event?.title}</h1>
            <p>{event?.description}</p>
            {!isUserSameAsEventCreator &&
                <p>Událost vytvořil/a: {eventCreator}</p>}
            <p><Link to="/dashboard">zpět</Link></p>
            <Calendar
                eventOptions={datesToVote}
                updatedEventDates={updatedDates}
                onVoteChange={(updatedVotes: Vote[]) => setVotes(updatedVotes)}
                showCellRadios={!isUserSameAsEventCreator}
                voteCountByDate={voteCountByDate}
                handleOnClick={handleDateToggle}
            />
            {!isUserSameAsEventCreator ? (
                <form onSubmit={handleSubmit}>
                    <ButtonSubmit
                        text="Uložit moje hlasování"
                        className="my-3"
                    />
                </form>
            ) : (
                <form onSubmit={handleUpdateEvent}>
                    <ButtonSubmit
                        text="Aktualizovat událost"
                        className="my-3"
                    />
                </form>
            )
            }
        </div>
    );
}

export default Event;