export type EventOption = {
    _id: string;
    date: string;
    votes: any[];
};

export type Vote = {
    date: string;
    status: string;
};

export type StatusCount = {
    yes: number;
    no: number;
    maybe: number;
};

export type StatusRecord = {
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

export type VoteRecord = {
    [date: string]: StatusRecord;
};