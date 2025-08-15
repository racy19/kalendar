import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Calendar from "../../components/Calendar";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import ButtonSubmit from "../../components/UI/ButtonSubmit";
import { EventOption, Vote } from "../../types/types";
import InputText from "../../components/UI/InputText";
import { getDateString } from "../../utils/dateUtils";
import { toggleDate } from "../../utils/calendarUtils";
import { getEvent, getUser, getUsers, submitVotes, updateEvent } from "../../services/events";

const Event = () => {
    const { publicId } = useParams<{ publicId: string }>();
    const [event, setEvent] = useState<any>(null);
    const [eventCreator, setEventCreator] = useState<string>("");

    // pro zmenu nazvu a popisku - jen pro autora udalosti
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

    const [datesToVote, setDatesToVote] = useState<string[]>([]); // calendar prop: pole datumu k hlasovani o udalosti, nacita se z be, pripadne jde aktualizovat pomoci handleUpdateEvent
    const [initialVotes, setInitialVotes] = useState<any[]>([]);
    const [votes, setVotes] = useState<Vote[]>([]); // objekt s vysledky hlasovani votes.date.yes.count nebo votes.date.yes.participants, yes muze byt nahrazeno no nebo maybe, participants je pole jmen hlasujicich pro danou moznost
    const [updatedDates, setUpdatedDates] = useState<string[]>([]); // updated dates od tvurce udalosti k aktualizaci
    const [participantIds, setParticipantIds] = useState<string[]>([]); // id vsech uzivatelu, kteri hlasovali alespon pro jeden termin
    const [participants, setParticipants] = useState<any>(null); // objekt uzivatelu ve tvaru { _id: string, name: string }
    const [userVoteStatus, setUserVoteStatus] = useState<any>([]); // volby aktualne prihlaseneho uzivatele

    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    const { id: userId } = useSelector((state: RootState) => ({
        id: state.auth.user?.id
    }));

    const isUserSameAsEventCreator = event?.userId === userId;

    const handleDateToggle = (date: string) => {
        if (!isUserSameAsEventCreator) return;
        setUpdatedDates(prev => toggleDate(prev, date));
    };

    const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // submit user votes for the event dates (yes, no, maybe)
    const handleSubmitVotes = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (votes.length === 0) {
            alert("Musíte vybrat alespoň jedno datum.");
            return;
        }
        try {
            await submitVotes(publicId ?? "", userId ?? "", votes);
            setSuccessMessage("Vaše hlasování bylo úspěšně uloženo.");
        } catch (error) {
            console.error(error);
            setErrorMessage("Došlo k chybě při ukládání hlasování. Zkuste to prosím znovu.");
        }
    };

    // submit updated event dates (only for event creator)
    const handleUpdateEvent = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!formData.title?.trim()) {
            setErrorMessage("Název události je povinný.");
            return;
        }

        try {
            await updateEvent(publicId ?? "", {
                title: formData.title.trim(),
                description: formData.description?.trim() || "",
                dates: updatedDates,
            });

            setSuccessMessage("Událost byla úspěšně aktualizována.");

            // Sloučí nové datumy bez duplicit
            setDatesToVote(prev => Array.from(new Set([...prev, ...updatedDates])));

            // volitelné: vyčistit “rozpracované” změny
            // setUpdatedDates([]);
        } catch (error) {
            console.error("Chyba při aktualizaci události:", error);
            setErrorMessage("Došlo k chybě při aktualizaci události. Zkuste to prosím znovu.");
        }
    };


    // fetch event
    useEffect(() => {
        const fetchEvent = async () => {
            if (!publicId) return;

            try {
                const { title, description, options, userId } = await getEvent(publicId);

                setEvent((prev: any) => ({ ...prev, title, description, options, userId }));

                setFormData(prev => ({
                    ...prev,
                    title: title ?? "",
                    description: description ?? "",
                }));

                const uniqueUserIds = Array.from(
                    new Set(options.flatMap(opt => opt.votes.map(v => v.userId)))
                );
                setParticipantIds(uniqueUserIds);

                const eventDates = options.map(opt => getDateString(new Date(opt.date)));
                setDatesToVote(eventDates);

            } catch (error) {
                console.error("Chyba při načítání události:", error);
            }
        };

        fetchEvent();
    }, [publicId]);


    // fetch all participants user names -> {_id: name}
    useEffect(() => {
        if (!participantIds.length) return;

        const fetchUserNames = async () => {
            try {
                const usersData = await getUsers(participantIds);

                const participantsRecord: Record<string, string> = {};
                usersData.forEach(user => {
                    participantsRecord[user._id] = user.name || "Neznámý uživatel";
                });

                setParticipants(participantsRecord);
            } catch (error) {
                console.error("Chyba při načítání uživatelů:", error);
            }
        };

        fetchUserNames();
    }, [participantIds.length]);

    // fetch creator user name
    useEffect(() => {
        const creatorId = event?.userId;
        if (!publicId || !creatorId) return;

        const fetchEventCreator = async () => {
            try {
                const user = await getUser(creatorId); // vrací jen jméno (podle tvého API)
                setEventCreator(user.name || "Neznámý uživatel");
            } catch (error) {
                console.error("Chyba při načítání tvůrce události:", error);
            }
        };

        fetchEventCreator();
    }, [publicId, event?.userId]);

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
                            status: voteStatus
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


    return (
        <div className="container mt-3 mt-lg-4">
            <p><Link to="/dashboard">zpět</Link></p>
            <h1>{event?.title}</h1>
            <p>{event?.description}</p>
            {!isUserSameAsEventCreator &&
                <p>Událost vytvořil/a: {eventCreator}</p>}
            {isUserSameAsEventCreator &&
                <>
                    <InputText
                        id="title"
                        label="Nový název události"
                        required={true}
                        value={formData.title}
                        onChange={handleChangeText}
                    />
                    <InputText
                        id="description"
                        label="Nový popis události"
                        required={false}
                        value={formData.description}
                        onChange={handleChangeText}
                    />
                </>
            }
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