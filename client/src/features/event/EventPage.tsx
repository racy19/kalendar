import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Calendar from "../../components/Calendar";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ButtonSubmit from "../../components/UI/ButtonSubmit";
import { EventOption, Vote } from "../../types/types";

const Event = () => {
    const { publicId } = useParams<{ publicId: string }>();
    const [event, setEvent] = useState<any>(null);
    const [eventCreator, setEventCreator] = useState<string>("");

    const [datesToVote, setDatesToVote] = useState<Date[]>([]); // calendar prop: pole datumu k hlasovani o udalosti, nacita se z be, pripadne jde aktualizovat pomoci handleUpdateEvent
    const [initialVotes, setInitialVotes] = useState<any[]>([]);
    const [votes, setVotes] = useState<any[]>([]); // objekt s vysledky hlasovani votes.date.yes.count nebo votes.date.yes.participants, yes muze byt nahrazeno no nebo maybe, participants je pole jmen hlasujicich pro danou moznost
    const [updatedDates, setUpdatedDates] = useState<Date[]>([]); // updated dates od tvurce udalosti k aktualizaci
    const [participantIds, setParticipantIds] = useState<string[]>([]); // id vsech uzivatelu, kteri hlasovali alespon pro jeden termin
    const [participants, setParticipants] = useState<any>(null); // objekt uzivatelu ve tvaru { _id: string, name: string }
    const [userVoteStatus, setUserVoteStatus] = useState<any>([]); // volby aktualne prihlaseneho uzivatele

    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

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
            setSuccessMessage("Vaše hlasování bylo úspěšně uloženo.");
        } catch (error) {
            console.error("Chyba při ukládání hlasování:", error);
            setErrorMessage("Došlo k chybě při ukládání hlasování. Zkuste to prosím znovu.")
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
            setSuccessMessage("Událost byla úspěšně aktualizována.")
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
                const eventDates = options.map((option: EventOption) => new Date(option.date));
                setDatesToVote(eventDates);

            } catch (error) {
                console.error("Chyba při načítání události:", error);
            }
        }
        fetchEvent();
    }, [publicId]);


    // fetch all participants user names -> {_id: name}
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
            const eventVotes: any = {};
            const userStatus: any = [];

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

                    // array with { date, status } for each date for logged user - to show in calendar as a previously picked status
                    if (vote.userId === userId) {
                        const userDateStatus = {
                            date: date,
                            vote: voteStatus
                        }
                        userStatus.push(userDateStatus);
                    }
                })
            })
            setVotes(eventVotes);
            setInitialVotes(eventVotes);
            setUserVoteStatus(userStatus);
        }
    }, [event, participants])


    console.log(JSON.stringify(userVoteStatus))

    return (
        <div className="container mt-3 mt-lg-4">
            <h1>{event?.title}</h1>
            <p>{event?.description}</p>
            {!isUserSameAsEventCreator &&
                <p>Událost vytvořil/a: {eventCreator}</p>}
            <p><Link to="/dashboard">zpět</Link></p>
            <Calendar
                eventDates={datesToVote}
                updatedEventDates={updatedDates}
                onVoteChange={(updatedVotes: Vote[]) => setVotes(updatedVotes)}
                showCellRadios={!isUserSameAsEventCreator}
                votesByDate={initialVotes}
                handleOnClick={handleDateToggle}
                userVoteStatus={userVoteStatus}
            />
            {errorMessage && (
                <div className="alert alert-danger mt-3">
                    {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className="alert alert-success mt-3">
                    {successMessage}
                </div>
            )}
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