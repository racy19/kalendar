import { UserData } from "../features/profile/userTypes";
import { apiFetch } from "./apiFetch";

export const getUserData = async (userId: string, token: string): Promise<UserData> => {
    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/auth/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Chyba při načítání uživatele");

    return res.json();
}

export const changeUserName = async (userId: string, newName: string, token: string): Promise<UserData> => {
    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/auth/user/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
    });

    if (!res.ok) throw new Error("Chyba při aktualizaci uživatelského jména");

    return res.json();
}

export const changeUserPassword = async (userId: string, currentPassword: string, newPassword: string, token: string): Promise<{ message: string }> => {
    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/auth/user/${userId}/password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) throw new Error("Chyba při změně hesla");

    return res.json();
}