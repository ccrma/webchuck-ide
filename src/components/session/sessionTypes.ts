// sessionTypes.ts
export type SessionUser = {
    userId: string;
    userColor: string;
    filename: string;
    lineNumber: number;
    column: number;
    lastEdited: number;
    lastActive: number;
};

export type SessionFile = {
    filename: string;
    code: string | null;
};

export type SessionGroundTruth = {
    sessionId: string;
    users: Record<string, SessionUser>;
    files: Record<string, SessionFile>;
    lastActive: number;
};

export type SessionCreateReq = {
    type: "create";
    userId: string;
    userColor: string;
    sessionId: string;
    files: Record<string, SessionFile>;
    filename: string;
    lineNumber: number;
    column: number;
};

export type SessionJoinReq = {
    type: "join";
    userId: string;
    userColor: string;
    sessionId: string;
};

export type SessionSyncReq = {
    type: "sync";
    userId: string;
    sessionId: string;
    filename: string;
    patchString: string;
    lineNumber: number;
    column: number;
};

export type SessionSyncResp = {
    groundtruth: SessionGroundTruth;
};
