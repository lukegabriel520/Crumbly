import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Grid, List, Clock, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  username: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  ingredients: { id: string }[];
  steps: { duration: number }[];
}

export function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchRecipes();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchRecipes = async () => {
    try {
      const query = supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          image_url,
          created_at,
          ingredients(id),
          steps(duration)
        `)
        .eq('user_id', id);

      // If not own profile, only show public recipes
      if (!isOwnProfile) {
        query.eq('is_public', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalTime = (steps: { duration: number }[]) => {
    return steps.reduce((total, step) => total + step.duration, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-[#E0C7D0] rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-[#E0C7D0] rounded w-32 mb-2"></div>
              <div className="h-4 bg-[#E0C7D0] rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[#E0C7D0] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <h2 className="text-xl font-semibold text-[#3B3B3B] mb-2">Profile not found</h2>
        <p className="text-[#5E5E5E]">This user doesn't exist or their profile is private.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#E0C7D0] p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#3B3B3B]">Profile</h1>
          {isOwnProfile && (
            <button className="text-[#5E5E5E] hover:text-[#3B3B3B]">
              <Settings size={24} />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-[#F8BFCB] rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-[#3B3B3B]">
              {profile.username[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[#3B3B3B]">{profile.username}</h2>
            <p className="text-[#5E5E5E] text-sm">Joined {formatDate(profile.created_at)}</p>
            {profile.bio && (
              <p className="text-[#5E5E5E] mt-2">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#3B3B3B]">{recipes.length}</div>
            <div className="text-sm text-[#5E5E5E]">Recipes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#3B3B3B]">
              {recipes.reduce((sum, recipe) => sum + recipe.ingredients.length, 0)}
            </div>
            <div className="text-sm text-[#5E5E5E]">Ingredients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#3B3B3B]">
              {Math.round(recipes.reduce((sum, recipe) => sum + getTotalTime(recipe.steps), 0) / 60)}h
            </div>
            <div className="text-sm text-[#5E5E5E]">Baking Time</div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#3B3B3B]">
            {isOwnProfile ? 'My Recipes' : 'Public Recipes'}
          </h3>
          <div className="flex bg-[#FFF5F7] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-white text-[#EF6D9F] shadow-sm'
                  : 'text-[#5E5E5E]'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white text-[#EF6D9F] shadow-sm'
                  : 'text-[#5E5E5E]'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Recipes */}
      <div className="p-4">
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#E0C7D0] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#5E5E5E]" />
            </div>
            <h3 className="text-lg font-medium text-[#3B3B3B] mb-2">No recipes yet</h3>
            <p className="text-[#5E5E5E]">
              {isOwnProfile ? 'Start creating your first recipe!' : 'This user hasn\'t shared any recipes yet.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-xl border border-[#E0C7D0] overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-[#F8BFCB] to-[#EF6D9F] flex items-center justify-center">
                  <Users className="w-8 h-8 text-white opacity-80" />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-[#3B3B3B] mb-1 truncate">{recipe.title}</h4>
                  <div className="flex items-center justify-between text-xs text-[#5E5E5E]">
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{getTotalTime(recipe.steps)}m</span>
                    </div>
                    <span>{recipe.ingredients.length} ingredients</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-xl border border-[#E0C7D0] p-4 flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F8BFCB] to-[#EF6D9F] rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white opacity-80" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[#3B3B3B] truncate">{recipe.title}</h4>
                  <p className="text-sm text-[#5E5E5E] truncate">{recipe.description}</p>
                  <div className="flex items-center space-x-3 text-xs text-[#5E5E5E] mt-1">
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{getTotalTime(recipe.steps)}m</span>
                    </div>
                    <span>{recipe.ingredients.length} ingredients</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}