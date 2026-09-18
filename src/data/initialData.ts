import { Company, Person, MarketEvent } from '../types';

export const INITIAL_COMPANIES: Company[] = [
  { 
    id: 'c1', name: 'Global Tech Corp', country: 'United States', address: '123 Innovation Way, Silicon Valley, CA', phone: '+1 555-0199', offeringType: 'Multiple', products: ['Cloud Servers', 'Enterprise Software'], services: ['IT Consulting', 'Managed Hosting'], solutions: ['Digital Transformation'], industries: 'Technology, Finance', website: 'https://globaltech.example.com', linkedin: 'linkedin.com/company/globaltech', email: 'contact@globaltech.example.com', structure: 'Parent', parentId: null, parentIds: [], status: 'Active', statusTargetId: null,
    verificationStatus: 'Verified', verificationIssue: null, issueSummary: '',
    inLqPipeline: true, lqVerificationStatus: 'Verified',
    qualificationStatus: 'Hot Lead', qualificationScore: 92, lqNotes: 'High enterprise budget confirmed. Seeking full cloud migration Q3.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-08-02', bant: { budget: true, authority: true, need: true, timeline: true }
  },
  { 
    id: 'c2', name: 'Global Tech Corp - Europe Branch', country: 'United Kingdom', address: '45 Silicon Roundabout, London', phone: '+44 20 7123 4567', offeringType: 'Services', products: [], services: ['Local Support', 'Implementation'], solutions: [], industries: 'Technology', website: 'https://eu.globaltech.example.com', linkedin: 'linkedin.com/company/globaltech-eu', email: 'hello@eu.globaltech.example.com', structure: 'Branch', parentId: 'c1', parentIds: ['c1'], status: 'Active', statusTargetId: null,
    verificationStatus: 'Comment Received', verificationIssue: 'orange', issueSummary: 'Branch contact phone number unreachable & HQ address moved to London Wall.',
    inLqPipeline: true, lqVerificationStatus: 'In Progress',
    qualificationStatus: 'Qualified', qualificationScore: 78, lqNotes: 'Branch decision requires UK Director signoff.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-08-01', bant: { budget: true, authority: false, need: true, timeline: true }
  },
  { 
    id: 'c3', name: 'Legacy Solutions', country: 'Canada', address: '78 Maple Street, Toronto', phone: '+1 416-555-0198', offeringType: 'Solutions', products: [], services: [], solutions: ['Data Storage', 'Mainframe Backup'], industries: 'Manufacturing', website: 'https://legacy.example.com', linkedin: 'linkedin.com/company/legacysolutions', email: 'info@legacy.example.com', structure: 'Subsidiary', parentId: 'c1', parentIds: ['c1'], status: 'Acquired', statusTargetId: 'c1',
    verificationStatus: 'Pending Verification', verificationIssue: 'grey', issueSummary: 'Updated data submitted after acquisition review. Pending final signoff.',
    inLqPipeline: false, lqVerificationStatus: 'Unverified',
    qualificationStatus: 'Unqualified', qualificationScore: 55, lqNotes: 'Acquisition integration pending. Revisit in 6 months.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-07-28', bant: { budget: true, authority: false, need: true, timeline: false }
  },
  { 
    id: 'c4', name: 'Apex Health Systems', country: 'Switzerland', address: '12 Medical Park, Geneva', phone: '+41 22 555 0100', offeringType: 'Products', products: ['MRI Scanners', 'Surgical Lasers'], services: [], solutions: [], industries: 'Healthcare', website: 'https://apexhealth.example.com', linkedin: 'linkedin.com/company/apexhealth', email: 'contact@apexhealth.example.com', structure: 'Parent', parentId: null, parentIds: [], status: 'Active', statusTargetId: null,
    verificationStatus: 'Pending Verification', verificationIssue: 'grey', issueSummary: '',
    inLqPipeline: true, lqVerificationStatus: 'Verified',
    qualificationStatus: 'Hot Lead', qualificationScore: 88, lqNotes: 'Budget approved for 5 regional hospital upgrades.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-08-03', bant: { budget: true, authority: true, need: true, timeline: true }
  },
  { 
    id: 'c5', name: 'Apex Health Systems - North America Branch', country: 'United States', address: '400 Wellness Blvd, Boston, MA', phone: '+1 617-555-1234', offeringType: 'Services', products: [], services: ['Outpatient Care', 'Diagnostics'], solutions: [], industries: 'Healthcare', website: 'https://clinics.apexhealth.example.com', linkedin: 'linkedin.com/company/apexclinics-na', email: 'info@clinics.apexhealth.example.com', structure: 'Branch', parentId: 'c4', parentIds: ['c4'], status: 'Active', statusTargetId: null,
    verificationStatus: 'Comment Received', verificationIssue: 'orange', issueSummary: 'Official email domain bouncing. Secondary clinic contact details unverified.',
    inLqPipeline: false, lqVerificationStatus: 'Unverified',
    qualificationStatus: 'Unqualified', qualificationScore: 35, lqNotes: 'Contact info bouncing. Need PRE master data re-verification before qualifying.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-08-03', bant: { budget: false, authority: false, need: true, timeline: false }
  },
  { 
    id: 'c6', name: 'Nexus Financial Group', country: 'Singapore', address: '8 Marina View, Singapore', phone: '+65 6555 1000', offeringType: 'Services', products: [], services: ['Investment Banking', 'Wealth Management'], solutions: [], industries: 'Finance', website: 'https://nexusfinance.example.com', linkedin: 'linkedin.com/company/nexusfinance', email: 'investments@nexusfinance.example.com', structure: 'Parent', parentId: null, parentIds: [], status: 'Active', statusTargetId: null,
    verificationStatus: 'Verified', verificationIssue: null, issueSummary: '',
    inLqPipeline: true, lqVerificationStatus: 'Verified',
    qualificationStatus: 'Qualified', qualificationScore: 82, lqNotes: 'Financial wealth arm seeking compliance tools.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-08-01', bant: { budget: true, authority: true, need: true, timeline: false }
  },
  { 
    id: 'c7', name: 'Quantum Logistics', country: 'Germany', address: '50 Autobahn Ring, Frankfurt', phone: '+49 69 555 0200', offeringType: 'Solutions', products: [], services: [], solutions: ['Supply Chain Optimization', 'Freight Tracking'], industries: 'Logistics, Transportation', website: 'https://quantumlogistics.example.com', linkedin: 'linkedin.com/company/quantumlogistics', email: 'hello@quantumlogistics.example.com', structure: 'Parent', parentId: null, parentIds: [], status: 'Active', statusTargetId: null,
    verificationStatus: 'Pending Verification', verificationIssue: 'grey', issueSummary: '',
    inLqPipeline: false, lqVerificationStatus: 'Unverified',
    qualificationStatus: 'Unqualified', qualificationScore: 40, lqNotes: 'Initial contact made. Waiting for logistics manager decision timeframe.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-08-02', bant: { budget: false, authority: false, need: true, timeline: false }
  },
  { 
    id: 'c8', name: 'Quantum Logistics - Asia Operations', country: 'Japan', address: '1-1 Minato-ku, Tokyo', phone: '+81 3 5555 0300', offeringType: 'Solutions', products: [], services: [], solutions: ['Regional Distribution'], industries: 'Logistics', website: 'https://asia.quantumlogistics.example.com', linkedin: 'linkedin.com/company/quantum-asia', email: 'tokyo@quantumlogistics.example.com', structure: 'Branch', parentId: 'c7', parentIds: ['c7'], status: 'Active', statusTargetId: null,
    verificationStatus: 'Comment Received', verificationIssue: 'orange', issueSummary: 'Primary industry classification missing distribution codes.',
    inLqPipeline: false, lqVerificationStatus: 'Unverified',
    qualificationStatus: 'Nurture', qualificationScore: 60, lqNotes: 'Asia expansion planned Q4.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-07-30', bant: { budget: true, authority: false, need: true, timeline: false }
  },
  { 
    id: 'c9', name: 'Stellar AI Holdings', country: 'United States', address: '99 Neural Net Lane, Austin, TX', phone: '+1 512-555-0400', offeringType: 'Multiple', products: ['AI Co-pilot', 'Vision Models'], services: ['Custom Model Training'], solutions: ['Automated Support'], industries: 'Technology, AI', website: 'https://stellar.example.com', linkedin: 'linkedin.com/company/stellarai', email: 'sales@stellar.example.com', structure: 'Parent', parentId: null, parentIds: [], status: 'Active', statusTargetId: null,
    verificationStatus: 'Verified', verificationIssue: null, issueSummary: '',
    inLqPipeline: true, lqVerificationStatus: 'Verified',
    qualificationStatus: 'Hot Lead', qualificationScore: 95, lqNotes: 'Immediate requirement for enterprise scaling support.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-08-04', bant: { budget: true, authority: true, need: true, timeline: true }
  },
  { 
    id: 'c10', name: 'Horizon Energy', country: 'Australia', address: '200 Solar Way, Sydney', phone: '+61 2 5550 0500', offeringType: 'Products', products: ['Solar Panels', 'Wind Turbines'], services: [], solutions: [], industries: 'Energy, Utilities', website: 'https://horizonenergy.example.com', linkedin: 'linkedin.com/company/horizonenergy', email: 'contact@horizonenergy.example.com', structure: 'Parent', parentId: null, parentIds: [], status: 'Active', statusTargetId: null,
    verificationStatus: 'Pending Verification', verificationIssue: 'grey', issueSummary: '',
    inLqPipeline: false, lqVerificationStatus: 'Unverified',
    qualificationStatus: 'Qualified', qualificationScore: 75, lqNotes: 'Government solar grant recipient.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-08-01', bant: { budget: true, authority: true, need: true, timeline: false }
  },
  { 
    id: 'c11', name: 'GreenTech Solar Solutions', country: 'Australia', address: '15 Outback Rd, Perth', phone: '+61 8 5550 0600', offeringType: 'Products', products: ['Residential Solar Kits'], services: [], solutions: [], industries: 'Energy', website: 'https://greentech.example.com', linkedin: 'linkedin.com/company/greentechsolar', email: 'sales@greentech.example.com', structure: 'Subsidiary', parentId: 'c10', parentIds: ['c10', 'c7'], status: 'Active', statusTargetId: null,
    verificationStatus: 'Pending Verification', verificationIssue: 'grey', issueSummary: '',
    inLqPipeline: false, lqVerificationStatus: 'Unverified',
    qualificationStatus: 'Unqualified', qualificationScore: 45, lqNotes: 'Small retail scope.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-07-29', bant: { budget: false, authority: true, need: false, timeline: false }
  },
  { 
    id: 'c12', name: 'Pioneer Robotics', country: 'South Korea', address: '88 Robot Street, Seoul', phone: '+82 2 555 0700', offeringType: 'Multiple', products: ['Industrial Arms'], services: ['Maintenance'], solutions: ['Factory Automation'], industries: 'Manufacturing', website: 'https://pioneerrobotics.example.com', linkedin: 'linkedin.com/company/pioneerrobotics', email: 'hello@pioneerrobotics.example.com', structure: 'Subsidiary', parentId: 'c9', parentIds: ['c9', 'c1'], status: 'Acquired', statusTargetId: 'c9',
    verificationStatus: 'Verified', verificationIssue: null, issueSummary: '',
    inLqPipeline: false, lqVerificationStatus: 'Unverified',
    qualificationStatus: 'Disqualified', qualificationScore: 20, lqNotes: 'Does not meet minimum company revenue threshold.', qualifiedBy: 'Lead Qualifier', qualifiedAt: '2026-07-25', bant: { budget: false, authority: false, need: false, timeline: false }
  }
];

