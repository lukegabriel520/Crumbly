import React from 'react';
import { Heart, Clock, Users, BookOpen } from 'lucide-react';

export function Saved() {
  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#E0C7D0] p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-[#3B3B3B]">Saved Recipes</h1>
        <p className="text-[#5E5E5E]">Your favorite baking recipes</p>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Empty State */}
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-[#FFF5F7] border-2 border-dashed border-[#E0C7D0] rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-[#E0C7D0]" />
          </div>
          <h3 className="text-xl font-semibold text-[#3B3B3B] mb-2">No saved recipes yet</h3>
          <p className="text-[#5E5E5E] mb-6">
            Heart recipes you love to save them here for quick access
          </p>
          <button className="px-6 py-3 bg-[#EF6D9F] text-white rounded-xl font-medium hover:bg-[#d85a8a] transition-colors">
            Explore Recipes
          </button>
        </div>

        {/* Sample saved recipe (when implemented) */}
        <div className="space-y-4 hidden">
          <div className="bg-white rounded-xl border border-[#E0C7D0] overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-[#F8BFCB] to-[#EF6D9F] flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white opacity-80" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[#3B3B3B] mb-2">Chocolate Chip Cookies</h3>
              <p className="text-sm text-[#5E5E5E] mb-3">Classic homemade cookies that are crispy on the outside...</p>
              
              <div className="flex items-center space-x-4 text-sm text-[#5E5E5E] mb-4">
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>25m</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users size={14} />
                  <span>12 servings</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button className="text-[#EF6D9F] hover:text-[#d85a8a]">
                  <Heart size={20} fill="currentColor" />
                </button>
                <button className="px-4 py-2 bg-[#F8BFCB] text-[#3B3B3B] rounded-lg font-medium hover:bg-[#EF6D9F] hover:text-white transition-colors">
                  View Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}