import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
    return (
        <div className="d-flex flex-column full-height">
            <header className="bg-dark text-white p-2">
                <Navbar />
            </header>

            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
