import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { useEffect, useState } from "react";

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
  user: string;
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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);

  const [events, setEvents] = useState<Event[]>([]);
  const [votedEvents, setVotedEvents] = useState<Event[]>([]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleDelete = async (eventId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Mazání selhalo");

      // delete event from state
      console.log("Událost s ID", eventId, "byla úspěšně smazána.");
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/user/${user.id}`);
        if (!response.ok) throw new Error("Chyba při načítání událostí");
        const data = await response.json();
        console.log("Načtené události:", JSON.stringify(data));
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
        console.log("Načtené události, kde jste hlasovali:", JSON.stringify(data));
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
    <div className="container mt-5">
      <h1>Moje události</h1>
      <p>
        Vítej {user.name && user.name}!
        <button
          className="btn btn-sm btn-outline-primary ms-2"
          onClick={() => navigate(`/profile`)}
        >upravit profil</button>
        <button className="btn btn-sm btn-primary ms-2" onClick={handleLogout}>odhlásit</button>
      </p>
      <div className="border rounded bg-light p-3 mb-4">
        <h3 className="mt-3 mb-5">Vytvořené události</h3>
        {events.length > 0 ? (
          <ul>
            {events.map(event => {
              // const dateString = event.dates.map(date => new Date(date).toLocaleDateString());
              return (
                <li key={event._id} className="mb-3">
                  <strong onClick={() => navigate(`/event/${event.publicId}`)}>{event.title} </strong>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => navigate(`/event/${event.publicId}`)}
                  >zobrazit/upravit</button>
                  <button
                    className="btn btn-sm ms-2 btn-danger"
                    onClick={() => handleDelete(event.publicId)}
                  >smazat</button><br />
                  {event.description && <span>{event.description}</span>}<br />
                  {/* <p className="mt-2"><strong>{dateString.join(", ")}</strong></p> */}
                </li>
              )
            }
            )}
          </ul>) : <p>Nemáte žádné události.</p>}
        <p><Link to="/create-event">vytvořit novou událost</Link></p>
      </div>
      <div className="border rounded bg-light p-3 mb-4">

        <h3 className="mt-3 mb-5">Události, kde jsem hlasoval/a</h3>
        <ul>
          {votedEvents.length > 0 ? (
            votedEvents.map(event => {
              // const dateString = event.dates.map(date => new Date(date).toLocaleDateString());
              return (
                <li key={event._id} className="mb-3">
                  <strong onClick={() => navigate(`/event/${event.publicId}`)}>{event.title} </strong>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => navigate(`/event/${event.publicId}`)}
                  >zobrazit</button><br />
                  {event.description && <span>{event.description}</span>}<br />
                  {/* <p className="mt-2"><strong>{dateString.join(", ")}</strong></p> */}
                </li>
              )
            })
          ) : <p>Nehlasoval/a jste v žádné události.</p>}
        </ul>
      </div>

    </div>
  );
};

export default Dashboard;
