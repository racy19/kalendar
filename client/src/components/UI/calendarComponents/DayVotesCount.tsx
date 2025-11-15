import { Tooltip } from "react-tooltip";
import { VoteSummary } from "../../../features/event/eventTypes";
import { useState } from "react";
import Modal from "../Modal";

export type DayVotesCountProps = {
    votesByDate: VoteSummary;
    day: string;
}

// helpers for participant list formatting
const formatParticipant = (participant: { name: string; note: string }) =>
    `<strong>${participant.name}</strong>` + (participant.note?.trim() ? `: ${participant.note}` : "");

const listFor = (arr: { name: string; note: string }[]) =>
    arr.map(formatParticipant).join('<br>');

/**
 * 
 * @param votesByDate is object of voting info (status & participants) for each date
 * @param date is stringified date
 * @returns JSX with YES, NO, MAYBE counts for each date, with tooltip with names of participants on it
 */
const DayVotesCount = ({ votesByDate, day }: DayVotesCountProps) => {
    const votesByDateSize = (Object.keys(votesByDate)).length;
    if (!votesByDateSize) return;
    if (!votesByDate[day]) return;
    const { yes, no, maybe } = votesByDate[day]
    const participantList = {
        yes: listFor(yes.participants),
        no: listFor(no.participants),
        maybe: listFor(maybe.participants),
    }

    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
        <div onClick={() => setModalOpen(true)} className="d-flex justify-content-start flex-column flex-md-row gap-1 gap-md-3 ms-2 cursor-pointer">
            <span
                style={{ color: '#006A38', fontWeight: 'bold', cursor: 'pointer' }}
                data-tooltip-id="participants"
                data-tooltip-html={participantList.yes}
            >
                {yes.count}
            </span>
            <span
                style={{ color: '#D83B3B', fontWeight: 'bold', cursor: 'pointer' }}
                data-tooltip-id="participants"
                data-tooltip-html={participantList.no}
            >
                {no.count}
            </span>
            <span
                style={{ color: '#E68A00', fontWeight: 'bold', cursor: 'pointer' }}
                data-tooltip-id="participants"
                data-tooltip-html={participantList.maybe}
            >
                {maybe.count}
            </span>
        </div>
            <Tooltip
                id="participants"
                place="top"
                style={{ zIndex: 9999 }}
            />
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} >
                <h5>Hlasování k datu {day}</h5>
                <h6 className="mt-3">ANO ({yes.count}):</h6>
                <div dangerouslySetInnerHTML={{ __html: participantList.yes || "" }}></div>
                <h6 className="mt-3">NE ({no.count}):</h6>
                <div dangerouslySetInnerHTML={{ __html: participantList.no || "" }}></div>
                <h6 className="mt-3">MOŽNÁ ({maybe.count}):</h6>
                <div dangerouslySetInnerHTML={{ __html: participantList.maybe || "" }}></div>
            </Modal>
        </>
    );
}

export default DayVotesCount;