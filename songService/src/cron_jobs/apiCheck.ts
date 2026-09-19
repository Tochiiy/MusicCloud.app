import cron from 'node-cron';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export const startApiHealthCheck = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        console.log(`[API Check] Health check passed (${response.status})`);
      } else {
        console.error(`[API Check] Health check failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`[API Check] Error reaching API: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
};