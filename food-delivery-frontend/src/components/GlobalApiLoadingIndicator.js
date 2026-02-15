import React from 'react';
import { useApiUiStore } from '../store/apiUiStore';

const GlobalApiLoadingIndicator = () => {
  const pendingRequests = useApiUiStore((state) => state.pendingRequests);

  if (pendingRequests <= 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-[70]">
      <div className="h-1 w-full overflow-hidden bg-orange-200/40 dark:bg-orange-900/30">
        <div className="h-full w-1/3 animate-[api-loading_1s_ease-in-out_infinite] bg-orange-500" />
      </div>
    </div>
  );
};

export default GlobalApiLoadingIndicator;

