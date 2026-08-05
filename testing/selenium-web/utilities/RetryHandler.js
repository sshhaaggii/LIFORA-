const logger = require('./Logger');

async function retry(fn, retries = 3, delayMs = 1000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      logger.warn(`Attempt ${attempt}/${retries} failed: ${error.message}. Retrying in ${delayMs}ms...`);
      if (attempt >= retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = { retry };
