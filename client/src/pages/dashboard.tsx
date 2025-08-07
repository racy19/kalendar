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

    const fetchEvents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/user/${user.id}`);
        if (!response.ok) throw new Error("Chyba při načítání událostí");
        const data = await response.json();
        console.log("Načtené události:", data);
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
    fetchEvents();

  }, [user?.id]);

  if (!user) return <p>Načítání uživatele...</p>;

  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>
      <p>Vítej {user.name && user.name}!</p>
      <p>Email: {user.email}</p>
      <p><Link to="/profile">upravit profil</Link></p>
      <h3 className="mt-5">Moje události</h3>
      {events.length > 0 ? (
        <ul>
          {events.map(event => {
            const dateString = event.dates.map(date => new Date(date).toLocaleDateString());
            return (
              <li key={event._id}>
                <strong onClick={() => navigate(`/event/${event.publicId}`)}>{event.title} </strong>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => navigate(`/event/${event.publicId}`)}
                >zobrazit</button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(event.publicId)}
                >smazat</button><br />
                {event.description && <span>{event.description}</span>}<br />
                <p className="mt-2"><strong>{dateString.join(", ")}</strong></p>
              </li>
            )
          }
          )}
        </ul>) : <p>Nemáte žádné události.</p>}
      <h3 className="mt-5">Události, kde jsem hlasoval/a</h3>
        <p><Link to="/create-event">vytvořit novou událost</Link></p>
      <button className="btn btn-primary mt-3" onClick={handleLogout}>odhlásit</button>
    </div>
  );
};

export default Dashboard;
