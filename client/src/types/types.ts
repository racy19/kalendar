export type EventOption = {
    _id: string;
    date: string;
    votes: any[];
};

export type Vote = {
    date: Date;
    vote: string;
};

export type VoteCount = {
    yes: number;
    no: number;
    maybe: number;
};

export type StatusInfo = {
    yes: {
        count: number,
        participants: string[]
    },
    no: {
        count: number,
        participants: string[]
    },
    maybe: {
        count: number,
        participants: string[]
    },
}

export type VotingData = {
    [date: string]: StatusInfo;
};