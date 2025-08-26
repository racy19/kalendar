import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Plus from "../components/UI/icons/Plus";
import Pen from "../components/UI/icons/Pen";
import X from "../components/UI/icons/X";
import CalendarIcon from "../components/UI/icons/CalendarIcon";
import { aggregateFetchedEvent } from "../utils/eventUtils";
import { EventOption } from "../features/event/eventTypes";
import { deleteEvent, getParticipantEvent, getUserEvents } from "../services/eventsServices";
import { getMinMaxDate } from "../utils/dateUtils";

interface FetchedEvent {
  _id: string;
  title: string;
  description?: string;
  options: EventOption[];
  userId: string;
  publicId: string
}

interface Event {
  _id: string;
  title: string;
  description?: string;
  dates: string[];
  publicId: string;
  votingParticipantCount?: number; // optional, only for voted events
}

const Dashboard = () => {
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const [events, setEvents] = useState<Event[]>([]);
  const [votedEvents, setVotedEvents] = useState<Event[]>([]);

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);

      // delete event from state
      setEvents((prev) => prev.filter((e) => e.publicId !== eventId));
    } catch (err) {
      console.error("Chyba při mazání:", err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    // Fetch events created by the user
    const fetchCreatorEvents = async () => {
      try {
        const userEvents = await getUserEvents(user.id);
        const filteredData = aggregateFetchedEvent(userEvents as FetchedEvent[]);
        setEvents(filteredData);
      } catch (error) {
        console.error("Chyba při načítání událostí:", error);
      }
    }

    // Fetch events where the user has voted
    const fetchVoterEvents = async () => {
      try {
        const participantEvents = await getParticipantEvent(user.id);
        const filteredData = aggregateFetchedEvent(participantEvents as FetchedEvent[]);
        setVotedEvents(filteredData);
      } catch (error) {
        console.error("Chyba při načítání událostí, kde jste hlasovali:", error);
      }
    }

    fetchVoterEvents();
    fetchCreatorEvents();
  }, [user?.id]);

  if (!user) return <p>Načítání uživatele...</p>;

  return (
    <div className="container mt-3 mt-lg-4">
      <h1 className="mb-4">Moje události</h1>
      <div className={`${isDarkMode ? "bg-dark-mode-light" : "border rounded bg-light"} p-3 mb-4`}>
        <h3 className="mt-1 mb-4 d-flex justify-content-between">
          <span>Vytvořené události</span>
          <span className="link" onClick={() => navigate(`/create-event`)}>
            <Plus
              size={36}
              color="#198754"
            />
          </span>

        </h3>
        {events.length > 0 ?
          <div className="event-card-container">
            {events.map(event => {
              // const dateString = event.dates.map(date => new Date(date).toLocaleDateString());
              return (
                <div key={event._id} 
                className={`card ${isDarkMode ? "bg-dark-mode no-border" : "text-dark bg-light"} event-card`}>
                  <div className={`card-header d-flex align-items-center gap-2 ${isDarkMode ? "no-border" : ""}`}>
                    <CalendarIcon size={20} color="#777" /><span>{event?.dates?.length && `${getMinMaxDate(event.dates)?.min} - ${getMinMaxDate(event.dates)?.max}`}</span>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between">
                      <strong className="card-title" onClick={() => navigate(`/event/${event.publicId}`)}>{event.title} </strong>
                      <span className="d-flex">
                        <span
                          className="link"
                          onClick={() => navigate(`/event/${event.publicId}`)}
                        ><Pen size={24} color="#198754" /></span>
                        <span
                          className="link"
                          style={{ marginTop: "1px" }}
                          onClick={() => handleDelete(event.publicId)}
                        ><X size={24} color="#dc3545" /></span>
                      </span>
                    </div>
                    {event.description && <p className="card-text mt-2">{event.description}</p>}
                    <p className={`mb-0 mt-auto text-end small ${isDarkMode ? "" : "text-muted"}`}>Zatím hlasovalo: {event.votingParticipantCount}</p>
                  </div>

                  {/* <p className="mt-2"><strong>{dateString.join(", ")}</strong></p> */}
                </div>
              )
            }
            )}
          </div> : <p>Nemáte žádné události.</p>}
      </div>
      <div className={`${isDarkMode ? "bg-dark-mode-light" : "border rounded bg-light"} p-3 mb-4`}>
        <h3 className="mt-1 mb-4">Události, kde jsem hlasoval/a</h3>
        {votedEvents.length > 0 ?
          <div className="event-card-container">
            {votedEvents.map(event => {
              return (
                <div key={event._id} 
                className={`card ${isDarkMode ? "bg-dark-mode no-border" : "text-dark bg-light"} event-card`}>
                  <div className={`card-header d-flex align-items-center gap-2 ${isDarkMode ? "no-border" : ""}`}><CalendarIcon size={20} color="#777" />
                    <span>{event?.dates?.length && `${getMinMaxDate(event.dates)?.min} - ${getMinMaxDate(event.dates)?.max}`}</span>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between">
                      <strong className="card-title" onClick={() => navigate(`/event/${event.publicId}`)}>{event.title} </strong>
                      <span>
                        <span
                          className="link"
                          onClick={() => navigate(`/event/${event.publicId}`)}
                        ><CalendarIcon size={24} color="#0d6efd" /></span>
                      </span>
                    </div>
                    {event.description && <p className="card-text">{event.description}</p>}
                    <p className={`mb-0 mt-auto text-end small ${isDarkMode ? "" : "text-muted"}`}>Zatím hlasovalo: {event.votingParticipantCount}</p>
                  </div>
                </div>
              )
            })}
          </div>
          : <p>Nehlasoval/a jste v žádné události.</p>}
      </div>
    </div>
  );
};

export default Dashboard;
