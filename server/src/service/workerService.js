import { Worker } from 'bullmq';
import { connection } from './queueService.js';
import { markAbsent, saveAbsentToDb, schedulePulling } from './attendanceService.js';

const worker = new Worker('attendanceQueue', async job => {
    if (job.name === 'pullAbsent') await schedulePulling();
    if (job.name === 'markAbsent') await markAbsent();
    if (job.name === 'saveAbsentToDb') await saveAbsentToDb();
}, { connection: connection });

console.log('🚀 Worker berjalan dan memproses queue...');