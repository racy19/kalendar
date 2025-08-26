import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import MoonIcon from "./icons/MoonIcon";
import SunIcon from "./icons/SunIcon";

const ThemeToggler = () => {
    const dispatch = useDispatch();
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

    const handleToggle = () => {
        dispatch({ type: 'theme/toggleTheme' });
    }

    return (
        <>
            {isDarkMode ?
                <MoonIcon onClick={handleToggle} color="#FFF" size={26} className="link" />
                :
                <SunIcon onClick={handleToggle} color="#FFF" size={26} className="link" />
            }
        </>
    )
}

export default ThemeToggler;