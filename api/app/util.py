from app.config import *
from app.client import *
from fastapi import FastAPI
from app.main import cc_session_managers
import asyncio
import logging
from time import time


logger = logging.getLogger('uvicorn.error')


async def cleanup_inactive_sessions():

    while True:
        logger.info('Cleaning up inactive users...')

        current_time = time()
        target_session_ids = list(cc_session_managers.keys())
        logger.info(f'Live sessions: {target_session_ids}')

        for session_id in target_session_ids:

            target_user_ids = list(cc_session_managers[session_id].groundtruth.users.keys())
            logger.info(f'  - Session {session_id}: {target_user_ids}')

            for user_id in target_user_ids:
                if (
                    current_time - \
                    cc_session_managers[session_id]
                        .groundtruth.users[user_id].lastActive >= USER_TIMEOUT
                ):
                    remove_user(session_id, user_id)

        await asyncio.sleep(CLEANUP_INTERVAL)

async def lifespan(app: FastAPI):

    task = asyncio.create_task(cleanup_inactive_sessions())

    try:
        yield
    finally:
        task.cancel()
        
        try:
            await task
        except asyncio.CancelledError:
            print('Background task cleanup complete.')
