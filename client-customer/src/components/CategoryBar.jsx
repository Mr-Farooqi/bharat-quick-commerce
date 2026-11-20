import React from 'react';

const CategoryBar = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="bg-white border-b border-slate-200/80 sticky top-[65px] z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-2.5 overflow-x-auto flex items-center gap-3 no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-yellow-400 text-slate-950 shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>🔥 All Categories</span>
        </button>

        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-yellow-400 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-5 h-5 rounded-md object-cover"
              />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;
