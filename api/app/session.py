from app.client import *
from app.config import *
from app.dmp import *
from app.schema import *
from fastapi import HTTPException, UploadFile
from time import time


def create_session(sync_req_data: SessionCreateReq) -> SessionGroundTruth:

    if sync_req_data.filename not in sync_req_data.files:

        raise HTTPException(
            status_code=400,
            detail='Invalid Data: Filename does not exist in the given list of files.'
        )

    user = SessionUser(
        userId=sync_req_data.userId,
        userColor=sync_req_data.userColor,
        filename=sync_req_data.filename,
        lineNumber=sync_req_data.lineNumber,
        column=sync_req_data.column,
        lastEdited=time(),
        lastActive=time()
    )

    groundtruth = SessionGroundTruth(
        sessionId=sync_req_data.sessionId,
        users={ sync_req_data.userId: user },
        files=sync_req_data.files,
        lastActive=time()
    )

    cc_session_managers[sync_req_data.sessionId] = CoChuckSessionManager(
        groundtruth=groundtruth
    )

    return groundtruth


def add_user_to_session(sync_req_data: SessionJoinReq) -> SessionGroundTruth:

    if sync_req_data.sessionId not in cc_session_managers:

        raise HTTPException(
            status_code=400,
            detail='The given session ID does not exist.'
        )
    
    elif (
        sync_req_data.userId in 
        cc_session_managers[sync_req_data.sessionId].groundtruth.users
    ):

        raise HTTPException(
            status_code=409,
            detail='The given user ID already exists in the session.'
        )

    session_manager = cc_session_managers[sync_req_data.sessionId]
    groundtruth = session_manager.groundtruth

    if len(groundtruth.users) >= MAX_USERS:

        raise HTTPException(
            status_code=429,
            detail=f'The session cannot take more than {MAX_USERS} users.'
        )

    # Add user data
    groundtruth.users[sync_req_data.userId] = SessionUser(
        userId=sync_req_data.userId,
        userColor=sync_req_data.userColor,
        filename='', # this will be set by client on the first sync request
        lineNumber=1,
        column=1,
        lastEdited=time(),
        lastActive=time()
    )

    return groundtruth


def sync_session(sync_req_data: SessionSyncReq) -> SessionGroundTruth:

    if sync_req_data.sessionId not in cc_session_managers:

        raise HTTPException(
            status_code=400,
            detail='The given session ID does not exist.'
        )

    elif sync_req_data.userId not in \
         cc_session_managers[sync_req_data.sessionId].groundtruth.users:
        
        raise HTTPException(
            status_code=404,
            detail='The given user ID was not found.'
        )

    session_manager = cc_session_managers[sync_req_data.sessionId]
    groundtruth = session_manager.groundtruth

    if sync_req_data.filename not in groundtruth.files:

        groundtruth.files[sync_req_data.filename] = SessionFile(
            filename=sync_req_data.filename, code=''
        )

    if len(sync_req_data.patchString) > 0:

        # Note that synchronization is not needed because every 
        # route functions are running on the same event loop and 
        # everything here is synchronous
        old_text = groundtruth.files[sync_req_data.filename].code
        patches_deserialized = dmp.patch_fromText(sync_req_data.patchString)
        new_text = dmp.patch_apply(patches_deserialized, old_text)[0]
        groundtruth.files[sync_req_data.filename].code = new_text

    # Update user data
    if (
        len(sync_req_data.patchString) > 0 or
        groundtruth.users[sync_req_data.userId].filename != sync_req_data.filename or
        groundtruth.users[sync_req_data.userId].lineNumber != sync_req_data.lineNumber or
        groundtruth.users[sync_req_data.userId].column != sync_req_data.column
    ):
        groundtruth.users[sync_req_data.userId].update_last_edited()

    groundtruth.users[sync_req_data.userId].filename = sync_req_data.filename
    groundtruth.users[sync_req_data.userId].lineNumber = sync_req_data.lineNumber
    groundtruth.users[sync_req_data.userId].column = sync_req_data.column

    return groundtruth


