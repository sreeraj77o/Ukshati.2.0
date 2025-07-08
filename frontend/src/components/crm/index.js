/**
 * CRM Components Index
 * Centralized exports for all CRM components
 */

// Import components
import CustomerForm from './CustomerForm/CustomerForm';
import ProjectForm from './ProjectForm/ProjectForm';
import ReminderForm from './ReminderForm/ReminderForm';
import ImportExport from './ImportExport/ImportExport';

// Named exports
export { 
  CustomerForm, 
  ProjectForm, 
  ReminderForm, 
  ImportExport 
};

// Default export
export default {
  CustomerForm,
  ProjectForm,
  ReminderForm,
  ImportExport,
};
