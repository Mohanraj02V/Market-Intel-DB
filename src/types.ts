export type CompanyStructure = 'Parent' | 'Branch' | 'Subsidiary';
export type CompanyStatus = 'Active' | 'Inactive' | 'Permanently Closed' | 'Acquired' | 'Merged';
export type VerificationStatus = 'Verified' | 'Pending Verification' | 'Comment Received';
export type OfferingType = 'Products' | 'Services' | 'Solutions' | 'Multiple';

export type QualificationStatus = 'Unqualified' | 'Hot Lead' | 'Qualified' | 'Nurture' | 'Disqualified';
export type CallStatus = 'Connected' | 'No Answer' | 'Busy' | 'Switched Off' | 'Invalid Number';

export type EmailProgress = 'Not Sent' | 'Invalid Email' | 'Sent' | 'Waiting for Response' | 'Received Response';

export type CommunicationOutcome = 
  | 'Requested Email' 
  | 'Call Back Later' 
  | 'Call Transferred' 
  | 'Shared Another Contact' 
  | 'Not Interested';

export interface OutreachLog {
  id: string;
  type: 'Call' | 'Email';
  callStatus?: CallStatus;
  notes: string;
  timestamp: string;
  actor?: string;
  subject?: string;
  emailProgress?: EmailProgress;
  communicationOutcome?: CommunicationOutcome;
  ivrExtension?: string;
}

export interface FieldVerificationState {
  companyName: boolean;
  country: boolean;
  address: boolean;
  website: boolean;
  linkedin: boolean;
  officialEmail: boolean;
  contactNumber: boolean;
  offerings: boolean;
}

export interface BantCriteria {
  budget: boolean;
  authority: boolean;
  need: boolean;
  timeline: boolean;
}

export interface Company {
  id: string;
  name: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  offeringType: OfferingType;
  products: string[];
  services: string[];
  solutions: string[];
  industries: string;
  structure: CompanyStructure;
  parentId?: string | null;
  parentIds: string[]; // Supports single or multiple parent companies
  status: CompanyStatus;
  statusTargetId?: string | null;
  verificationStatus: VerificationStatus;
  verificationIssue?: 'orange' | 'grey' | null;
  issueSummary?: string;
  // Lead Qualification (LQ) fields powered by PRE master data
  inLqPipeline?: boolean;
  lqVerificationStatus?: 'Unverified' | 'In Progress' | 'Verified';
  lqVerificationNotes?: string;
  fieldVerification?: FieldVerificationState;
  outreachLogs?: OutreachLog[];
  emailProgress?: EmailProgress;
  emailRecipients?: string[];
  lastEmailSubject?: string;
  ivrExtension?: string;
  lastCallStatus?: CallStatus;
  communicationOutcome?: CommunicationOutcome;
  callBackTime?: string;
  transferredPersonName?: string;
  transferredDesignation?: string;
  sharedContactName?: string;
  sharedContactDesignation?: string;
  sharedContactPhone?: string;
  sharedContactEmail?: string;
  notInterestedReason?: string;
  qualificationStatus?: QualificationStatus;
  qualificationScore?: number;
  lqNotes?: string;
  qualifiedBy?: string;
  qualifiedAt?: string;
  bant?: BantCriteria;
}

export interface Person {
  id: string;
  companyId: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  linkedin: string;
  isDecisionMaker?: boolean;
}

export type MarketEvent = {
  id: string;
  name: string;
  country: string;
  date: string;
  participatingCompanies: string[];
};

export type UserStatus = 'Active' | 'Busy' | 'Break' | 'Log out';
export type UserModule = 'PRE' | 'LQ';

export interface UserProfile {
  username: string;
  name: string;
  email: string;
  role: string;
  module: UserModule;
  department: string;
  status: UserStatus;
  lastLogin: string;
}

export type ViewType = 'dashboard' | 'companies' | 'company_detail' | 'people' | 'events' | 'lq_qualification' | 'lq_reports' | 'tasks';
