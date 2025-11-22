import React from 'react';

interface InfoModalProps {
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-card-bg border border-neon-green w-full max-w-2xl rounded-lg shadow-[0_0_30px_rgba(0,255,65,0.15)] relative overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/50">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
             <h2 className="text-xl font-mono font-bold text-white tracking-widest">SYSTEM_INFORMATION</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-neon-red transition-colors font-mono text-2xl leading-none focus:outline-none"
            aria-label="Close Modal"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 font-mono text-sm text-gray-300 custom-scrollbar">
          
          {/* Section 1: Mission */}
          <section>
            <h3 className="text-neon-green text-xs font-bold uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">
              01 // MISSION OBJECTIVE
            </h3>
            <p className="leading-relaxed">
              CryptoCult Scanner is an OSINT (Open Source Intelligence) tool designed to analyze the human element behind cryptocurrency protocols. 
              While many tools audit code, this system audits <span className="text-white">people</span>. It identifies cult-like behaviors, 
              personality cults, and potential red flags in leadership teams.
            </p>
          </section>

          {/* Section 2: Tech Stack */}
          <section>
            <h3 className="text-neon-green text-xs font-bold uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">
              02 // TECHNOLOGY & DATA
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-gray-500 min-w-[80px]">ENGINE:</span>
                <span className="text-white">Google Gemini 2.5 Flash (AI Model)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-500 min-w-[80px]">METHOD:</span>
                <span className="text-white">Real-time Google Search Grounding + Semantic Analysis</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-500 min-w-[80px]">DATA:</span>
                <span className="text-white">Public social profiles, news articles, forum discussions, and on-chain investigative reports.</span>
              </li>
            </ul>
          </section>

          {/* Section 3: Scoring Logic */}
          <section>
            <h3 className="text-neon-green text-xs font-bold uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">
              03 // CULT_SCORE_METRIC
            </h3>
            <div className="space-y-2">
              <p>The <span className="text-white">Cult Score (0-10)</span> is an AI-generated metric based on:</p>
              <ul className="list-disc list-inside text-gray-400 pl-2 space-y-1">
                <li>Aggregation of power/influence.</li>
                <li>Fanatical following or "army" behavior.</li>
                <li>Messianic language usage.</li>
                <li>Suppression of dissent or criticism.</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Disclaimer */}
          <section className="bg-red-900/10 border border-red-900/30 p-4 rounded">
            <h3 className="text-neon-red text-xs font-bold uppercase tracking-widest mb-2">
              WARNING // LIMITATIONS & DISCLAIMER
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              This tool is for <strong>entertainment and research purposes only</strong>. 
              <br/><br/>
              1. <strong>AI Hallucinations:</strong> Artificial Intelligence can make mistakes. Always verify the "Sources" link provided for every claim.
              <br/>
              2. <strong>No Financial Advice:</strong> A high "Cult Score" does not necessarily mean a scam, nor does a low score guarantee safety.
              <br/>
              3. <strong>Subjectivity:</strong> Diagnoses are generated based on public sentiment and may reflect internet bias.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-black/50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-neon-green text-black hover:bg-white px-6 py-2 rounded font-bold font-mono text-xs uppercase tracking-widest transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};