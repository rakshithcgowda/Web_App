import { useState, useEffect } from 'react';
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
import { SuccessPopup } from '../SuccessPopup';
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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [generationTimeMs, setGenerationTimeMs] = useState(0);

  const calculatedValues = getCalculatedValues();

  const tabs = [
    { name: 'Preamble', icon: DocumentTextIcon },
    { name: 'Scope', icon: ClipboardDocumentListIcon },
    { name: 'BQC', icon: CheckCircleIcon },
    { name: 'Other', icon: Cog6ToothIcon },
    { name: 'Approval', icon: UserGroupIcon },
  ];

  const progressSteps = tabs.map((tab, index) => ({
    id: `step-${index}`,
    name: tab.name,
    description: `Complete ${tab.name.toLowerCase()} section`,
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
    if (bqcData.tenderType && bqcData.refNumber && bqcData.itemName) {
      newCompletedSections.add(0);
    }
    
    // Scope section completion check
    if (bqcData.scopeOfWork && bqcData.contractPeriodMonths) {
      newCompletedSections.add(1);
    }
    
    // BQC section completion check
    if (bqcData.manufacturerTypes && bqcData.manufacturerTypes.length > 0) {
      newCompletedSections.add(2);
    }
    
    // Other sections completion check
    if (bqcData.performanceSecurity !== undefined) {
      newCompletedSections.add(3);
    }
    
    // Approval section completion check
    if (bqcData.approvedBy) {
      newCompletedSections.add(4);
    }
    
    setCompletedSections(newCompletedSections);
  }, [bqcData]);

  const handleSave = async () => {
    const result = await saveBQCData();
    if (result.success) {
      setSuccessMessage(result.message || 'Data saved successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
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
      // Show success popup with generation time
      if (result.generationTimeMs !== undefined) {
        setGenerationTimeMs(result.generationTimeMs);
        setShowSuccessPopup(true);
      } else {
        // Fallback to old success message if time is not available
        setSuccessMessage('Document generated and downloaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Action Buttons Bar */}
      <div className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-center space-x-4">
              <Tooltip content="Load saved data" position="bottom">
                <button
                  onClick={handleLoad}
                  disabled={isLoading}
                  className="btn-purple flex items-center space-x-3 text-sm hover-lift px-6 py-3"
                >
                  <FolderOpenIcon className="h-5 w-5" />
                  <span>Load</span>
                </button>
              </Tooltip>
              
              <Tooltip content="Save current data" position="bottom">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="btn-warning flex items-center space-x-3 text-sm hover-lift px-6 py-3"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>{isLoading ? 'Saving...' : 'Save'}</span>
                </button>
              </Tooltip>
              
              <Tooltip content="Clear form" position="bottom">
                <button
                  onClick={handleClear}
                  disabled={isLoading}
                  className="btn-danger flex items-center space-x-3 text-sm hover-lift px-6 py-3"
                >
                  <TrashIcon className="h-5 w-5" />
                  <span>Clear</span>
                </button>
              </Tooltip>
              
              <Tooltip content="Generate document" position="bottom">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="btn-success flex items-center space-x-3 text-sm hover-lift px-6 py-3 relative"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span>{isLoading ? 'Generating...' : 'Generate'}</span>
                  {completedSections.size === tabs.length && (
                    <SparklesIcon className="h-5 w-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                  )}
                </button>
              </Tooltip>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Progress Indicator */}
        <ProgressIndicator steps={progressSteps} currentStep={currentTabIndex} />
        
        <Tab.Group selectedIndex={currentTabIndex} onChange={setCurrentTabIndex}>
          <Tab.List className="flex space-x-3 rounded-3xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-3 mb-10 shadow-inner border border-blue-200/50 backdrop-blur-sm">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-2xl py-4 px-6 text-sm font-semibold leading-5 transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:ring-offset-2',
                    selected
                      ? 'bg-white/90 text-blue-700 shadow-xl border border-blue-200/50 transform scale-105 backdrop-blur-sm'
                      : 'text-blue-600 hover:bg-white/60 hover:text-blue-800 hover:shadow-lg hover:scale-102'
                  )
                }
              >
                <div className="flex items-center justify-center space-x-3">
                  <tab.icon className="h-6 w-6" />
                  <span className="hidden sm:inline font-medium">{tab.name}</span>
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

      {/* Success Popup */}
      <SuccessPopup
        isVisible={showSuccessPopup}
        generationTimeMs={generationTimeMs}
        onClose={() => setShowSuccessPopup(false)}
      />
    </div>
  );
}
