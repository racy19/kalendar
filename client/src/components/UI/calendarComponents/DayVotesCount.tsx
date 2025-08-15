import { Tooltip } from "react-tooltip";
import { VoteRecord } from "../../../types/types";

export type DayVotesCountProps = {
    votesByDate: VoteRecord;
    day: string;
}

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
            yes: yes.participants.join('<br>'),
            no: no.participants.join('<br>'),
            maybe: maybe.participants.join('<br>'),
        }
    return (
            <>
                <span
                    style={{ color: '#00A000', fontWeight: 'bold' }}
                    data-tooltip-id="participants"
                    data-tooltip-html={participantList.yes}
                >
                    {yes.count}
                </span>
                <span
                    style={{ color: '#B22222', fontWeight: 'bold' }}
                    data-tooltip-id="participants"
                    data-tooltip-html={participantList.no}
                >
                    {no.count}
                </span>
                <span
                    style={{ color: '#FFA500', fontWeight: 'bold' }}
                    data-tooltip-id="participants"
                    data-tooltip-html={participantList.maybe}
                >
                    {maybe.count}
                </span>
                <Tooltip
                    id="participants"
                    place="top"
                    style={{ zIndex: 9999 }}
                />
            </>
        );
}

export default DayVotesCount;