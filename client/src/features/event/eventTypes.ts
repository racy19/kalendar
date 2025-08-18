// data types get from fetched events (res = options)
export type FetchedEvent = {
  _id: string;
  title: string;
  description?: string;
  userId: string;
  publicId: string;
  options: EventOption[];
}

export type EventOption = {
    _id?: string;
    date: string;
    votes: EventVote[];
};

export type EventVote = {
    userId: string;
    status: VoteStatus;
}

export type VoteStatus = "yes" | "no" | "maybe";

// types for userVoteStatus in userVotes function
export type UserVoteStatus = {
    date: string;
    status: VoteStatus;
};

// types for status aggregation
export type StatusCount = {
    yes: number;
    no: number;
    maybe: number;
};

// types for user
export type UserResponse = {
  _id: string;
  name?: string;
};

export type Participants = Record<string, string>; // { _id: name }

// types for votes - for rendering in Calendar component (as a result of aggregateVotesSummary function)
export type VoteSummary = {
    [date: string]: StatusRecord;
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

// type for event descrtiption
export type eventInfo = {
    title: string,
    description: string,
}