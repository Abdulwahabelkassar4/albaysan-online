const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRecoverableError = (error) => {
  if (!error) return true;
  if (!error.response) return true;
  const { status } = error.response;
  return status === 408 || status === 425 || status === 429 || status >= 500;
};

export const requestWithRetry = async (
  requestFn,
  { timeoutMs = 60000, baseDelayMs = 1500, maxDelayMs = 8000, onRetry } = {}
) => {
  const startedAt = Date.now();
  let attempt = 0;

  while (Date.now() - startedAt < timeoutMs) {
    attempt += 1;
    try {
      return await requestFn();
    } catch (error) {
      if (!isRecoverableError(error)) {
        throw error;
      }

      const elapsed = Date.now() - startedAt;
      const waitMs = Math.min(baseDelayMs * Math.pow(1.5, attempt - 1), maxDelayMs);
      if (typeof onRetry === "function") {
        onRetry({ attempt, elapsed, waitMs, error });
      }

      if (elapsed + waitMs >= timeoutMs) {
        throw error;
      }
      await sleep(waitMs);
    }
  }

  throw new Error("Request retry timeout");
};
