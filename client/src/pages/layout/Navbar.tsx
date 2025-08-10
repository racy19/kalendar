import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useState } from "react";
import { logout } from "../../store/authSlice";

const Navbar = () => {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <NavLink className="navbar-brand" to="/dashboard">
                    Kalendář App
                </NavLink>

                {/* Hamburger button */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    aria-controls="navbarNav"
                    aria-expanded={expanded}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className={`collapse navbar-collapse ${expanded ? "show" : ""}`}
                    id="navbarNav"
                >
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                        </li>
                        {/* <li className="nav-item">
                            <NavLink
                                to="/calendar"
                                className={({ isActive }) =>
                                    "nav-link" + (isActive ? " active" : "")
                                }
                                onClick={() => setExpanded(false)}
                            >
                                Kalendář
                            </NavLink>
                        </li> */}
                        <li className="nav-item">
                            <NavLink
                                to="/create-event"
                                className={({ isActive }) =>
                                    "nav-link" + (isActive ? " active" : "")
                                }
                                onClick={() => setExpanded(false)}
                            >
                                Vytvořit událost
                            </NavLink>
                        </li>
                    </ul>

                    <ul className="navbar-nav ms-auto">
                        {user && (
                            <li className="nav-item d-flex align-items-center text-white me-3">
                                Přihlášen: <Link to="/profile" className="link-white">&nbsp;{user.name}</Link>
                            </li>
                        )}
                        <li className="nav-item">
                            <button className="btn btn-outline-light" onClick={handleLogout}>
                                Odhlásit se
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;