
import React from 'react';
import { FileText } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-8">
          <FileText size={32} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight">Terms of Service</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              By accessing and using PDFDrop, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">2. Use of Service</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              PDFDrop provides browser-based tools for PDF manipulation. You are responsible for the files you process. You agree not to use the service for any illegal purposes, including but not limited to processing copyrighted material without authorization.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">3. Disclaimer of Warranties</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The service is provided on an "AS IS" and "AS AVAILABLE" basis. PDFDrop makes no warranties, expressed or implied, regarding the reliability, accuracy, or availability of the service. We are not liable for any data loss resulting from the use of our tools.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">4. Intellectual Property</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              PDFDrop retains all rights to the interface, logo, and code. You retain full ownership and rights to the documents you process using our tool.
            </p>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
