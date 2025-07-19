import React from 'react';
import { Search, TrendingUp, Clock, Star } from 'lucide-react';

export function Discover() {
  const categories = [
    { name: 'Cookies', icon: '🍪', count: 42 },
    { name: 'Cakes', icon: '🎂', count: 38 },
    { name: 'Breads', icon: '🍞', count: 25 },
    { name: 'Pastries', icon: '🥐', count: 31 },
    { name: 'Pies', icon: '🥧', count: 19 },
    { name: 'Muffins', icon: '🧁', count: 28 }
  ];

  const trending = [
    { name: 'Sourdough Starter', trend: '+24%' },
    { name: 'Chocolate Chip', trend: '+18%' },
    { name: 'Banana Bread', trend: '+15%' },
    { name: 'Red Velvet', trend: '+12%' }
  ];

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#E0C7D0] p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-[#3B3B3B] mb-4">Discover</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5E5E5E]" size={20} />
          <input
            type="text"
            placeholder="Search recipes, ingredients..."
            className="w-full pl-10 pr-4 py-3 border border-[#E0C7D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F8BFCB] focus:border-transparent"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Categories */}
        <div>
          <h2 className="text-lg font-semibold text-[#3B3B3B] mb-4">Categories</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                className="bg-white border border-[#E0C7D0] rounded-xl p-4 hover:bg-[#FFF5F7] transition-colors"
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-left">
                  <div className="font-medium text-[#3B3B3B]">{category.name}</div>
                  <div className="text-sm text-[#5E5E5E]">{category.count} recipes</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#EF6D9F]" />
            <h2 className="text-lg font-semibold text-[#3B3B3B]">Trending Now</h2>
          </div>
          <div className="space-y-3">
            {trending.map((item, index) => (
              <div
                key={item.name}
                className="bg-white border border-[#E0C7D0] rounded-xl p-4 flex items-center justify-between hover:bg-[#FFF5F7] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#F8BFCB] rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-[#3B3B3B]">{index + 1}</span>
                  </div>
                  <span className="font-medium text-[#3B3B3B]">{item.name}</span>
                </div>
                <span className="text-sm text-[#38B48B] font-medium">{item.trend}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <h2 className="text-lg font-semibold text-[#3B3B3B] mb-4">Quick Filters</h2>
          <div className="grid grid-cols-1 gap-3">
            <button className="bg-white border border-[#E0C7D0] rounded-xl p-4 flex items-center space-x-3 hover:bg-[#FFF5F7] transition-colors">
              <Clock className="w-5 h-5 text-[#EF6D9F]" />
              <span className="font-medium text-[#3B3B3B]">Quick Bakes (Under 30 min)</span>
            </button>
            <button className="bg-white border border-[#E0C7D0] rounded-xl p-4 flex items-center space-x-3 hover:bg-[#FFF5F7] transition-colors">
              <Star className="w-5 h-5 text-[#EF6D9F]" />
              <span className="font-medium text-[#3B3B3B]">Highly Rated</span>
            </button>
          </div>
        </div>

        {/* Recent Searches */}
        <div>
          <h2 className="text-lg font-semibold text-[#3B3B3B] mb-4">Recent Searches</h2>
          <div className="flex flex-wrap gap-2">
            {['chocolate cake', 'banana bread', 'cookies'].map((search) => (
              <button
                key={search}
                className="px-3 py-2 bg-[#FFF5F7] border border-[#E0C7D0] rounded-lg text-sm text-[#5E5E5E] hover:bg-[#F8BFCB] hover:text-[#3B3B3B] transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}