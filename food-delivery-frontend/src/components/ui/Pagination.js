import React from 'react';
import Button from './Button';

const buildPageRange = (currentPage, totalPages) => {
  const safeTotal = Math.max(1, totalPages);
  const pages = [];

  for (let page = 1; page <= safeTotal; page += 1) {
    pages.push(page);
  }

  return pages;
};

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  showPageNumbers = true,
}) => {
  const pages = buildPageRange(currentPage, totalPages);

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
      aria-label="Pagination Navigation"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        aria-label="Previous page"
      >
        Previous
      </Button>

      {showPageNumbers
        ? pages.map((page) => (
            <Button
              key={`pagination-page-${page}`}
              variant={page === currentPage ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange?.(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </Button>
          ))
        : null}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        aria-label="Next page"
      >
        Next
      </Button>
    </nav>
  );
};

export default Pagination;

