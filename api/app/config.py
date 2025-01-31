# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://cochuck.stuartsul.com",
    "https://cochuck.stuartsul.com"
]

# BINARY DATA HANDLING
CHUNK_SIZE = 1024 * 1024  # 1MB
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit

# TIMEOUT CONFIGURATION
USER_TIMEOUT = 15  # seconds
CLEANUP_INTERVAL = 30  # seconds

# SESSION CONFIGURATION
MAX_USERS = 16  # Max users per session
WEBSOCKET_PING_INTERVAL = 3  # seconds
CLOCK_OFFSET_Q_SIZE = 3  # Number of clock offset data to keep
BROADCAST_DELAY = 1.5  # seconds
