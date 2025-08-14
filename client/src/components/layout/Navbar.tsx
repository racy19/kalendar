import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { logout } from "../../store/auth/authSlice";
import CalendarIcon from "../UI/icons/CalendarIcon";
import Plus from "../UI/icons/Plus";
import PowerOff from "../UI/icons/PowerOff";

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container d-flex justify-content-between">
                <div className="d-flex align-items-center">
                    <NavLink className="navbar-brand me-lg-5" to="/dashboard">
                        <CalendarIcon color="#FFF" size={40} />
                    </NavLink>

                    <NavLink to="/create-event" className={"me-2"}>
                        <Plus color="#FFF" size={30} />
                    </NavLink>
                    <span className="nav-item d-none d-lg-inline">
                        <NavLink
                            to="/create-event"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " active" : "")
                            }
                        >
                            Vytvořit událost
                        </NavLink>
                    </span>
                </div>


                <span className="navbar-nav ms-auto d-flex flex-row gap-2 align-items-center">
                    {user && (
                        <>
                            <span className="nav-item">
                                Přihlášen: <Link to="/profile" className="link-white">&nbsp;{user.name}</Link>
                            </span>
                        </>
                    )}
                    <span className="nav-item link" onClick={handleLogout}>
                        <PowerOff color="#EEE" size={26} />
                    </span>
                </span>
            </div>
        </nav>
    );
};

export default Navbar;