
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-3 py-10 mt-6">
      <button className="p-2 text-gray-400 hover:text-[#40a28f] transition-colors">
        <ChevronLeft className="h-5 w-5" />
      </button>

      {[1, 2, 3].map((page) => (
        <button
          key={page}
          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${page === 1
              ? "bg-[#40a28f] text-white shadow-lg shadow-[#40a28f]/20 scale-110"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
        >
          {page}
        </button>
      ))}

      <button className="p-2 text-gray-400 hover:text-[#40a28f] transition-colors">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;
