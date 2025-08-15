import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Plus from "../components/UI/icons/Plus";
import Pen from "../components/UI/icons/Pen";
import X from "../components/UI/icons/X";
import CalendarIcon from "../components/UI/icons/CalendarIcon";

interface EventOption {
  _id: string;
  date: Date;
  votes: string[];
}

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
}

const Dashboard = () => {
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);

  const [events, setEvents] = useState<Event[]>([]);
  const [votedEvents, setVotedEvents] = useState<Event[]>([]);

  const handleDelete = async (eventId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Mazání selhalo");

      // delete event from state
      setEvents((prev) => prev.filter((e) => e.publicId !== eventId));
    } catch (err) {
      console.error("Chyba při mazání:", err);
    }
  };

  const getMinMaxDate = (dateArray: string[]) => {
    if (!dateArray.length) {
      return { min: null, max: null };
    }

    const dates = dateArray.map(d => new Date(d));

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    return { min: minDate.toLocaleDateString(), max: maxDate.toLocaleDateString() };
  }

  useEffect(() => {
    if (!user?.id) return;

    // Fetch events created by the user
    const fetchCreatorEvents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/user/${user.id}`);
        if (!response.ok) throw new Error("Chyba při načítání událostí");
        const data = await response.json();
        // return only dates of event, not user votes
        const filteredData = data.map((event: FetchedEvent) => {
          return {
            _id: event._id,
            title: event.title,
            description: event.description,
            dates: event.options.map(option => option.date),
            publicId: event.publicId,
          };
        });
        console.log(filteredData)
        setEvents(filteredData);
      } catch (error) {
        console.error("Chyba při načítání událostí:", error);
      }
    }

    // Fetch events where the user has voted
    const fetchVoterEvents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/participant/${user.id}`);
        if (!response.ok) throw new Error("Chyba při načítání událostí, kde jste hlasovali");
        const data = await response.json();
        const filteredData = data.map((event: FetchedEvent) => {
          return {
            _id: event._id,
            title: event.title,
            description: event.description,
            dates: event.options.map(option => option.date),
            publicId: event.publicId,
          };
        });
        setVotedEvents(filteredData);
      } catch (error) {
        console.error("Chyba při načítání událostí, kde jste hlasovali:", error);
      }
    }

    fetchCreatorEvents();
    fetchVoterEvents();
  }, [user?.id]);

  if (!user) return <p>Načítání uživatele...</p>;

  return (
    <div className="container mt-3 mt-lg-4">
      <h1 className="mb-4">Moje události</h1>
      <div className="border rounded bg-light p-3 mb-4">
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
                <div key={event._id} className="card text-dark bg-light mb-3 event-card">
                  <div className="card-header d-flex align-items-center gap-2">
                    <CalendarIcon size={20} color="#777" /><span>{event?.dates?.length && `${getMinMaxDate(event.dates)?.min} - ${getMinMaxDate(event.dates)?.max}`}</span>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
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
                    {event.description && <span className="card-text mt-2">{event.description}</span>}<br />
                  </div>

                  {/* <p className="mt-2"><strong>{dateString.join(", ")}</strong></p> */}
                </div>
              )
            }
            )}
          </div> : <p>Nemáte žádné události.</p>}
      </div>
      <div className="border rounded bg-light p-3 mb-4">

        <h3 className="mt-1 mb-4">Události, kde jsem hlasoval/a</h3>
        {votedEvents.length > 0 ?
          <div className="event-card-container">
            {votedEvents.map(event => {
              return (
                <div key={event._id} className="card text-dark bg-light mb-3 event-card">
                  <div className="card-header d-flex align-items-center gap-2"><CalendarIcon size={20} color="#777" />
                    <span>{event?.dates?.length && `${getMinMaxDate(event.dates)?.min} - ${getMinMaxDate(event.dates)?.max}`}</span>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                      <strong className="card-title" onClick={() => navigate(`/event/${event.publicId}`)}>{event.title} </strong>
                      <span>
                        <span
                          className="link"
                          onClick={() => navigate(`/event/${event.publicId}`)}
                        ><CalendarIcon size={24} color="#0d6efd" /></span>
                      </span>
                    </div>
                    {event.description && <span className="card-text">{event.description}</span>}<br />
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
