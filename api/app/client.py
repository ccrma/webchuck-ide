from app.config import *
from app.schema import SessionGroundTruth
import asyncio
from collections import defaultdict, deque
from fastapi import WebSocket
import logging
import gc

logger = logging.getLogger("uvicorn.error")

class WSConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    async def disconnect(self, user_id: str):
        websocket = self.active_connections[user_id]
        self.active_connections.pop(user_id)
        try:
            await websocket.close()
        except:
            pass

    async def sync_broadcast_json(self, data: dict):
        '''Synchronously broadcast JSON data.'''
        for connection in self.active_connections.values():
            await connection.send_json(data)

    async def async_broadcast_json(self, data: dict):
        '''Asynchronously broadcast JSON data. Use if there are many connections.'''
        tasks = [connection.send_json(data) for connection in self.active_connections.values()]
        await asyncio.gather(*tasks)

    async def sync_broadcast_bytes(self, data: bytes):
        '''Synchronously broadcast bytes data.'''
        for connection in self.active_connections.values():
            await connection.send_bytes(data)

    async def async_broadcast_bytes(self, data: bytes):
        '''Asynchronously broadcast bytes data. Use if there are many connections.'''
        tasks = [connection.send_bytes(data) for connection in self.active_connections.values()]
        await asyncio.gather(*tasks)

class CoChuckSessionManager:
    def __init__(self, groundtruth: SessionGroundTruth):
        self.ws_manager = WSConnectionManager()
        self.groundtruth: SessionGroundTruth  = groundtruth
        self.binary_files: dict[str, bytes] = {}
        self.lock = asyncio.Lock()
        self.clock_offset: dict[str, float] = defaultdict(int) # median of offset data
        self.clock_offset_q: dict[str, deque[float]] = defaultdict(deque) # user_id -> queue of offsets

    def set_clock_offset(
        self, user_id: str, 
        server_start_timestamp: float, 
        client_timestamp: float, 
        server_end_timestamp: float
    ):
        self.clock_offset_q[user_id].append(
            client_timestamp - (server_start_timestamp + server_end_timestamp) / 2
        )
        if len(self.clock_offset_q[user_id]) > CLOCK_OFFSET_Q_SIZE:
            self.clock_offset_q[user_id].popleft()      
        if len(self.clock_offset_q[user_id]) < CLOCK_OFFSET_Q_SIZE:
            self.clock_offset[user_id] = self.clock_offset_q[user_id][-1]
        else:
            self.clock_offset[user_id] = sorted(self.clock_offset_q[user_id])[1]


cc_session_managers: dict[str, CoChuckSessionManager] = {}


def remove_user(session_id: str, user_id: str):
    '''Remove user from session and remove session if no users left.'''
    logger.info(f'WebSocket connection closed for session {session_id}, user {user_id}')
    if user_id in cc_session_managers[session_id].groundtruth.users:
        cc_session_managers[session_id].groundtruth.users.pop(user_id)
        if not cc_session_managers[session_id].groundtruth.users:
            logger.info(f'Session {session_id} is empty. Closing session...')
            cc_session_managers.pop(session_id)
    gc.collect()
