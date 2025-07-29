import { useState } from "react";
import InputText from "../../components/InputText"
import ButtonSubmit from "../../components/buttonSubmit";

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [sucessSignUp, setSucessSignUp] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    // name: formData.username,
                    email: formData.email,
                    authType: "local", // nebo nechat undefined
                    passwordHash: formData.password, // bude zahashováno na serveru
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Uživatel vytvořen:", data.user);
                setSucessSignUp(true);
                // např. přesměrování nebo zobrazení hlášky
            } else if (response.status === 409) {
                const error = await response.json();
                alert("Uživatel už existuje: " + error.error);
            } else {
                const error = await response.json();
                alert("Chyba: " + error.error);
            }
        } catch (err) {
            console.error("Chyba při připojení k serveru:", err);
            alert("Chyba při odesílání dat.");
        }
    };

    return (
        <>
            <h1>Registrace</h1>
            <form onSubmit={handleSubmit}>
                {/* zkontrolovat, zda api umoznuje ukladat username */}
                <InputText
                    id="username"
                    label="Uživatelské jméno"
                    required={false}
                />
                <InputText
                    id="email"
                    type="email"
                    label="Email"
                    required={true}
                    onChange={handleChange}
                    placeholder="abc@example.com"
                />
                <InputText
                    id="password"
                    type="password"
                    label="Heslo"
                    required={true}
                    onChange={handleChange}
                />
                <ButtonSubmit
                    text="Registrovat"
                />
            </form>
            {sucessSignUp && <p>Registrace proběhla úspěšně!</p>}
        </>
    )
}

export default SignUp;