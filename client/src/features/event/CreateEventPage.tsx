import { useState } from "react";
import ButtonSubmit from "../../components/UI/ButtonSubmit";
import Calendar from "../../components/Calendar";
import InputText from "../../components/UI/InputText";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { toggleDate } from "../../utils/calendarUtils";
import Left from "../../components/UI/icons/Left";

const CreateEvent = () => {
    const navigate = useNavigate();

    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const userId = useSelector((state: RootState) => state.auth.user?.id);

    const handleDateToggle = (date: string) => {
        setSelectedDates(prev => toggleDate(prev, date));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDates.length === 0) {
            setErrorMessage("Musíte vybrat alespoň jedno datum.");
            return;
        } else {
            setErrorMessage("");
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    dates: selectedDates,
                    userId: userId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || "Chyba při vytváření události");
                return;
            }
            setSuccessMessage("Událost byla úspěšně založena.")
        } catch (error) {
            console.error("Chyba při vytváření události:", error);
            setErrorMessage("Chyba při vytváření události");
        }
    }

    return (
        <div className="container mt-3 mt-lg-4">
            <span onClick={() => navigate('/dashboard')} className="link"><Left size={26} color="#3a005f" />zpět</span>
            <h1 className="mt-3">Vytvořit událost</h1>
            <form onSubmit={handleSubmit}>
                <InputText
                    id="title"
                    label="Název události"
                    required={true}
                    onChange={handleChange}
                />
                <InputText
                    id="description"
                    label="Popis události"
                    required={false}
                    onChange={handleChange}
                />
                <p className="mt-5">
                    Vyberte možná data události pomocí kalendáře níže.
                </p>
                <Calendar handleOnClick={handleDateToggle} updatedEventDates={selectedDates} />
                {errorMessage && (
                    <div className="alert alert-danger mt-3">
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="alert alert-success mt-3">
                        {successMessage}
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-success ms-3"
                            onClick={() => navigate('/dashboard')}
                        >
                            zpět na přehled
                        </button>
                    </div>
                )}
                <ButtonSubmit
                    text="Vytvořit událost"
                    className="my-3"
                />
            </form>
        </div>
    );
}

export default CreateEvent;