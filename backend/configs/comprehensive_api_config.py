from configs.api_config import ApiConfig

api_config = ApiConfig(
    base_url="https://api.example.com",
    timeout=10000,
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer your-access-token",
    },
    retry_enabled=True,
    max_retries=3,
    retry_delay=1000,
    cache_enabled=True,
    max_age=300000,
    stale_while_revalidate=60000,
    cache_key="api_cache_key",
    response_type="json",
    with_credentials=True,
)
