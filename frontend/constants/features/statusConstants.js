/**
 * Status constants for different features
 */

// Project statuses
export const PROJECT_STATUS = {
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled'
};

// Project status colors
export const PROJECT_STATUS_COLORS = {
  [PROJECT_STATUS.ONGOING]: 'bg-blue-600/20 text-blue-400',
  [PROJECT_STATUS.COMPLETED]: 'bg-green-600/20 text-green-400',
  [PROJECT_STATUS.ON_HOLD]: 'bg-yellow-600/20 text-yellow-400',
  [PROJECT_STATUS.CANCELLED]: 'bg-red-600/20 text-red-400'
};

// Quotation statuses
export const QUOTATION_STATUS = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired'
};

// Quotation status colors
export const QUOTATION_STATUS_COLORS = {
  [QUOTATION_STATUS.DRAFT]: 'bg-gray-600/20 text-gray-400',
  [QUOTATION_STATUS.SENT]: 'bg-blue-600/20 text-blue-400',
  [QUOTATION_STATUS.ACCEPTED]: 'bg-green-600/20 text-green-400',
  [QUOTATION_STATUS.REJECTED]: 'bg-red-600/20 text-red-400',
  [QUOTATION_STATUS.EXPIRED]: 'bg-orange-600/20 text-orange-400'
};

// Expense categories
export const EXPENSE_CATEGORIES = {
  MATERIALS: 'Materials',
  LABOR: 'Labor',
  EQUIPMENT: 'Equipment',
  TRANSPORTATION: 'Transportation',
  UTILITIES: 'Utilities',
  MISCELLANEOUS: 'Miscellaneous'
};

// Expense category colors
export const EXPENSE_CATEGORY_COLORS = {
  [EXPENSE_CATEGORIES.MATERIALS]: 'bg-blue-600/20 text-blue-400',
  [EXPENSE_CATEGORIES.LABOR]: 'bg-green-600/20 text-green-400',
  [EXPENSE_CATEGORIES.EQUIPMENT]: 'bg-purple-600/20 text-purple-400',
  [EXPENSE_CATEGORIES.TRANSPORTATION]: 'bg-yellow-600/20 text-yellow-400',
  [EXPENSE_CATEGORIES.UTILITIES]: 'bg-red-600/20 text-red-400',
  [EXPENSE_CATEGORIES.MISCELLANEOUS]: 'bg-gray-600/20 text-gray-400'
};

// Inventory units
export const INVENTORY_UNITS = {
  PIECES: 'pcs',
  KILOGRAMS: 'kg',
  LITERS: 'ltr',
  METERS: 'mtr',
  BOXES: 'box',
  PACKS: 'pack'
};

// Inventory unit labels
export const INVENTORY_UNIT_LABELS = {
  [INVENTORY_UNITS.PIECES]: 'Pieces',
  [INVENTORY_UNITS.KILOGRAMS]: 'Kilograms',
  [INVENTORY_UNITS.LITERS]: 'Liters',
  [INVENTORY_UNITS.METERS]: 'Meters',
  [INVENTORY_UNITS.BOXES]: 'Boxes',
  [INVENTORY_UNITS.PACKS]: 'Packs'
};

// Stock status
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock'
};

// Stock status colors
export const STOCK_STATUS_COLORS = {
  [STOCK_STATUS.IN_STOCK]: 'bg-green-600/20 text-green-400',
  [STOCK_STATUS.LOW_STOCK]: 'bg-yellow-600/20 text-yellow-400',
  [STOCK_STATUS.OUT_OF_STOCK]: 'bg-red-600/20 text-red-400'
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Priority colors
export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: 'bg-gray-600/20 text-gray-400',
  [PRIORITY_LEVELS.MEDIUM]: 'bg-blue-600/20 text-blue-400',
  [PRIORITY_LEVELS.HIGH]: 'bg-yellow-600/20 text-yellow-400',
  [PRIORITY_LEVELS.URGENT]: 'bg-red-600/20 text-red-400'
};

// Task statuses
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done'
};

// Task status colors
export const TASK_STATUS_COLORS = {
  [TASK_STATUS.TODO]: 'bg-gray-600/20 text-gray-400',
  [TASK_STATUS.IN_PROGRESS]: 'bg-blue-600/20 text-blue-400',
  [TASK_STATUS.REVIEW]: 'bg-yellow-600/20 text-yellow-400',
  [TASK_STATUS.DONE]: 'bg-green-600/20 text-green-400'
};
