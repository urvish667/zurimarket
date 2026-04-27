import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalRows, limit }) => {
  if (totalPages <= 1) return null;

  // Calculate range of pages to show
  const range = 2;
  const pages = [];
  for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages, currentPage + range); i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4 border-t border-white/10">
      <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">
        Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalRows)} of {totalRows} results
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all ${
            currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5 hover:border-white/20 text-white'
          }`}
        >
          Prev
        </button>

        {pages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-8 h-8 flex items-center justify-center border border-white/10 text-[10px] font-black tracking-widest hover:bg-white/5 hover:border-white/20 text-white"
            >
              1
            </button>
            {pages[0] > 2 && <span className="text-white/30 font-black px-1">...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center border text-[10px] font-black tracking-widest transition-all ${
              currentPage === page
                ? 'bg-[#ddff5c] border-[#ddff5c] text-black'
                : 'border-white/10 text-white hover:bg-white/5 hover:border-white/20'
            }`}
          >
            {page}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="text-white/30 font-black px-1">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 flex items-center justify-center border border-white/10 text-[10px] font-black tracking-widest hover:bg-white/5 hover:border-white/20 text-white"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all ${
            currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5 hover:border-white/20 text-white'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
