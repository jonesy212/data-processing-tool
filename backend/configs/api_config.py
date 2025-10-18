from typing import Optional


class ApiConfig:
    def __init__(
        self,
        base_url: str,
        timeout: int = 10000,
        headers: Optional[dict[str, str]] = None,
        retry_enabled: bool = False,
        max_retries: int = 3,
        retry_delay: int = 1000,
        cache_enabled: bool = False,
        max_age: int = 300000,
        stale_while_revalidate: int = 60000,
        cache_key: str = "api_cache_key",
        response_type: str = "json",
        with_credentials: bool = True,
    ):
        self.base_url = base_url
        self.timeout = timeout
        self.headers = headers or {}
        self.retry_enabled = retry_enabled
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.cache_enabled = cache_enabled
        self.max_age = max_age
        self.stale_while_revalidate = stale_while_revalidate
        self.cache_key = cache_key
        self.response_type = response_type
        self.with_credentials = with_credentials
