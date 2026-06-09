// Types pour l'application JobMatch AI

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'pedagogic_director' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
};

export type Student = User & {
  studentId: string;
  enrolledYear: number;
  fieldOfStudy: string;
  currentLevel: StudyLevel;
  cvPath?: string;
  desiredJobTitle?: string;
  targetSalaryMin?: number;
  targetSalaryMax?: number;
  graduationYear: number;
  promoGroup: string;
};

export type PedagogicDirector = User & {
  directorId: string;
  department: string;
  position: string;
  phoneNumber: string;
  managedPromos: string[];
  managedFields: string[];
};

export type Profile = {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  city: string;
  levelOfStudy: string;
  yearsOfExperience: number;
  location: string;
  availability: boolean;
  willingToRelocate: boolean;
  preferredWorkingMode: WorkingMode;
};

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  weight: number;
  synonyms: string[];
};

export type StudentSkill = {
  id: string;
  studentId: string;
  skillId: string;
  skill: Skill;
  proficiencyLevel: 1 | 2 | 3 | 4 | 5;
  yearsOfExperience: number;
  isSelfReported: boolean;
};

export type JobOffer = {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companySize?: CompanySize;
  companySector?: string;
  location: string;
  city: string;
  region: string;
  contractType: ContractType;
  experienceLevel: ExperienceLevel;
  experienceMinYears?: number;
  experienceMaxYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  url: string;
  source: string;
  publishedAt: Date;
  expirationDate?: Date;
  description: string;
  isActive: boolean;
  viewsCount: number;
  applicationsCount: number;
};

export type JobSkill = {
  id: string;
  jobOfferId: string;
  skillId: string;
  skill: Skill;
  isRequired: boolean;
  importance: number;
};

export type Recommendation = {
  id: string;
  studentId: string;
  jobOfferId: string;
  jobOffer: JobOffer;
  score: number;
  scoreDetails: ScoreDetails;
  status: RecommendationStatus;
  viewedAt?: Date;
  appliedAt?: Date;
  createdAt: Date;
};

export type ScoreDetails = {
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  salaryMatch: number;
  contractMatch: number;
};

export type AnalysisResult = {
  id: string;
  jobOfferId: string;
  extractedSkills: ExtractedSkill[];
  experienceRequired?: string;
  educationRequired?: string;
  languagesRequired: string[];
  certificationsRequired: string[];
  confidence: number;
};

export type ExtractedSkill = {
  name: string;
  importance: 'high' | 'medium' | 'low';
  detectedFrom: string;
};

export type AdvancedSearchFilter = {
  id: string;
  studentId: string;
  name: string;
  criteria: JobFilterCriteria;
  isSaved: boolean;
  createdAt: Date;
  lastUsed?: Date;
};

export type JobFilterCriteria = {
  domain?: string;
  jobTitle?: string;
  keywords?: string[];
  contractType?: ContractType[];
  experienceLevel?: ExperienceLevel;
  experienceMinYears?: number;
  experienceMaxYears?: number;
  location?: string;
  locationRadius?: number;
  region?: string;
  salaryMin?: number;
  salaryMax?: number;
  companyName?: string;
  companySize?: CompanySize[];
  companySector?: string[];
  postedSince?: PostedSince;
  minMatchingScore?: number;
  requiredSkills?: string[];
  matchOperator?: 'AND' | 'OR' | 'WEIGHTED';
};

export type Dashboard = {
  id: string;
  directorId: string;
  name: string;
  widgets: DashboardWidget[];
  createdAt: Date;
  lastUpdated: Date;
};

export type DashboardWidget = {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  config: WidgetConfig;
};

export type SkillDemand = {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  demandCount: number;
  demandPercentage: number;
  growthRate: number;
  averageSalary?: number;
  topSectors: string[];
  topLocations: string[];
};

export type SkillGap = {
  skillId: string;
  skillName: string;
  marketDemandLevel: number;
  studentSupplyLevel: number;
  gapScore: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
};

export type TrainingRecommendation = {
  skillId: string;
  skillName: string;
  recommendation: string;
  suggestedCourses: string[];
  suggestedCertifications: string[];
  priority: number;
  estimatedDuration: string;
};

// Énumérations
export enum StudyLevel {
  BAC = 'BAC',
  BAC_2 = 'BAC+2',
  BAC_3 = 'BAC+3',
  BAC_4 = 'BAC+4',
  BAC_5 = 'BAC+5',
  MASTER = 'Master',
  DOCTORATE = 'Doctorat'
}

export enum WorkingMode {
  REMOTE = '100% Télétravail',
  HYBRID = 'Hybride',
  ONSITE = 'Sur site',
  FLEXIBLE = 'Flexible'
}

export enum ContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  STAGE = 'Stage',
  ALTERNANCE = 'Alternance',
  FREELANCE = 'Freelance',
  INTERIM = 'Intérim'
}

export enum ExperienceLevel {
  ENTRY_LEVEL = 'Débutant',
  JUNIOR = 'Junior',
  INTERMEDIATE = 'Intermédiaire',
  SENIOR = 'Senior',
  EXPERT = 'Expert'
}

export enum CompanySize {
  STARTUP = 'Startup',
  SMALL = 'PME (-50)',
  MEDIUM = 'PME (50-250)',
  LARGE = 'Grande Entreprise (250-5000)',
  CORPORATION = 'Multinationale (+5000)'
}

export enum PostedSince {
  LAST_24H = 'Dernières 24h',
  LAST_3_DAYS = '3 derniers jours',
  LAST_WEEK = '7 derniers jours',
  LAST_2_WEEKS = '15 derniers jours',
  LAST_MONTH = '30 derniers jours'
}

export enum SkillCategory {
  TECHNICAL = 'Technique',
  SOFT = 'Soft Skill',
  LANGUAGE = 'Langue',
  TOOLS = 'Outil',
  METHODOLOGY = 'Méthodologie'
}

export enum RecommendationStatus {
  PENDING = 'pending',
  VIEWED = 'viewed',
  APPLIED = 'applied',
  DISMISSED = 'dismissed'
}

export enum WidgetType {
  TOP_SKILLS = 'top_skills',
  TOP_JOB_TITLES = 'top_job_titles',
  TOP_SECTORS = 'top_sectors',
  SALARY_TRENDS = 'salary_trends',
  SKILL_EVOLUTION = 'skill_evolution',
  CONTRACT_TYPE_DISTRIBUTION = 'contract_type_distribution',
  EXPERIENCE_LEVEL_DISTRIBUTION = 'experience_level_distribution',
  SKILL_GAP = 'skill_gap',
  TRAINING_RECOMMENDATIONS = 'training_recommendations'
}

export type WidgetConfig = {
  chartType?: 'bar' | 'line' | 'pie' | 'radar';
  limit?: number;
  period?: 'week' | 'month' | 'year';
  refreshRate?: number;
};