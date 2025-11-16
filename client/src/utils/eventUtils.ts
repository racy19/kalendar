import { EventOption, FetchedEvent, Participants, StatusRecord, UserVoteStatus, VoteStatus, VoteSummary } from "../features/event/eventTypes";

function computeAttendanceRate(
    counts: { yes: number; no: number; maybe: number },
    weights = { yes: 0.8, maybe: 0.2 },
    userCount?: number
): number {
    const expected =
        counts.yes * weights.yes +
        counts.maybe * weights.maybe;

    const total = userCount ? userCount : counts.yes + counts.no + counts.maybe;
    return total ? expected / total : 0;
}

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
    currentUserId: string,
    votingUserCount?: number
): {
    votesSummary: VoteSummary;
    notesSummary: Record<string, string[]> | {};
    userStatus: UserVoteStatus[];
} => {
    const votesSummary: VoteSummary = {};
    const notesSummary: Record<string, string[]> = {};
    const userStatus: UserVoteStatus[] = [];

    const weights = { yes: 0.8, maybe: 0.2 };

    for (const option of options) {
        const date = option.date;

        const summary: StatusRecord =
            votesSummary[date] ??
            (votesSummary[date] = {
                yes: { count: 0, participants: [] },
                no: { count: 0, participants: [] },
                maybe: { count: 0, participants: [] },
                attendanceRate: 0,
            });

        for (const vote of option.votes) {
            const name = participants[vote.userId] ?? "Neznámý uživatel";
            const status = vote.status as VoteStatus;
            const statusCZ = status === "yes" ? "ano" : status === "no" ? "ne" : "možná";

            if (vote.note && vote.note.trim()) {
                (notesSummary[date] ??= []).push(`<strong>${name}</strong> ${status ? "(" + statusCZ + ")" : ""}: ${vote.note}`);
            }

            summary[status].count += 1;
            summary[status].participants.push({ name: name, note: vote.note || "" });

            if (vote.userId === currentUserId) {
                userStatus.push({ date, status, note: vote.note || "" });
            }
        }
    }
    for (const date in votesSummary) {
        const s = votesSummary[date];
        if (s)
            s.attendanceRate = computeAttendanceRate(
                {
                    yes: s.yes.count,
                    no: s.no.count,
                    maybe: s.maybe.count,
                },
                weights,
                votingUserCount
            );
    }
    console.log("Aggregated Votes Summary:", votesSummary);
    console.log("User Vote Status:", userStatus);
    console.log("Notes Summary:", notesSummary);

    return { votesSummary, notesSummary, userStatus };
};

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

export const getNotesForDate = (
    date: string,
    notesSummary: Record<string, string[]>,
    showAllNotes: boolean = true
): string[] => {
    if (!notesSummary || !notesSummary[date]) return [];
    const notes = notesSummary[date];
    return showAllNotes ? notes : (notes.length ? [notes[0] ?? ""] : []);
};


