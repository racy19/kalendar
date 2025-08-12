import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InputText from "../../components/UI/InputText";
import ButtonSubmit from "../../components/UI/ButtonSubmit";
import { RootState } from "../../store/store";

interface UserData {
    name: string;
    email: string;
    authType?: string;
}

const Profile = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const token = useSelector((state: RootState) => state.auth.token);

    const [userData, setUserData] = useState<UserData | null>(null);
    const [userDataFetched, setUserDataFetched] = useState(false);
    const [loading, setLoading] = useState(true);
    const [changeNameForm, setChangeNameForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [renewPasswordMessage, setRenewPasswordMessage] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            if (!user || !token) return;

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/user/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Chyba při načítání uživatele");

                const data = await res.json();
                setUserData(data);
                setUserDataFetched(true);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [user, token]);

    const handleChangeName = async (newName: string) => {
        if (!user || !token || !newName) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/user/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newName }),
            });

            if (!res.ok) throw new Error("Chyba při aktualizaci uživatelského jména");

            const updatedUser = await res.json();
            setUserData(updatedUser);
            setChangeNameForm(false);
            setNewName("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleChangePassword = async () => {
        if (!user || !token) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/user/${user.id}/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setRenewPasswordMessage(data.error || "Chyba při změně hesla");
            } else {
                setRenewPasswordMessage(data.message);
                setCurrentPassword("");
                setNewPassword("");
            }
        } catch (err) {
            console.error(err);
            setRenewPasswordMessage("Chyba při odeslání požadavku");
        }
    };

    return (
        <div className="profile-container container mt-5">
            <h1>Profil uživatele</h1>

            <div className="d-flex gap-2">
                <p>Email:</p>
                {loading && <p>načítám...</p>}
                {userData && <p>{userData.email}</p>}
            </div>

            <div className="d-flex gap-2 align-items-center">
                <p>Uživatelské jméno:</p>
                {loading && <p>načítám...</p>}
                {userData && (
                    <p>
                        {userData.name || "--"}{" "}
                        <a href="#" onClick={(e) => { e.preventDefault(); setChangeNameForm(prev => !prev); }}>
                            {changeNameForm ? "zrušit" : "upravit"}
                        </a>
                    </p>
                )}
            </div>

            {changeNameForm && (
                <>
                    <InputText
                        id="name"
                        label="Nové uživatelské jméno"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <button className="btn btn-primary mt-2" onClick={() => handleChangeName(newName)}>
                        Uložit
                    </button>
                </>
            )}

            {userDataFetched && userData?.authType !== 'google' && (
                <div id="password-change">
                    <h2 className="mt-5">Změnit heslo</h2>
                    <InputText
                        id="password"
                        type="password"
                        label="Aktuální heslo"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <InputText
                        id="newPassword"
                        type="password"
                        label="Nové heslo"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <ButtonSubmit text="Změnit heslo" onClick={handleChangePassword} />

                    {renewPasswordMessage && (
                        <div className="alert alert-info mt-3">{renewPasswordMessage}</div>
                    )}
                </div>
            )}


        </div>
    );
};

export default Profile;
