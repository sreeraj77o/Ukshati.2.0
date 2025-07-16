import backupScheduler from './backupScheduler.js';

let servicesInitialized = false;

export async function initializeServices() {
  if (servicesInitialized) {
    console.log('Services already initialized');
    return;
  }

  try {
    console.log('Initializing application services...');
    
    // Initialize backup scheduler
    await backupScheduler.initialize();
    
    servicesInitialized = true;
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    // Don't throw here to prevent app from crashing
    // Services will retry initialization on next request
  }
}

export function getServicesStatus() {
  return {
    initialized: servicesInitialized,
    backupScheduler: servicesInitialized
  };
}
