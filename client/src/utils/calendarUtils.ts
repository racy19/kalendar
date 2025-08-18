import { eventInfo } from "../features/event/eventTypes";

export const toggleDate = (prev: string[], date: string) =>
  prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date];

export const changeText = (prev: eventInfo, name: string, value: string) => {
  return {
    ...prev,
    [name]: value,
  };
}