export const INITIAL_PEOPLE: Person[] = [
  { id: 'p1', companyId: 'c1', name: 'Sarah Jenkins', designation: 'Chief Executive Officer', email: 's.jenkins@globaltech.example.com', phone: '+1 555-0101', linkedin: 'linkedin.com/in/sarahjenkins' },
  { id: 'p2', companyId: 'c1', name: 'David Chen', designation: 'Chief Technology Officer', email: 'd.chen@globaltech.example.com', phone: '+1 555-0102', linkedin: 'linkedin.com/in/davidchen-tech' },
  { id: 'p3', companyId: 'c2', name: 'Marcus Sterling', designation: 'Managing Director EU', email: 'm.sterling@eu.globaltech.example.com', phone: '+44 20 7946 0958', linkedin: 'linkedin.com/in/marcussterling' },
  { id: 'p4', companyId: 'c3', name: 'Elena Rostova', designation: 'VP of Data Strategy', email: 'e.rostova@legacy.example.com', phone: '+1 416-555-0199', linkedin: 'linkedin.com/in/elenarostova' },
  { id: 'p5', companyId: 'c4', name: 'Dr. Lukas Weber', designation: 'Head of Biomedical R&D', email: 'l.weber@apexhealth.example.com', phone: '+41 22 555 0101', linkedin: 'linkedin.com/in/lukasweber-med' },
  { id: 'p6', companyId: 'c5', name: 'Claire Dupont', designation: 'Operations Director', email: 'c.dupont@clinics.apexhealth.example.com', phone: '+1 617-555-1235', linkedin: 'linkedin.com/in/clairedupont' },
  { id: 'p7', companyId: 'c6', name: 'Tan Wei Ming', designation: 'Managing Director & CIO', email: 'wm.tan@nexusfinance.example.com', phone: '+65 6555 1001', linkedin: 'linkedin.com/in/tanweiming' },
  { id: 'p8', companyId: 'c7', name: 'Hans Mueller', designation: 'Chief Logistics Officer', email: 'h.mueller@quantumlogistics.example.com', phone: '+49 69 555 0201', linkedin: 'linkedin.com/in/hansmueller' },
  { id: 'p9', companyId: 'c8', name: 'Kenji Sato', designation: 'Regional Vice President', email: 'k.sato@asia.quantumlogistics.example.com', phone: '+81 3 5555 0301', linkedin: 'linkedin.com/in/kenjisato' },
  { id: 'p10', companyId: 'c9', name: 'Dr. Evelyn Vance', designation: 'Chief AI Scientist', email: 'e.vance@stellar.example.com', phone: '+1 512-555-0401', linkedin: 'linkedin.com/in/evelynvance' }
];

