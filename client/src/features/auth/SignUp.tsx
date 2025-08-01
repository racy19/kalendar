import { useState } from "react";
import InputText from "../../components/InputText"
import { Link } from "react-router-dom";
import ButtonSubmit from "../../components/ButtonSubmit";

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [sucessSignUp, setSucessSignUp] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.username,
                    email: formData.email,
                    authType: "local",
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || "Chyba při registraci");
                return;
              }

            if (response.ok) {
                console.log("Uživatel vytvořen:", data.user);
                setSucessSignUp(true);
                // např. přesměrování nebo zobrazení hlášky
            } else if (response.status === 409) {
                const error = await response.json();
                setErrorMessage("Uživatel už existuje: " + error.error);
            } else {
                const error = await response.json();
                setErrorMessage("Chyba: " + error.error);
            }
        } catch (err) {
            console.error("Chyba při připojení k serveru:", err);
            setErrorMessage("Chyba při odesílání dat.");
        }
    };

    return (
        <div className="login-page-container mt-5">
            <h1>Registrace</h1>
            <form onSubmit={handleSubmit} className="p-4 border rounded bg-light">
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
                {errorMessage && (
                        <div className="alert alert-danger mt-3">
                            {errorMessage}
                            {errorMessage.includes("Google") && <> <Link to="/login">Přihlásit</Link></>}
                        </div>
                    )}
                {sucessSignUp && <p className="mt-3">Registrace proběhla úspěšně! <Link to="/login">Přihlásit</Link></p>}
            </form>
        </div>
    )
}

export default SignUp;