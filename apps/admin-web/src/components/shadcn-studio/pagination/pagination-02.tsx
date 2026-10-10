'use client';

import type { MouseEvent } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

type PageItem = number | 'ellipsis';

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = Array.from(new Set([
    1,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    totalPages,
  ].filter((page) => page >= 1 && page <= totalPages))).sort((a, b) => a - b);

  return pages.flatMap((page, index) => {
    const previousPage = pages[index - 1];
    return index > 0 && page - previousPage > 1
      ? ['ellipsis' as const, page]
      : [page];
  });
}

interface PaginationWithIconDemoProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const PaginationWithIconDemo = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationWithIconDemoProps) => {
  if (totalPages < 1) return null;

  const changePage = (event: MouseEvent<HTMLAnchorElement>, page: number) => {
    event.preventDefault();
    if (page >= 1 && page <= totalPages && page !== currentPage) onPageChange(page);
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="Trang trước"
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={currentPage <= 1 ? 'pointer-events-none opacity-40' : undefined}
            size="icon"
            onClick={(event) => changePage(event, currentPage - 1)}
          >
            <ChevronLeftIcon />
          </PaginationLink>
        </PaginationItem>
        {getPageItems(currentPage, totalPages).map((page, index) => (
          <PaginationItem key={page === 'ellipsis' ? `ellipsis-${index}` : page}>
            {page === 'ellipsis' ? (
              <span className="flex h-9 w-9 items-center justify-center text-slate-400" aria-hidden="true">…</span>
            ) : (
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                aria-label={`Đi tới trang ${page}`}
                onClick={(event) => changePage(event, page)}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="Trang tiếp theo"
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-40' : undefined}
            size="icon"
            onClick={(event) => changePage(event, currentPage + 1)}
          >
            <ChevronRightIcon />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationWithIconDemo;