export const INITIAL_EVENTS: MarketEvent[] = [
  { id: 'e1', name: 'Web Summit 2026', country: 'Portugal', date: '2026-11-02', participatingCompanies: ['c1', 'c2', 'c9'] },
  { id: 'e2', name: 'CES 2026', country: 'United States', date: '2026-01-05', participatingCompanies: ['c1', 'c4', 'c9'] },
  { id: 'e3', name: 'MEDICA Trade Fair 2026', country: 'Germany', date: '2026-11-16', participatingCompanies: ['c4', 'c5'] },
  { id: 'e4', name: 'Finovate Asia 2026', country: 'Singapore', date: '2026-06-22', participatingCompanies: ['c6'] }
];

export const getCompanyParents = (comp: Company | null, allComps: Company[]): Company[] => {
  if (!comp) return [];
  const pIds = Array.isArray(comp.parentIds) && comp.parentIds.length > 0 
    ? [...comp.parentIds] 
    : (comp.parentId ? [comp.parentId] : []);
  
  if ((comp.status === 'Acquired' || comp.status === 'Merged') && comp.statusTargetId) {
    if (!pIds.includes(comp.statusTargetId)) {
      pIds.push(comp.statusTargetId);
    }
  }
  return allComps.filter(c => pIds.includes(c.id));
};

export const getCompanyBranches = (comp: Company | null, allComps: Company[]): Company[] => {
  if (!comp) return [];
  return allComps.filter(c => c.id !== comp.id && c.structure === 'Branch' && (
    (Array.isArray(c.parentIds) && c.parentIds.includes(comp.id)) || c.parentId === comp.id
  ));
};

export const getCompanySubsidiaries = (comp: Company | null, allComps: Company[]): Company[] => {
  if (!comp) return [];
  return allComps.filter(c => c.id !== comp.id && (
    (((Array.isArray(c.parentIds) && c.parentIds.includes(comp.id)) || c.parentId === comp.id) && c.structure === 'Subsidiary') ||
    ((c.status === 'Acquired' || c.status === 'Merged') && c.statusTargetId === comp.id)
  ));
};
