import time
import logging
import asyncio
import functools
from enum import Enum
from typing import Callable, Any, Optional

logger = logging.getLogger("Resilience")

class CircuitState(Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.state = CircuitState.CLOSED

    def __call__(self, func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            if self.state == CircuitState.OPEN:
                if time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                    logger.info("Circuit Breaker: Transitioning to HALF_OPEN")
                else:
                    logger.warning(f"Circuit Breaker: OPEN. Rejecting call to {func.__name__}")
                    raise Exception(f"Circuit Breaker is OPEN for {func.__name__}")

            try:
                result = await func(*args, **kwargs)
                if self.state == CircuitState.HALF_OPEN:
                    logger.info("Circuit Breaker: Transitioning to CLOSED (Recovery successful)")
                    self.state = CircuitState.CLOSED
                    self.failure_count = 0
                return result
            except Exception as e:
                self.failure_count += 1
                self.last_failure_time = time.time()
                
                if self.state == CircuitState.HALF_OPEN or self.failure_count >= self.failure_threshold:
                    self.state = CircuitState.OPEN
                    logger.error(f"Circuit Breaker: Transitioning to OPEN due to error: {e}")
                
                raise e
        return wrapper

def retry_with_backoff(retries: int = 3, initial_delay: float = 1.0, factor: float = 2.0):
    """
    Async retry decorator with exponential backoff.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            delay = initial_delay
            for i in range(retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if i == retries - 1:
                        logger.error(f"Retry: Final attempt failed for {func.__name__}: {e}")
                        raise e
                    
                    logger.warning(f"Retry: Attempt {i+1} failed for {func.__name__}. Retrying in {delay}s...")
                    await asyncio.sleep(delay)
                    delay *= factor
            return await func(*args, **kwargs)
        return wrapper
    return decorator
