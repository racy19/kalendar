import { EventOption, FetchedEvent, Participants, StatusRecord, UserVoteStatus, VoteStatus, VoteSummary } from "../features/event/eventTypes";
/**
 * @description Aggregates votes from event options into a summary and user status.
 * @param options - Array of event options containing dates and votes.
 * @param participants - Record of participant IDs to names.
 * @param currentUserId - ID of the current user to track their vote status.
 * @returns An object containing the aggregated votes summary and user status.
 */
export const aggregateVotesSummary = (
    options: EventOption[],
    participants: Participants,
    currentUserId: string
): { votesSummary: VoteSummary; notesSummary: Record<string, string>, userStatus: UserVoteStatus[] } => {

    const votesSummary: VoteSummary = {};
    const notesSummary: Record<string, string> = {};
    const userStatus: UserVoteStatus[] = [];

    for (const option of options) {
        const date = option.date;
        const summary: StatusRecord =
            votesSummary[date] ??
            (votesSummary[date] = {
                yes: { count: 0, participants: [] },
                no: { count: 0, participants: [] },
                maybe: { count: 0, participants: [] },
            });

        for (const vote of option.votes) {
            const name = participants[vote.userId] ?? "Neznámý uživatel";
            const status = vote.status as VoteStatus;
            const note = vote.note;
            if (note) {
                notesSummary[date] = `${name}: ${note}`;
            }

            summary[status].count += 1;
            summary[status].participants.push(name);

            if (vote.userId === currentUserId) {
                userStatus.push({ date, status: status, note: vote.note || "" });
            }
        }
    }
    console.log('notes', notesSummary);
    console.log('votes summary', votesSummary);
    console.log('user status inside agg', userStatus);
    return { votesSummary, notesSummary, userStatus };
}

// return only dates of event, not user votes
export const aggregateFetchedEvent = (eventData: FetchedEvent[]) => {
    const filteredData = eventData.map((event: FetchedEvent) => {
        return {
            _id: event._id,
            title: event.title,
            description: event.description,
            dates: event.options.map(option => option.date),
            publicId: event.publicId,
            votingParticipantCount: getVotingParticipantsCount(event.options)
        };
    });
    return filteredData;
};


export const getVotingParticipantsCount = (options: EventOption[]): number => {
    const uniqueUserIds = new Set<string>();
    options.forEach(option => {
        option.votes.forEach(vote => {
            uniqueUserIds.add(vote.userId);
        });
    });
    return uniqueUserIds.size;
}

export const getNotesForDate = (date: string, notesSummary: Record<string, string>, showAllNotes: boolean = true): string => {
    if (showAllNotes) {
        console.log('notes summary in get notes', notesSummary);
        if (!notesSummary || !Object.keys(notesSummary).length) return "";
        return Object.entries(notesSummary)
            .filter(([noteDate, _]) => noteDate === date)
            .map(([_, note]) => note)
            .join('<br>');
    } else {
        return notesSummary[date] || "";
    }
}