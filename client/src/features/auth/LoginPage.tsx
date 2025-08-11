import { useState } from "react";
import InputText from "../../components/UI/InputText";
import ButtonSubmit from "../../components/UI/ButtonSubmit";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { login } from '../../store/auth/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loginSuccess, setLoginSuccess] = useState(false);
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || "Chyba při přihlášení");
                return;
            }
            if (response.ok) {
                console.log("Přihlášení úspěšné:", data);
                setLoginSuccess(true);
                dispatch(
                    login({
                        user: {
                            id: data.user.id,
                            name: data.user.name,
                            email: data.user.email,
                        },
                        token: data.token,
                    })
                );
                const pathToRedirect = sessionStorage.getItem('redirectAfterLogin');
                const redirectUrl = pathToRedirect?.includes('login') ? '/dashboard' : pathToRedirect || '/dashboard';
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(redirectUrl);
            } else if (response.status === 401) {
                console.error("Chyba při přihlášení:", data);
                setErrorMessage("Neplatný email nebo heslo.");
            } else {
                setErrorMessage("Chyba při přihlášení: " + (data.error || "Neznámá chyba"));
            }
        } catch (err) {
            console.error("Chyba při připojení k serveru:", err);
            setErrorMessage("Chyba při odesílání dat na server, zkuste to později.");
        }
    };

    const handleGoogleLogin = async (googleToken: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ credential: googleToken }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Google login error:", data.error);
                setErrorMessage(data.error || "Chyba při přihlášení přes Google.");
                return;
            }
            if (res.ok) {
                dispatch(login({
                    user: {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                    },
                    token: data.token,
                }));
                const pathToRedirect = sessionStorage.getItem('redirectAfterLogin');
                const redirectUrl = pathToRedirect?.includes('login') ? '/dashboard' : pathToRedirect || '/dashboard';
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(redirectUrl);
            } else {
                console.error("Google login error:", data.error);
            }
        } catch (err) {
            console.error("Chyba při přihlášení přes Google:", err);
        }
    };


    return (
        <div className="login-page-container mt-5">
            <h1 className="d-flex justify-content-between align-items-baseline">
                <span>Přihlášení</span>
                <span className="text-muted small">Kalendář App</span>
            </h1>
            <form onSubmit={handleSubmit} className="border rounded bg-light login-form-container">
                <div className="login-form p-4">
                    <InputText
                        id="email"
                        type="email"
                        label="Email"
                        required={true}
                        onChange={handleChange}
                    />
                    <InputText
                        id="password"
                        type="password"
                        label="Heslo"
                        required={true}
                        onChange={handleChange}
                    />
                    <ButtonSubmit text="Přihlásit" />
                    {errorMessage && (
                        <div className="alert alert-danger mt-3">
                            {errorMessage}
                        </div>
                    )}
                    {loginSuccess && <p className="mt-3 text-success">Přihlášení proběhlo úspěšně!</p>}
                    <p className="mt-3"                    >
                        Zapomenuté heslo = smůla
                        <sup
                            className="border rounded py-0 px-1"
                            data-tooltip-id="forgot-password-tooltip"
                            data-tooltip-content="Vývojářka této stránky je líná a zatím nevytvořila utilitu pro obnovu hesla. V případě velkého zájmu o změnu hesla ji kontaktujte.">
                            ?
                        </sup>
                    </p>
                    <Tooltip
                        id="forgot-password-tooltip"
                        place="top"
                    />
                    <p className="mt-4 mb-0">Nemáte ještě účet? <Link to="/signup">Registrujte</Link> se.</p>
                </div>
                <div className="p-4 d-flex flex-column align-items-center justify-content-center">
                    <GoogleLogin
                        onSuccess={(credentialResponse) => {
                            if (credentialResponse.credential) {
                                // send credential to your backend for verification
                                handleGoogleLogin(credentialResponse.credential);
                            }
                        }}
                        onError={() => {
                            console.error('Google přihlášení selhalo');
                        }}
                    />
                </div>
            </form>
        </div>
    );
};

export default Login;
