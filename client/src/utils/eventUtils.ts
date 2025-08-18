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
): { votesSummary: VoteSummary; userStatus: UserVoteStatus[] } => {

    const votesSummary: VoteSummary = {};
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

            summary[status].count += 1;
            summary[status].participants.push(name);

            if (vote.userId === currentUserId) {
                userStatus.push({ date, status: status });
            }
        }
    }
    return { votesSummary, userStatus };
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