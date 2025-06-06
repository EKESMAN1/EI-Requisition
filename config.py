"""Default configuration settings."""
from functools import lru_cache

class Settings():
    """Default BaseSettings."""

    env_name: str = "local"
    db_url: str = "sqlite:///./requisition.sqlite"

    # default to SQLite
    app_server: str = "local" #change to 'development' when hosting
    
    #openai tags
    tags = [
        {
        'name': 'user',
        'description': 'Routes related to users activities'
        },
        {
        'name': 'auth',
        'description': 'Routes related to authentication needs'
        },
        {
        'name': 'link',
        'description': 'Routes connecting pages on the website'
        }
    ]
    
    SECRET_KEY = "ezzyrequi08bdbc97f82bfe593d1e45cec19ad2591af315096665512564df9af"
    ALGORITHM = "HS256"
    
    class Config:
        """Load env variables from .env file."""
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    
    """Return the current settings."""
    
    settings = Settings()
    if settings.app_server == "deployment":
        settings.db_url = "postgresql://jghaalsi:D7eoK_Id1-gKTZ3aAsz-uWHtJYrzSTSd@lallah.db.elephantsql.com/jghaalsi"
    return settings
