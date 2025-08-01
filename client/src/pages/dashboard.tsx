import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    const handleLogout = () => {
      dispatch(logout());
      navigate("/login");
    };
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) return <p>Načítání uživatele...</p>;
  console.log("Uživatel:", user);

  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>
      <p>Vítej {user.name && user.name}!</p>
      <p>Email: {user.email}</p>
      <p><Link to="/profile">upravit profil</Link></p>
      <button className="btn btn-success mt-3" onClick={() => navigate("/calendar")}>jít na kalendář</button><br />
      <button className="btn btn-primary mt-3" onClick={handleLogout}>odhlásit</button>
    </div>
  );
};

export default Dashboard;
