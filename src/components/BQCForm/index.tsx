import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useBQC } from '@/hooks/useBQC';
import { PreambleSection } from './PreambleSection';
import { ScopeSection } from './ScopeSection';
import { BQCSection } from './BQCSection';
import { OtherSection } from './OtherSection';
import { ApprovalSection } from './ApprovalSection';
import { LoadDataModal } from '../LoadDataModal';
import { ProgressIndicator } from '../ProgressIndicator';
import { Tooltip } from '../Tooltip';
import { FormStats } from '../FormStats';
import { 
  DocumentTextIcon, 
  ClipboardDocumentListIcon, 
  CheckCircleIcon, 
  Cog6ToothIcon, 
  UserGroupIcon,
  FolderOpenIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function BQCForm() {
  const {
    bqcData,
    savedEntries,
    isLoading,
    error,
    updateBQCData,
    getCalculatedValues,
    saveBQCData,
    loadBQCData,
    loadSavedEntries,
    generateDocument,
    clearBQCData,
    validateCurrentData,
    setError
  } = useBQC();

  const [showLoadModal, setShowLoadModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  const calculatedValues = getCalculatedValues();

  const tabs = [
    { name: 'Preamble', icon: DocumentTextIcon, description: 'Basic tender information' },
    { name: 'Scope of Work', icon: ClipboardDocumentListIcon, description: 'Work details and contract terms' },
    { name: 'BQC Criteria', icon: CheckCircleIcon, description: 'Qualification requirements' },
    { name: 'Other Sections', icon: Cog6ToothIcon, description: 'Additional requirements' },
    { name: 'Approval', icon: UserGroupIcon, description: 'Final approval details' },
  ];

  const progressSteps = tabs.map((tab, index) => ({
    id: `step-${index}`,
    name: tab.name,
    description: tab.description,
    status: completedSections.has(index) 
      ? 'complete' as const
      : index === currentTabIndex 
        ? 'current' as const 
        : 'upcoming' as const
  }));

  // Check section completion
  useEffect(() => {
    const newCompletedSections = new Set<number>();
    
    // Preamble section completion check
    if (bqcData.tenderType && bqcData.tenderNumber && bqcData.tenderTitle) {
      newCompletedSections.add(0);
    }
    
    // Scope section completion check
    if (bqcData.scopeOfWork && bqcData.contractPeriodYears) {
      newCompletedSections.add(1);
    }
    
    // BQC section completion check
    if (bqcData.manufacturerType && bqcData.groupOption) {
      newCompletedSections.add(2);
    }
    
    // Other sections completion check
    if (bqcData.performanceBankGuarantee !== undefined) {
      newCompletedSections.add(3);
    }
    
    // Approval section completion check
    if (bqcData.approvalAuthority) {
      newCompletedSections.add(4);
    }
    
    setCompletedSections(newCompletedSections);
  }, [bqcData]);

  const handleSave = async () => {
    const result = await saveBQCData();
    if (result.success) {
      setSuccessMessage('Data saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleLoad = async () => {
    await loadSavedEntries();
    setShowLoadModal(true);
  };

  const handleLoadData = async (id: number) => {
    const result = await loadBQCData(id);
    if (result.success) {
      setShowLoadModal(false);
      setSuccessMessage('Data loaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all form data?')) {
      clearBQCData();
      setSuccessMessage('Form cleared successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleGenerate = async () => {
    const validation = validateCurrentData();
    if (!validation.isValid) {
      setError(`Please fix the following errors: ${validation.errors.map(e => e.message).join(', ')}`);
      return;
    }

    const result = await generateDocument('docx');
    if (result.success) {
      setSuccessMessage('Document generated and downloaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">BQC Document Generator</h1>
                  <p className="text-sm text-gray-600 font-medium">Bid Qualification Criteria Generator for Procurement</p>
                </div>
              </div>
              
              {/* Enhanced Action Buttons with Tooltips */}
              <div className="flex items-center space-x-3">
                <Tooltip content="Load previously saved BQC data" position="bottom">
                  <button
                    onClick={handleLoad}
                    disabled={isLoading}
                    className="btn-purple flex items-center space-x-2 text-sm hover-lift"
                  >
                    <FolderOpenIcon className="h-4 w-4" />
                    <span>Load Data</span>
                  </button>
                </Tooltip>
                
                <Tooltip content="Save current form data for later use" position="bottom">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn-warning flex items-center space-x-2 text-sm hover-lift"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : 'Save Data'}</span>
                  </button>
                </Tooltip>
                
                <Tooltip content="Clear all form data and start fresh" position="bottom">
                  <button
                    onClick={handleClear}
                    disabled={isLoading}
                    className="btn-danger flex items-center space-x-2 text-sm hover-lift"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Clear Form</span>
                  </button>
                </Tooltip>
                
                <Tooltip content="Generate and download the BQC document" position="bottom">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="btn-success flex items-center space-x-2 text-sm hover-lift relative"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span>{isLoading ? 'Generating...' : 'Generate Document'}</span>
                    {completedSections.size === tabs.length && (
                      <SparklesIcon className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Messages */}
      {(error || successMessage) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {error && (
            <div className="status-error animate-in slide-in-from-top-2 duration-300 mb-4">
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="status-success animate-in slide-in-from-top-2 duration-300 mb-4">
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">{successMessage}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Statistics */}
        <FormStats 
          completedSections={completedSections.size}
          totalSections={tabs.length}
          estimatedValue={bqcData.cecEstimateInclGst}
          lastSaved={undefined} // TODO: Add last saved timestamp to BQC data
        />
        
        {/* Progress Indicator */}
        <ProgressIndicator steps={progressSteps} currentStep={currentTabIndex} />
        
        <Tab.Group selectedIndex={currentTabIndex} onChange={setCurrentTabIndex}>
          <Tab.List className="flex space-x-2 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-2 mb-8 shadow-inner border border-blue-100">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-xl py-3 px-4 text-sm font-semibold leading-5 transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2',
                    selected
                      ? 'bg-white text-blue-700 shadow-lg border border-blue-200 transform scale-105'
                      : 'text-blue-600 hover:bg-white/50 hover:text-blue-800 hover:shadow-md'
                  )
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels>
            <Tab.Panel>
              <PreambleSection 
                data={bqcData} 
                onChange={updateBQCData} 
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <ScopeSection 
                data={bqcData} 
                onChange={updateBQCData}
                calculatedValues={calculatedValues}
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <BQCSection 
                data={bqcData} 
                onChange={updateBQCData}
                calculatedValues={calculatedValues}
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <OtherSection 
                data={bqcData} 
                onChange={updateBQCData}
                calculatedValues={calculatedValues}
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <ApprovalSection 
                data={bqcData} 
                onChange={updateBQCData} 
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Load Data Modal */}
      {showLoadModal && (
        <LoadDataModal
          entries={savedEntries}
          isLoading={isLoading}
          onClose={() => setShowLoadModal(false)}
          onLoad={handleLoadData}
        />
      )}
    </div>
  );
}
