// Role IDs from the backend
export const ROLE_IDS = {
  PLANT_HEAD: 'mdsvs0slz4dazf7jn7',
  PRODUCTION_MANAGER: 'mdsvs0sm4g2ebejicna',
  DIRECTOR: 'mdsvvhw3oxmwiwm8uca',
  CTO: 'mdsvvhw7rgh3emgf7jf',
  ADMIN: 'mdsvs0skbcqbxhv87o'
} as const;

// User IDs from the backend
export const USER_IDS = {
  PLANT_HEAD: 'mdsxto92x27xubljkc', // Narendra Chauhan
  PRODUCTION_MANAGER: 'mdsxto8ydv4dknv25i', // Amit Kumar Parida
  DIRECTOR: 'mdsxto8p9jbklgf83tj', // Shashank Bajaj
  CTO: 'mdsxto8vuk4ga7sw70i' // Sujal Nimbalkar
} as const;

// User emails for easy identification
export const USER_EMAILS = {
  PLANT_HEAD: 'narendra@blackcat.in',
  PRODUCTION_MANAGER: 'qc6@blackcat.in',
  DIRECTOR: 'sb@blackcat.in',
  CTO: 'sujalnimbalkar09@gmail.com'
} as const;

// Role checking functions
export const isPlantHead = (userEmail?: string, userId?: string) => {
  return userEmail === USER_EMAILS.PLANT_HEAD || userId === USER_IDS.PLANT_HEAD;
};

export const isProductionManager = (userEmail?: string, userId?: string) => {
  return userEmail === USER_EMAILS.PRODUCTION_MANAGER || userId === USER_IDS.PRODUCTION_MANAGER;
};

export const isDirector = (userEmail?: string, userId?: string) => {
  return userEmail === USER_EMAILS.DIRECTOR || userId === USER_IDS.DIRECTOR;
};

export const isCTO = (userEmail?: string, userId?: string) => {
  return userEmail === USER_EMAILS.CTO || userId === USER_IDS.CTO;
};

export const isAdmin = (userEmail?: string, userId?: string) => {
  return isDirector(userEmail, userId) || isCTO(userEmail, userId);
};

export const canApproveDailyPlans = (userEmail?: string, userId?: string) => {
  return isPlantHead(userEmail, userId) || isAdmin(userEmail, userId);
};

export const canSubmitDailyPlans = (userEmail?: string, userId?: string) => {
  return isProductionManager(userEmail, userId) || isAdmin(userEmail, userId);
}; 