from app.config import *
from app.client import *
from app.schema import *
from app.session import *
from app.util import *
from fastapi import (
    FastAPI, HTTPException, Response, UploadFile, WebSocketDisconnect
)
from fastapi.middleware.cors import CORSMiddleware
from time import time

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=['*'],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=['*'],  # Allow all headers
)


@app.get('/')
async def get():
    return {'message': 'Co-Chuck backend server is healthy and running.'}


@app.websocket('/websocket')
async def websocket_endpoint(websocket: WebSocket):
    user_id = websocket.query_params.get('userId')
    session_id = websocket.query_params.get('sessionId')

    if not session_id:
        await websocket.close(code=1008, reason='Session ID required')
        return
    
    elif session_id not in cc_session_managers:
        await websocket.close(code=4001, reason='Invalid Session ID')
        return
    
    elif user_id not in cc_session_managers[session_id].groundtruth.users:
        await websocket.close(code=4002, reason='Invalid User ID')
        return

    try:
        # Accept the WebSocket connection
        await cc_session_managers[session_id].ws_manager.connect(user_id, websocket)

        while True: # Keep connection alive & calculate clock offset
            try:
                start_timestamp = time()
                await websocket.send_json({
                    'type': 'ping',
                    'serverTime': start_timestamp
                })
                
                ping_response = await websocket.receive_json()
                end_timestamp = time()

                if ping_response['type'] != 'pong':
                    continue

                cc_session_managers[session_id].set_clock_offset(
                    user_id, start_timestamp, ping_response['clientTime'], end_timestamp
                )
                cc_session_managers[session_id].groundtruth.users[user_id].update_last_active()

            except WebSocketDisconnect:
                break
            except Exception:
                continue
            finally:
                await asyncio.sleep(WEBSOCKET_PING_INTERVAL)

    finally:
        try:
            if session_id in cc_session_managers:
                await cc_session_managers[session_id].ws_manager.disconnect(user_id)
            else:
                await websocket.close(code=1000)
        except:
            pass


@app.post('/sync')
async def sync(sync_req_data: SessionSyncReq | SessionJoinReq | SessionCreateReq):

    if isinstance(sync_req_data, SessionCreateReq):

        groundtruth = create_session(sync_req_data)
        return SessionSyncResp(groundtruth=groundtruth)
    
    elif isinstance(sync_req_data, SessionJoinReq):
        
        groundtruth = add_user_to_session(sync_req_data)
        return SessionSyncResp(groundtruth=groundtruth)

    elif isinstance(sync_req_data, SessionSyncReq):

        groundtruth = sync_session(sync_req_data)
        return SessionSyncResp(groundtruth=groundtruth)

    else:

        raise HTTPException(
            status_code=422,
            detail='Invalid request body.'
        )


@app.get('/file')
async def get_binary_file(sessionId: str, filename: str):

    data = get_binary_file_(sessionId, filename)
    return Response(
        content=data,
        media_type="application/octet-stream",
    )


@app.post('/file')
async def add_file(sessionId: str, file: UploadFile):

    await add_file_(sessionId, file)
    return {'message': 'File added successfully.'}


@app.delete('/file')
async def remove_file(sessionId: str, userId: str, filename: str):

    remove_file_(sessionId, userId, filename)
    return {'message': 'File deleted successfully.'}


@app.post('/clear-project')
async def clear_project(sessionId: str):

    clear_files(sessionId)
    return {'message': 'Project cleared successfully.'}


@app.post('/broadcast')
async def broadcast(
    sessionId: str, userId: str, action: Literal['play', 'remove'], filename: str | None
): 

    await broadcast_(sessionId, userId, action, filename)
    return {'message': 'Message broadcasted successfully.'}
