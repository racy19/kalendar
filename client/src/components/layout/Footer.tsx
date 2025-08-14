import CalendarIcon from "../UI/icons/CalendarIcon";

const Footer = () => {
    return (
        <div className="bg-dark text-white p-3 d-flex align-items-center gap-2 justify-content-center mt-auto">
            <CalendarIcon size={20} color="#FFF" /> Kalendář App
        </div>
    )
}

export default Footer;