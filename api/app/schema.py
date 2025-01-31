from pydantic import BaseModel
from time import time
from typing import Literal

class SessionUser(BaseModel):
    userId: str
    userColor: str
    filename: str
    lineNumber: int
    column: int
    lastEdited: float
    lastActive: float

    def update_last_edited(self):
        current_time = time()
        self.lastEdited = current_time
        self.lastActive = current_time

    def update_last_active(self):
        self.lastActive = time()


class SessionFile(BaseModel):
    filename: str
    code: str | None # None indicates non-text file


class SessionGroundTruth(BaseModel):
    sessionId: str
    users: dict[str, SessionUser]
    files: dict[str, SessionFile]


class SessionCreateReq(BaseModel):
    type: Literal['create']
    userId: str
    userColor: str
    sessionId: str
    files: dict[str, SessionFile]
    filename: str
    lineNumber: int
    column: int


class SessionJoinReq(BaseModel):
    type: Literal['join']
    userId: str
    userColor: str
    sessionId: str


class SessionSyncReq(BaseModel):
    type: Literal['sync']
    userId: str
    sessionId: str
    filename: str
    patchString: str
    lineNumber: int
    column: int

class SessionSyncResp(BaseModel):
    groundtruth: SessionGroundTruth
