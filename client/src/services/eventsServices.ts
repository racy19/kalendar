import { FetchedEvent, UserResponse } from "../features/event/eventTypes";

export async function submitVotes(publicId: string, userId: string, votes: {date: string; status: string}[]) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${publicId}/vote`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, votes }),
  });
  if (!res.ok) throw new Error("Chyba při ukládání hlasování");
  return res.json();
}

export type UpdateEventPayload = {
  title: string;
  description?: string;
  dates: string[]; // ISO "YYYY-MM-DD"
};

export async function updateEvent(publicId: string, payload: UpdateEventPayload) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${publicId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Chyba při aktualizaci události");
  try { return await res.json(); } catch { return null; }
}

export async function getEvent(publicId: string): Promise<FetchedEvent> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${publicId}`);
  if (!res.ok) throw new Error("Chyba při načítání události");
  return res.json();
}

export async function deleteEvent(eventId: string): Promise<void> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Chyba při mazání události");
  return;
}

export async function getUser(userId: string): Promise<UserResponse> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`);
  if (!res.ok) throw new Error(`Chyba při načítání uživatele ${userId}`);
  return res.json();
}

export async function getUsers(userIds: string[]): Promise<UserResponse[]> {
  const responses = await Promise.all(userIds.map(id => getUser(id)));
  return responses;
}

export async function getUserEvents(userId: string): Promise<FetchedEvent[]> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/user/${userId}`);
  if (!res.ok) throw new Error("Chyba při načítání událostí uživatele");
  return res.json();
}

export async function getParticipantEvent(userId: string): Promise<FetchedEvent[]> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/participant/${userId}`);
  if (!res.ok) throw new Error("Chyba při načítání událostí, kde jste hlasovali");
  return res.json();
}