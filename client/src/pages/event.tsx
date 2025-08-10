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
    
    // calendar prop: pole datumu k hlasovani o udalosti, nacita se z be, pripadne jde aktualizovat pomoci handleUpdateEvent
    const [datesToVote, setDatesToVote] = useState<Date[]>([]);

    // objekt s vysledky hlasovani votes.date.yes.count nebo votes.date.yes.participants, yes muze byt nahrazeno no nebo maybe, participants je pole jmen hlasujicich pro danou moznost
    const [votes, setVotes] = useState<any[]>([]);

    // toto asi predelam a nebude pak potreba
    const [, setVoteCountByDate] = useState<any>(null);

    const [initialVotes, setInitialVotes] = useState<any>(null);

    // updated dates od tvurce udalosti k aktualizaci
    const [updatedDates, setUpdatedDates] = useState<Date[]>([]);

    // id vsech uzivatelu, kteri hlasovali alespon pro jeden termin
    const [participantIds, setParticipantIds] = useState<string[]>([]);

    // objekt uzivatelu ve tvaru { _id: string, name: string }
    const [participants, setParticipants] = useState<any>(null);

    const { id: userId } = useSelector((state: RootState) => ({
        id: state.auth.user?.id
    }));

    const isUserSameAsEventCreator = event?.userId === userId;

    const handleDateToggle = (date: Date) => {
        if (isUserSameAsEventCreator) {
            setUpdatedDates(prevDates =>
                prevDates.includes(date)
                    ? prevDates.filter(d => d.getTime() !== date.getTime())
                    : [...prevDates, date]
            );
        }
    }

    // submit user votes for the event dates (yes, no, maybe)
    const handleSubmitVotes = async (e?: React.FormEvent) => {
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

            // const data = await response.json();

            // toto predelat neukazuje to spravne
            // setVoteCountByDate((prev: any) => {
            //     const updatedVoteCount = { ...prev };
            //     votes.forEach(vote => {
            //         const dateKey = new Date(vote.date).toISOString();
            //         if (!updatedVoteCount[dateKey]) {
            //             updatedVoteCount[dateKey] = { yes: 0, no: 0, maybe: 0 };
            //         }
            //         if (vote.vote === "yes") updatedVoteCount[dateKey].yes++;
            //         else if (vote.vote === "no") updatedVoteCount[dateKey].no++;
            //         else if (vote.vote === "maybe") updatedVoteCount[dateKey].maybe++;
            //     });
            //     return updatedVoteCount;
            // });
            // --------------------------------------
            alert("Vaše hlasování bylo úspěšně uloženo.");
        } catch (error) {
            console.error("Chyba při ukládání hlasování:", error);
            alert("Došlo k chybě při ukládání hlasování. Zkuste to prosím znovu.");
        }
    }

    // submit updated event dates (only for event creator)
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
            // const data = await response.json();
            alert("Událost byla úspěšně aktualizována.");
            setDatesToVote(prev => [...prev, ...updatedDates]); // update local state with new dates
        } catch (error) {
            console.error("Chyba při aktualizaci události:", error);
            alert("Došlo k chybě při aktualizaci události. Zkuste to prosím znovu.");
            return;
        }
    }

    // fetch event
    useEffect(() => {
        const fetchEvent = async () => {
            if (!publicId) return;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${publicId}`);
                if (!response.ok)
                    throw new Error("Chyba při načítání události");
                const data = await response.json();

                // destructure only the necessary fields from the db
                const {
                    title,
                    description,
                    options, // [ { date: Date, votes: [{ userId: string, status: string}] } ]
                    userId // creator ID
                } = data;

                setEvent((prev: any) => ({
                    ...prev,
                    title,
                    description,
                    options,
                    userId
                }));

                // get all participant user Ids
                const userIds: string = options.flatMap((option: EventOption) => option.votes.map((vote: any) => vote.userId));
                const uniqueUserIds = [...new Set(userIds)];
                setParticipantIds(uniqueUserIds);

                // set dates to vote
                const optionDates = options.map((option: EventOption) => new Date(option.date));
                setDatesToVote(optionDates);

                const votesByDate = options.reduce(
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

    // const participants: Record<string, string> = {}

    // fetch all participants user names ->
    // {_id: name}
    useEffect(() => {
        if (participantIds.length === 0) return;
        const fetchUserNames = async () => {
            try {
                const responses = await Promise.all(participantIds.map(id =>
                    fetch(`${import.meta.env.VITE_API_URL}/users/${id}`)
                ));
                const usersData = await Promise.all(responses.map(res => res.json()));
                const participantsRecord: any = {}
                usersData.map((user: any) => {
                    participantsRecord[user._id] = user.name || "Neznámý uživatel";
                });
                setParticipants(participantsRecord)
            } catch (error) {
                console.error("Chyba při načítání uživatelů:", error);
            }
        }
        fetchUserNames();

    }, [participantIds?.length]);

    // fetch creator user name
    useEffect(() => {
        const fetchEventCreator = async () => {
            if (!publicId) return;
            const creatorId = event?.userId;
            if (!creatorId) return;
            try {
                // this fetch returns only user name, prevent fetching private data
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${creatorId}`);
                if (!response.ok)
                    throw new Error("Chyba při načítání tvůrce události");
                const data = await response.json();

                setEventCreator(data.name);
            } catch (error) {
                console.error("Chyba při tvůrce události:", error);
            }
        }
        fetchEventCreator();
    }, [event]);

    // load vote information
    // - initialVotes object key = date
    // - initialVotes.date.yes.count = number of 'yes' votes to given date ('no', 'maybe' analogically)
    // - initialVotes.date.yes.participants = array of usernames voting for 'yes'
    useEffect(() => {
        if (event && participants) {
            const options = event.options;
            // initialize event votes record
            const eventVotes:any = {};

            options.map((option: EventOption) => {
                const date = option.date;

                // initialize event votes to specific date
                eventVotes[date] = { 
                    yes: { count: 0, participants: [] }, 
                    no: { count: 0, participants: [] }, 
                    maybe: { count: 0, participants: [] } 
                };

                option.votes.map((vote: any) => {
                    const voteStatus = vote.status;

                    if (eventVotes[date][voteStatus]) {
                        eventVotes[date][voteStatus].count++;
                        eventVotes[date][voteStatus].participants.push(participants[vote.userId]);
                    }
                })
            })

            setInitialVotes(eventVotes)
        }
    }, [event, participants])

    return (
        <div className="container mt-3 mt-lg-4">
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
                votesByDate={votes}
                handleOnClick={handleDateToggle}
                initialVotes={initialVotes}
            />
            {!isUserSameAsEventCreator ? (
                <form onSubmit={handleSubmitVotes}>
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