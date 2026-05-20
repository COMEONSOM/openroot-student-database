# config.py
# ================================================================
#  This file is kept for backward compatibility ONLY.
# ================================================================

import os
from dotenv import load_dotenv

load_dotenv()

# MYSQL_CONFIG is retained so existing imports keep working,
# but credentials come exclusively from environment variables.
MYSQL_CONFIG = {
    "host":     os.environ["DB_HOST"],
    "port":     int(os.getenv("DB_PORT", 3306)),
    "user":     os.environ["DB_USER"],
    "password": os.environ["DB_PASSWORD"],
    "database": os.environ["DB_NAME"],
}