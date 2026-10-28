import React from 'react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-full bg-[#141414] border border-[#242424] flex items-center justify-center text-[#E50914] mb-4 text-2xl font-bold font-heading">
        !
      </div>
      <h1 className="text-2xl font-heading font-extrabold mb-2 text-white">You are currently offline</h1>
      <p className="text-sm text-[#AAAAAA] max-w-md mb-6 leading-relaxed">
        Daymark operates locally and your offline drafts and cached views are protected. When your network connection returns, synchronisation will resume automatically.
      </p>
      <a
        href="/"
        className="px-5 py-2.5 bg-[#E50914] hover:bg-[#C11119] text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Return to Dashboard
      </a>
    </div>
  );
}
