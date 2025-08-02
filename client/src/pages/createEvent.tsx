import { useState } from "react";
import ButtonSubmit from "../components/ButtonSubmit";
import Calendar from "../components/Calendar";
import InputText from "../components/InputText";

const CreateEvent = () => {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    const handleDateToggle = (date: Date) => {
        setSelectedDates(prevDate =>
            prevDate.includes(date)
                ? prevDate.filter(d => d.getTime() !== date.getTime())
                : [...prevDate, date]
        );
    };

    return (
        <div className="container mt-5">
            <h1>Vytvořit událost</h1>
            <InputText
                id="eventTitle"
                label="Název události"
                required={true}
            />
            <InputText
                id="eventDescription"
                label="Popis události"
                required={false}
            />
            <p className="mt-5">
                Vyberte datum a čas události pomocí kalendáře níže.
            </p>
            <Calendar handleOnClick={handleDateToggle} selectedDates={selectedDates}/>
            <ButtonSubmit
                text="Vytvořit událost"
            />
        </div>
    );
}

export default CreateEvent;