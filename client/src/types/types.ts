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