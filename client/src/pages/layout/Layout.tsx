import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
    return (
        <div>
            <header className="bg-dark text-white p-2">
                <Navbar />
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
