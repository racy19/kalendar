import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const Layout = () => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

    return (
        <div className={`d-flex flex-column full-height ${isDarkMode ? "bg-dark-mode" : ""}`}>
            <header className={`${isDarkMode ? "black-dark-mode" : "bg-dark"} text-white p-2`}>
                <Navbar />
            </header>

            <main>
                <Outlet />
            </main>
            <Footer isDarkMode={isDarkMode}/>
        </div>
    );
};

export default Layout;
