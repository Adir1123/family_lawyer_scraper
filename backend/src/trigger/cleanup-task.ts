import { schedules, logger } from '@trigger.dev/sdk/v3';
import { archiveOldLeads, cleanOldTrash, getActiveConfig } from '../services/supabase.js';

export const cleanupTask = schedules.task({
  id: 'family-lawyer-cleanup',
  run: async () => {
    logger.info('Starting cleanup...');

    const cfg = await getActiveConfig();
    const archiveDays = cfg?.archive_days ?? 30;
    const trashDays = cfg?.trash_days ?? 7;

    await archiveOldLeads(archiveDays);
    await cleanOldTrash(trashDays);
    logger.info(`Cleanup complete (archive: ${archiveDays}d, trash: ${trashDays}d)`);
  },
});
