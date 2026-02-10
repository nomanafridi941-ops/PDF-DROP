
import React from 'react';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
          <ShieldCheck size={32} />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">1. Core Privacy Principle</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              PDFDrop operates on a "Zero-Upload" architecture. Unlike traditional online PDF tools, <strong>we do not upload your files to our servers</strong>. All processing (compression and merging) happens locally within your web browser using WebAssembly technology. Your documents never leave your device.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">2. Data Collection</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We collect zero personal information. We do not require account registration, email addresses, or payment information. We may collect anonymous usage statistics (such as the number of files processed) to help improve performance, but this data is never linked to specific files or user identities.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">3. Local Storage</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We use your browser's local storage solely to maintain your session state (e.g., remembering your preferred compression level). No sensitive document data is persisted in storage after you close the tab.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">4. Changes to This Policy</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We may update our Privacy Policy from time to time. Since we do not collect contact information, we encourage you to review this page periodically for any changes.
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

export default PrivacyPolicy;
