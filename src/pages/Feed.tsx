import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, BookOpen, Clock, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Recipe {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
  owner_id: string;
  ingredients: any;
  steps: any;
  status: string;
  users?: {
    username: string;
    avatar_url: string | null;
  };
}

export function Feed() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    if (!supabase) {
      // Show demo data if Supabase is not configured
      setRecipes([
        {
          id: '1',
          title: 'Chocolate Chip Cookies',
          image_url: null,
          created_at: new Date().toISOString(),
          owner_id: 'demo',
          ingredients: [{ name: 'Flour', quantity: '2 cups' }, { name: 'Sugar', quantity: '1 cup' }],
          steps: [{ instruction: 'Mix ingredients', duration: 10 }],
          status: 'published',
          users: { username: 'demo_baker', avatar_url: null }
        },
        {
          id: '2',
          title: 'Banana Bread',
          image_url: null,
          created_at: new Date().toISOString(),
          owner_id: 'demo',
          ingredients: [{ name: 'Bananas', quantity: '3 ripe' }, { name: 'Flour', quantity: '1.5 cups' }],
          steps: [{ instruction: 'Mash bananas', duration: 5 }, { instruction: 'Bake', duration: 60 }],
          status: 'published',
          users: { username: 'banana_lover', avatar_url: null }
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          title,
          image_url,
          created_at,
          owner_id,
          ingredients,
          steps,
          status,
          users!inner(username, avatar_url)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching recipes:', error);
        setRecipes([]);
      } else {
        setRecipes(data || []);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (recipeId: string, value: number) => {
    if (!user || !supabase) return;

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('interactions')
        .select('id, type')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .eq('type', value > 0 ? 'upvote' : 'downvote')
        .single();

      if (existingVote) {
        // Remove vote if clicking same button
        await supabase
          .from('interactions')
          .delete()
          .eq('id', existingVote.id);
      } else {
        // Create new vote
        await supabase
          .from('interactions')
          .insert([{ 
            user_id: user.id, 
            recipe_id: recipeId, 
            type: value > 0 ? 'upvote' : 'downvote' 
          }]);
      }

      fetchRecipes(); // Refresh to show updated votes
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getTotalTime = (steps: any[]) => {
    if (!Array.isArray(steps)) return 0;
    return steps.reduce((total, step) => total + (step.duration || 0), 0);
  };

  const getIngredientCount = (ingredients: any[]) => {
    if (!Array.isArray(ingredients)) return 0;
    return ingredients.length;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E0C7D0] p-4 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#E0C7D0] rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-[#E0C7D0] rounded w-24 mb-2"></div>
                <div className="h-3 bg-[#E0C7D0] rounded w-16"></div>
              </div>
            </div>
            <div className="h-32 bg-[#E0C7D0] rounded-xl mb-4"></div>
            <div className="h-4 bg-[#E0C7D0] rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#E0C7D0] p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-[#3B3B3B]">Recipe Feed</h1>
        <p className="text-[#5E5E5E]">Discover amazing baking creations</p>
      </div>

      {/* Feed */}
      <div className="p-4 space-y-4">
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-[#E0C7D0] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#3B3B3B] mb-2">No recipes yet</h3>
            <p className="text-[#5E5E5E]">Be the first to share a delicious recipe!</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl border border-[#E0C7D0] overflow-hidden">
              {/* Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#F8BFCB] rounded-full flex items-center justify-center">
                    <span className="text-[#3B3B3B] font-medium">
                      {recipe.users?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#3B3B3B]">{recipe.users?.username || 'Unknown User'}</p>
                    <p className="text-sm text-[#5E5E5E]">{formatTimeAgo(recipe.created_at)}</p>
                  </div>
                </div>
                <button className="text-[#5E5E5E] hover:text-[#3B3B3B]">
                  <Share size={20} />
                </button>
              </div>

              {/* Recipe Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-[#F8BFCB] to-[#EF6D9F] flex items-center justify-center">
                <div className="text-center text-white">
                  <BookOpen size={48} className="mx-auto mb-2 opacity-80" />
                  <p className="text-sm opacity-80">Recipe Image</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#3B3B3B] mb-2">{recipe.title}</h3>

                {/* Recipe Stats */}
                <div className="flex items-center space-x-4 text-sm text-[#5E5E5E] mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{getTotalTime(recipe.steps)}m</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen size={14} />
                    <span>{getIngredientCount(recipe.ingredients)} ingredients</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span>{Array.isArray(recipe.steps) ? recipe.steps.length : 0} steps</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E0C7D0]">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVote(recipe.id, 1)}
                      className="flex items-center space-x-2 text-[#5E5E5E] hover:text-[#EF6D9F] transition-colors"
                    >
                      <Heart size={20} />
                      <span className="text-sm">0</span>
                    </button>
                    <button className="flex items-center space-x-2 text-[#5E5E5E] hover:text-[#EF6D9F] transition-colors">
                      <MessageCircle size={20} />
                      <span className="text-sm">0</span>
                    </button>
                  </div>
                  <button className="px-4 py-2 bg-[#F8BFCB] text-[#3B3B3B] rounded-lg font-medium hover:bg-[#EF6D9F] hover:text-white transition-colors">
                    View Recipe
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}