def get_binary_file_(session_id: str, filename: str) -> bytes:

    if session_id not in cc_session_managers:

        raise HTTPException(
            status_code=400,
            detail='The given session ID does not exist.'
        )

    session_manager = cc_session_managers[session_id]
    groundtruth = session_manager.groundtruth

    if filename not in groundtruth.files or filename not in session_manager.binary_files:

        raise HTTPException(
            status_code=404,
            detail='The given binary file does not exist in the session.'
        )

    return session_manager.binary_files[filename]


async def add_file_(session_id: str, file: UploadFile):

    if session_id not in cc_session_managers:

        raise HTTPException(
            status_code=400,
            detail='The given session ID does not exist.'
        )

    session_manager = cc_session_managers[session_id]
    groundtruth = session_manager.groundtruth

    # Await for file content first before checking/modifying session 
    # state to prevent race conditions (remember the Python async model)
    size = 0
    chunks = [] 
    while chunk := await file.read(CHUNK_SIZE):
        size += len(chunk)
        if size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large.")
        chunks.append(chunk)
    content: bytes = b''.join(chunks)

    if file.filename in groundtruth.files:

        raise HTTPException(
            status_code=409,
            detail='The given file already exists in the session.'
        )

    groundtruth.files[file.filename] = SessionFile(
        filename=file.filename, code=None
    )

    # Plaintexts will be sync'ed in next sync request
    # Binary files will be sync'ed once clients start asking for missing binary files
    if file.content_type == 'text/plain':
        groundtruth.files[file.filename].code = content.decode('utf-8')
    else:
        # TODO: use in-memory DB/filesystem instead
        session_manager.binary_files[file.filename] = content

def remove_file_(session_id: str, curr_user_id: str, filename: str):

    if session_id not in cc_session_managers:

        raise HTTPException(
            status_code=400,
            detail='The given session ID does not exist.'
        )

    session_manager = cc_session_managers[session_id]
    groundtruth = session_manager.groundtruth

    if filename not in groundtruth.files:

        raise HTTPException(
            status_code=404,
            detail='The given file does not exist in the session.'
        )

    for user_id in groundtruth.users:
        if user_id == curr_user_id:
            continue
        if groundtruth.users[user_id].filename == filename:
            raise HTTPException(
                status_code=400,
                detail='The given file cannot be deleted because another user is working on it.'
            )

    if filename in session_manager.binary_files:
        session_manager.binary_files.pop(filename)

    groundtruth.files.pop(filename)

def clear_files(session_id: str):

    if session_id not in cc_session_managers:

        raise HTTPException(
            status_code=400,
            detail='The given session ID does not exist.'
        )

    session_manager = cc_session_managers[session_id]
    groundtruth = session_manager.groundtruth

    for user_id in groundtruth.users:
        groundtruth.users[user_id].filename = ''
        groundtruth.users[user_id].lineNumber = 1
        groundtruth.users[user_id].column = 1
    groundtruth.files = {}

async def broadcast_(
    session_id: str, user_id: str, action: Literal['play', 'remove'], filename: str | None = None
):

    if session_id not in cc_session_managers:

        raise HTTPException(
            status_code=400,
            detail='The given session ID does not exist.'
        )
    
    session_manager = cc_session_managers[session_id]
    ws_manager = session_manager.ws_manager
    groundtruth = session_manager.groundtruth

    if action == 'play':

        if filename not in groundtruth.files:

            raise HTTPException(
                status_code=404,
                detail='The given file does not exist in the session.'
            )
        
        for target_user_id, websocket in ws_manager.active_connections.items():
            await websocket.send_json({
                'type': 'play',
                'filename': filename,
                'targetTime': time() + BROADCAST_DELAY + session_manager.clock_offset[target_user_id]
            })

    elif action == 'remove':

        await ws_manager.async_broadcast_json({
            'type': 'remove'
        })

    else:

        raise HTTPException(
            status_code=422,
            detail='Invalid action for broadcast'
        )
