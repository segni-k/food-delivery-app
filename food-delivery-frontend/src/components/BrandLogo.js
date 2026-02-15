import React from 'react';

const BrandLogo = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#f97316_0%,#dc2626_58%,#166534_100%)] text-white shadow-lg shadow-orange-500/35">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
          <path
            fill="currentColor"
            d="M7.75 2a.75.75 0 0 1 .75.75V10a2.25 2.25 0 1 1-4.5 0V2.75a.75.75 0 0 1 1.5 0V6h1V2.75a.75.75 0 0 1 .75-.75Zm9.75 0c1.93 0 3.5 1.57 3.5 3.5V9a3.5 3.5 0 0 1-3.5 3.5V21a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 16.75 2Z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#f97316_0%,#dc2626_58%,#166534_100%)] text-white shadow-lg shadow-orange-500/35">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
          <path
            fill="currentColor"
            d="M7.75 2a.75.75 0 0 1 .75.75V10a2.25 2.25 0 1 1-4.5 0V2.75a.75.75 0 0 1 1.5 0V6h1V2.75a.75.75 0 0 1 .75-.75Zm9.75 0c1.93 0 3.5 1.57 3.5 3.5V9a3.5 3.5 0 0 1-3.5 3.5V21a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 16.75 2Z"
          />
        </svg>
      </div>
      <span>
        <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-orange-500">Food Delivery</span>
        <span className="block text-base font-black tracking-tight">HarerEats</span>
      </span>
    </div>
  );
};

export default BrandLogo;
