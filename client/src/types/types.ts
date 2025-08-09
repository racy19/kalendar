export type EventOption = {
    _id: string;
    date: Date;
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