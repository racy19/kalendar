import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { useEffect, useState } from "react";

interface Event {
  _id: string;
  title: string;
  description?: string;
  dates: string[];
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

      // Odeber událost z UI
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
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
        setEvents(data);
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
      <h3 className="mt-5">Vaše události</h3>
      {events.length > 0 ? (
        <ul>
          {events.map(event => {
            const dateString = event.dates.map(date => new Date(date).toLocaleDateString());
            return (
              <li key={event._id}>
                <strong>{event.title} </strong><button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(event._id)}
                >smazat</button><br />
                {event.description && <span>{event.description}</span>}<br />
                <p className="mt-2"><strong>{dateString.join(", ")}</strong></p>
              </li>
            )
          }
          )}
        </ul>) : <p>Nemáte žádné události.</p>}
        <p><Link to="/create-event">vytvořit novou událost</Link></p>
      <button className="btn btn-primary mt-3" onClick={handleLogout}>odhlásit</button>
    </div>
  );
};

export default Dashboard;
