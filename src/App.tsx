import { useState } from 'react';
import { Company, Person, MarketEvent, ViewType, VerificationStatus, UserProfile, UserStatus, QualificationStatus, BantCriteria, OutreachLog, FieldVerificationState } from './types';
import { INITIAL_COMPANIES, INITIAL_PEOPLE, INITIAL_EVENTS } from './data/initialData';
import { 
  Building2, 
  Users, 
  Calendar, 
  LayoutDashboard, 
  Network,
  ArrowLeft,
  Shield,
  LogOut,
  Target,
  ListTodo
} from './components/Icons';
import { 
  CompanyFormModal, 
  PersonFormModal, 
  EventFormModal, 
  RelationshipFormModal 
} from './components/Modals';
import { 
  DashboardView, 
  CompaniesView, 
  CompanyDetailView, 
  PeopleView, 
  EventsView, 
  TasksView,
  NavItem 
} from './components/Views';
import { LoginScreen, UserProfileHeaderWidget } from './components/AuthAndProfile';
import { LeadQualifierPipelineView } from './components/LeadQualifierModule';

interface NavigationState {
  view: ViewType;
  companyId?: string | null;
}

export default function App() {
  // Navigation History Stack for Go Back functionality
  const [historyStack, setHistoryStack] = useState<NavigationState[]>([{ view: 'dashboard' }]);

  // Authentication & User Profile State
  const [user, setUser] = useState<UserProfile | null>(() => ({
    username: 'Prospect Research Executive',
    name: 'Prospect Research Executive',
    email: 'fahad@vortexen.com',
    role: 'Lead Prospect Researcher',
    module: 'PRE',
    department: 'Prospect Research & Intelligence (PRE)',
    status: 'Active',
    lastLogin: new Date().toLocaleString()
  }));

  // Database State
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [events, setEvents] = useState<MarketEvent[]>(INITIAL_EVENTS);

  // Modal States
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  const [isPersonModalOpen, setIsPersonModalOpen] = useState<boolean>(false);
  const [editingPerson, setEditingPerson] = useState<Partial<Person> | null>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<MarketEvent | null>(null);

  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState<boolean>(false);
  const [relationshipFocusCompany, setRelationshipFocusCompany] = useState<Company | null>(null);

  const currentNav = historyStack[historyStack.length - 1] || { view: 'dashboard' };
  const currentView = currentNav.view;
  const selectedCompanyId = currentNav.companyId || null;

  const navigateTo = (view: ViewType, companyId: string | null = null) => {
    if (currentNav.view === view && currentNav.companyId === companyId) return;
    setHistoryStack(prev => [...prev, { view, companyId }]);
  };

  const goBack = () => {
    if (historyStack.length > 1) {
      setHistoryStack(prev => prev.slice(0, prev.length - 1));
    } else {
      const defaultView: ViewType = user?.module === 'LQ' ? 'lq_qualification' : 'dashboard';
      if (currentView !== defaultView) {
        setHistoryStack([{ view: defaultView }]);
      }
    }
  };

  const handleStatusChange = (newStatus: UserStatus) => {
    if (user) {
      setUser({ ...user, status: newStatus });
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleLoginSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    if (loggedUser.module === 'LQ') {
      setHistoryStack([{ view: 'lq_qualification' }]);
    } else {
      setHistoryStack([{ view: 'dashboard' }]);
    }
  };

  const handleUpdateQualification = (
    companyId: string, 
    status: QualificationStatus, 
    score: number, 
    notes: string, 
    bant: BantCriteria
  ) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          qualificationStatus: status,
          qualificationScore: score,
          lqNotes: notes,
          qualifiedBy: user?.name || 'Lead Qualifier Executive',
          qualifiedAt: new Date().toISOString().split('T')[0],
          bant: bant
        };
      }
      return c;
    }));
  };

  const submitVerificationIssue = (companyId: string, issueCategory: string, details: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          verificationStatus: 'Comment Received',
          verificationIssue: 'orange',
          issueSummary: `[Verification Issue - ${issueCategory}] ${details || 'Inaccurate master data reported by Lead Qualifier.'}`
        };
      }
      return c;
    }));
  };

  const confirmReverified = (companyId: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          verificationStatus: 'Verified',
          verificationIssue: null,
          issueSummary: 'Master data re-verified by Lead Qualifier.'
        };
      }
      return c;
    }));
  };

  const completeVerificationTask = (companyId: string) => {
    setCompanies(prevCompanies => prevCompanies.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          verificationStatus: 'Pending Verification',
          verificationIssue: 'grey',
          issueSummary: 'PRE updated master data. Ready for LQ re-verification.'
        };
      }
      return c;
    }));
  };

  const saveCompany = (companyData: Partial<Company>, selectedEventIds?: string[], companyPeople?: Partial<Person>[]) => {
    const compId = companyData.id || `c${Date.now()}`;
    
    const existingCompany = companies.find(c => c.id === companyData.id);
    let defaultVerifStatus: VerificationStatus = existingCompany ? existingCompany.verificationStatus : 'Pending Verification';
    let defaultVerifIssue = existingCompany ? existingCompany.verificationIssue : 'grey';
    let defaultIssueSummary = existingCompany ? existingCompany.issueSummary : '';

    // PRE updates master data: if there was an active orange issue, transition to grey (Completion PRE -> LQ)
    if (existingCompany?.verificationIssue === 'orange') {
      defaultVerifStatus = 'Pending Verification';
      defaultVerifIssue = 'grey';
      defaultIssueSummary = 'PRE updated master data. Ready for LQ re-verification.';
    }

    let parentIdsArray = companyData.parentIds && Array.isArray(companyData.parentIds) 
      ? companyData.parentIds.filter(id => id && id.trim() !== '')
      : (companyData.parentId ? [companyData.parentId] : []);

    if (companyData.parentId && !parentIdsArray.includes(companyData.parentId)) {
      parentIdsArray.unshift(companyData.parentId);
    }

    if ((companyData.status === 'Acquired' || companyData.status === 'Merged') && companyData.statusTargetId) {
      if (!parentIdsArray.includes(companyData.statusTargetId)) {
        parentIdsArray = [...parentIdsArray, companyData.statusTargetId];
      }
    }

    const cleanedCompanyData: Company = {
      id: compId,
      name: companyData.name || 'Unnamed Company',
      country: companyData.country || '',
      address: companyData.address || '',
      phone: companyData.phone || '',
      email: companyData.email || '',
      website: companyData.website || '',
      linkedin: companyData.linkedin || '',
      offeringType: companyData.offeringType || 'Multiple',
      products: Array.isArray(companyData.products) ? companyData.products.filter(p => p && p.trim() !== '') : [],
      services: Array.isArray(companyData.services) ? companyData.services.filter(s => s && s.trim() !== '') : [],
      solutions: Array.isArray(companyData.solutions) ? companyData.solutions.filter(s => s && s.trim() !== '') : [],
      industries: companyData.industries || '',
      structure: companyData.structure || 'Parent',
      parentId: parentIdsArray[0] || null,
      parentIds: parentIdsArray,
      status: companyData.status || 'Active',
      statusTargetId: companyData.statusTargetId || null,
      verificationStatus: defaultVerifStatus,
      verificationIssue: defaultVerifIssue,
      issueSummary: defaultIssueSummary
    };

    setCompanies(prevCompanies => {
      const exists = prevCompanies.some(c => c.id === compId);
      return exists 
        ? prevCompanies.map(c => c.id === compId ? cleanedCompanyData : c)
        : [...prevCompanies, cleanedCompanyData];
    });

    if (selectedEventIds !== undefined) {
      setEvents(prevEvents => prevEvents.map(ev => {
        const isSelected = selectedEventIds.includes(ev.id);
        const hasCompany = ev.participatingCompanies.includes(compId);

        if (isSelected && !hasCompany) {
          return { ...ev, participatingCompanies: [...ev.participatingCompanies, compId] };
        } else if (!isSelected && hasCompany) {
          return { ...ev, participatingCompanies: ev.participatingCompanies.filter(id => id !== compId) };
        }
        return ev;
      }));
    }

    if (companyPeople && Array.isArray(companyPeople)) {
      const validPeople = companyPeople.filter(p => p.name && p.name.trim() !== '');
      setPeople(prevPeople => {
        const otherPeople = prevPeople.filter(p => p.companyId !== compId);
        const updatedPeople: Person[] = validPeople.map((p, idx) => ({
          id: p.id || `p_${compId}_${idx}_${Date.now()}`,
          companyId: compId,
          name: p.name || '',
          designation: p.designation || '',
          email: p.email || '',
          phone: p.phone || '',
          linkedin: p.linkedin || ''
        }));
        return [...otherPeople, ...updatedPeople];
      });
    }

    setIsCompanyModalOpen(false);
  };

  const handleAddToLqPipeline = (companyId: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          inLqPipeline: true,
          lqVerificationStatus: c.lqVerificationStatus || 'Unverified'
        };
      }
      return c;
    }));
  };

  const handleRemoveFromLqPipeline = (companyId: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          inLqPipeline: false
        };
      }
      return c;
    }));
  };

  const handleUpdateLqVerification = (companyId: string, status: 'Unverified' | 'In Progress' | 'Verified', notes?: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          lqVerificationStatus: status,
          lqVerificationNotes: notes !== undefined ? notes : c.lqVerificationNotes
        };
      }
      return c;
    }));
  };

  const handleAddOutreachLog = (companyId: string, log: OutreachLog) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        const existingLogs = c.outreachLogs || [];
        return {
          ...c,
          outreachLogs: [log, ...existingLogs]
        };
      }
      return c;
    }));
  };

  const handleUpdateCompanyOutreachState = (companyId: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return { ...c, ...updates };
      }
      return c;
    }));
  };

  const handleUpdateFieldVerification = (companyId: string, verification: FieldVerificationState) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          fieldVerification: verification
        };
      }
      return c;
    }));
  };

  const handleSaveRelationship = (focusCompanyId: string, relatedCompanyId: string, relationshipType: 'Parent' | 'Branch' | 'Subsidiary') => {
    setCompanies(prevCompanies => {
      return prevCompanies.map(c => {
        if (relationshipType === 'Parent') {
          if (c.id === focusCompanyId) {
            const currentParents = c.parentIds || (c.parentId ? [c.parentId] : []);
            const updatedParents = Array.from(new Set([...currentParents, relatedCompanyId]));
            return {
              ...c,
              parentIds: updatedParents,
              parentId: updatedParents[0] || null
            };
          }
        } else if (relationshipType === 'Branch') {
          if (c.id === relatedCompanyId) {
            const currentParents = c.parentIds || (c.parentId ? [c.parentId] : []);
            const updatedParents = Array.from(new Set([...currentParents, focusCompanyId]));
            return {
              ...c,
              structure: 'Branch',
              parentIds: updatedParents,
              parentId: updatedParents[0] || null
            };
          }
        } else if (relationshipType === 'Subsidiary') {
          if (c.id === relatedCompanyId) {
            const currentParents = c.parentIds || (c.parentId ? [c.parentId] : []);
            const updatedParents = Array.from(new Set([...currentParents, focusCompanyId]));
            return {
              ...c,
              structure: 'Subsidiary',
              parentIds: updatedParents,
              parentId: updatedParents[0] || null
            };
          }
        }
        return c;
      });
    });
    setIsRelationshipModalOpen(false);
  };

  const handleRemoveRelationship = (targetCompanyId: string, relatedCompanyId: string, relationshipType: 'Parent' | 'Branch' | 'Subsidiary') => {
    setCompanies(prevCompanies => {
      return prevCompanies.map(c => {
        if (relationshipType === 'Parent' && c.id === targetCompanyId) {
          const updatedParents = (c.parentIds || []).filter(id => id !== relatedCompanyId);
          return {
            ...c,
            parentIds: updatedParents,
            parentId: updatedParents[0] || null
          };
        } else if ((relationshipType === 'Branch' || relationshipType === 'Subsidiary') && c.id === relatedCompanyId) {
          const updatedParents = (c.parentIds || []).filter(id => id !== targetCompanyId);
          return {
            ...c,
            parentIds: updatedParents,
            parentId: updatedParents[0] || null,
            structure: updatedParents.length === 0 ? 'Parent' : c.structure
          };
        }
        return c;
      });
    });
  };

  const savePerson = (personData: Partial<Person>) => {
    if (personData.id) {
      setPeople(people.map(p => p.id === personData.id ? (personData as Person) : p));
    } else {
      setPeople([...people, { ...(personData as Person), id: `p${Date.now()}` }]);
    }
    setIsPersonModalOpen(false);
  };

  const saveEvent = (eventData: Partial<MarketEvent>) => {
    if (eventData.id) {
      setEvents(events.map(e => e.id === eventData.id ? (eventData as MarketEvent) : e));
    } else {
      setEvents([...events, { ...(eventData as MarketEvent), id: `e${Date.now()}` }]);
    }
    setIsEventModalOpen(false);
  };

  // Gate view if not authenticated
  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const openTasksCount = companies.filter(c => c.verificationIssue === 'orange').length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Network className="w-6 h-6 text-indigo-400" />
              MarketIntel DB
            </h1>
            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${
              user.module === 'LQ'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}>
              {user.module}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {user.module === 'LQ' ? 'LQ — Lead Qualifier Module' : 'PRE — Prospect Research Executive'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {user.module === 'LQ' ? (
            <>
              <NavItem 
                icon={<Target className="text-emerald-400" />} 
                label="Lead Qualification Pipeline" 
                active={currentView === 'lq_qualification'} 
                onClick={() => navigateTo('lq_qualification')} 
              />
              <NavItem 
                icon={<ListTodo className="text-amber-400" />} 
                label="Verification Tasks" 
                badge={openTasksCount > 0 ? openTasksCount : null}
                active={currentView === 'tasks'} 
                onClick={() => navigateTo('tasks')} 
              />
              <NavItem 
                icon={<Building2 />} 
                label="Prospects" 
                active={currentView === 'companies' || currentView === 'company_detail'} 
                onClick={() => navigateTo('companies')} 
              />
              <NavItem 
                icon={<Users />} 
                label="Key People" 
                active={currentView === 'people'} 
                onClick={() => navigateTo('people')} 
              />
              <NavItem 
                icon={<Calendar />} 
                label="Market Events" 
                active={currentView === 'events'} 
                onClick={() => navigateTo('events')} 
              />
            </>
          ) : (
            <>
              <NavItem 
                icon={<LayoutDashboard />} 
                label="Dashboard" 
                active={currentView === 'dashboard'} 
                onClick={() => navigateTo('dashboard')} 
              />
              <NavItem 
                icon={<ListTodo className="text-amber-400" />} 
                label="Tasks" 
                badge={openTasksCount > 0 ? openTasksCount : null}
                active={currentView === 'tasks'} 
                onClick={() => navigateTo('tasks')} 
              />
              <NavItem 
                icon={<Building2 />} 
                label="Prospect Database" 
                active={currentView === 'companies' || currentView === 'company_detail'} 
                onClick={() => navigateTo('companies')} 
              />
              <NavItem 
                icon={<Users />} 
                label="Key People" 
                active={currentView === 'people'} 
                onClick={() => navigateTo('people')} 
              />
              <NavItem 
                icon={<Calendar />} 
                label="Market Events" 
                active={currentView === 'events'} 
                onClick={() => navigateTo('events')} 
              />
            </>
          )}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className={`w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 ${
                user.module === 'LQ' ? 'bg-emerald-600' : 'bg-indigo-600'
              }`}>
                {user.module}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${
                    user.status === 'Active' ? 'bg-emerald-500' :
                    user.status === 'Busy' ? 'bg-rose-500' :
                    user.status === 'Break' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  <span className="text-[10px] font-medium text-slate-400 capitalize">{user.status}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Workspace Top Header Bar */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Go-Back Arrow Button */}
            <button
              onClick={goBack}
              disabled={historyStack.length <= 1 && ((user.module === 'LQ' && currentView === 'lq_qualification') || (user.module === 'PRE' && currentView === 'dashboard'))}
              title={historyStack.length > 1 ? "Go back to previous page" : "Go Back"}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition ${
                historyStack.length > 1 || ((user.module === 'LQ' && currentView !== 'lq_qualification') || (user.module === 'PRE' && currentView !== 'dashboard'))
                  ? 'bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 cursor-pointer shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Go Back</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div>
              <h2 className="text-xl font-bold capitalize text-slate-900 flex items-center gap-2">
                {currentView === 'company_detail' 
                  ? 'Prospect Profile & Relationships' 
                  : currentView === 'lq_qualification' 
                  ? 'Lead Qualification & BANT Workspace' 
                  : currentView.replace('_', ' ')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 hidden md:flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>PRE Master DB: <strong className="text-indigo-600">{companies.length} Records</strong></span>
              <span className="text-slate-300">|</span>
              <span>Tasks: <strong className="text-amber-600">{openTasksCount}</strong></span>
            </div>

            {/* Profile Details & Status Control Dropdown */}
            <UserProfileHeaderWidget
              user={user}
              onStatusChange={handleStatusChange}
              onLogout={handleLogout}
            />
          </div>
        </header>
        
        {/* Page Content View */}
        <main className="flex-1 overflow-auto p-6">
          {currentView === 'lq_qualification' && (
            <LeadQualifierPipelineView
              companies={companies}
              people={people}
              onUpdateQualification={handleUpdateQualification}
              onAddToLqPipeline={handleAddToLqPipeline}
              onUpdateLqVerification={handleUpdateLqVerification}
              onAddOutreachLog={handleAddOutreachLog}
              onUpdateCompanyOutreachState={handleUpdateCompanyOutreachState}
              onUpdateFieldVerification={handleUpdateFieldVerification}
              onSubmitVerificationIssue={submitVerificationIssue}
              onConfirmReverified={confirmReverified}
              navigateTo={navigateTo}
              goBack={goBack}
            />
          )}
          {currentView === 'dashboard' && (
            <DashboardView 
              companies={companies} 
              people={people} 
              events={events} 
              navigateTo={navigateTo} 
            />
          )}
          {currentView === 'companies' && (
            <CompaniesView 
              companies={companies} 
              navigateTo={navigateTo} 
              onAdd={() => { setEditingCompany(null); setIsCompanyModalOpen(true); }}
              goBack={goBack}
              userModule={user.module}
            />
          )}
          {currentView === 'company_detail' && (
            <CompanyDetailView 
              companyId={selectedCompanyId} 
              companies={companies} 
              people={people} 
              events={events} 
              navigateTo={navigateTo}
              onEdit={(c) => { setEditingCompany(c); setIsCompanyModalOpen(true); }}
              onAddPerson={() => { setEditingPerson({ companyId: selectedCompanyId || undefined }); setIsPersonModalOpen(true); }}
              onCompleteTask={completeVerificationTask}
              onSubmitVerificationIssue={submitVerificationIssue}
              onConfirmReverified={confirmReverified}
              onOpenAddRelationship={(comp) => {
                setRelationshipFocusCompany(comp);
                setIsRelationshipModalOpen(true);
              }}
              onRemoveRelationship={handleRemoveRelationship}
              onAddToLqPipeline={handleAddToLqPipeline}
              onRemoveFromLqPipeline={handleRemoveFromLqPipeline}
              goBack={goBack}
              userModule={user.module}
            />
          )}
          {currentView === 'people' && (
            <PeopleView 
              people={people} 
              companies={companies} 
              navigateTo={navigateTo}
              onAdd={() => { setEditingPerson(null); setIsPersonModalOpen(true); }}
              goBack={goBack}
              userModule={user.module}
            />
          )}
          {currentView === 'events' && (
            <EventsView 
              events={events} 
              companies={companies}
              onAdd={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
              onEdit={(e) => { setEditingEvent(e); setIsEventModalOpen(true); }}
              goBack={goBack}
              userModule={user.module}
            />
          )}
          {currentView === 'tasks' && (
            <TasksView 
              companies={companies} 
              navigateTo={navigateTo} 
              onCompleteTask={completeVerificationTask}
              onConfirmReverified={confirmReverified}
              goBack={goBack}
              userModule={user.module}
            />
          )}
        </main>
      </div>

      {/* Dynamic Dialog Modals */}
      {isCompanyModalOpen && (
        <CompanyFormModal 
          company={editingCompany} 
          allCompanies={companies} 
          allEvents={events}
          allPeople={people}
          onClose={() => setIsCompanyModalOpen(false)} 
          onSave={saveCompany} 
        />
      )}
      {isPersonModalOpen && (
        <PersonFormModal 
          person={editingPerson} 
          allCompanies={companies} 
          onClose={() => setIsPersonModalOpen(false)} 
          onSave={savePerson} 
        />
      )}
      {isEventModalOpen && (
        <EventFormModal 
          event={editingEvent} 
          allCompanies={companies} 
          onClose={() => setIsEventModalOpen(false)} 
          onSave={saveEvent} 
        />
      )}
      {isRelationshipModalOpen && relationshipFocusCompany && (
        <RelationshipFormModal 
          focusCompany={relationshipFocusCompany}
          allCompanies={companies}
          onClose={() => setIsRelationshipModalOpen(false)}
          onSave={handleSaveRelationship}
        />
      )}
    </div>
  );
}

