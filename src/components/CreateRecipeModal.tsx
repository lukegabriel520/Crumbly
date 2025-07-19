import React, { useState } from 'react';
import { X, Plus, Trash2, Clock, ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { crumbleAI } from '../lib/gemini';

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Ingredient {
  name: string;
  quantity: string;
}

interface Step {
  instruction: string;
  duration: number;
  modality: string;
}

export function CreateRecipeModal({ isOpen, onClose }: CreateRecipeModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: '' }]);
  const [steps, setSteps] = useState<Step[]>([{ instruction: '', duration: 0, modality: 'preparation' }]);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [crumbleAdvice, setCrumbleAdvice] = useState('');

  if (!isOpen) return null;

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    );
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, { instruction: '', duration: 0, modality: 'preparation' }]);
  };

  const updateStep = (index: number, field: keyof Step, value: string | number) => {
    const updated = steps.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    );
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const getAdviceFromCrumble = async () => {
    if (!title && ingredients.length === 1 && !ingredients[0].name) return;
    
    setCrumbleAdvice('Getting advice from Crumble...');
    
    try {
      console.log('Requesting advice from Crumble...');
      const advice = await crumbleAI.getRecipeAdvice(title, ingredients, steps);
      console.log('Advice received:', advice);
      setCrumbleAdvice(advice);
    } catch (error) {
      console.error('Error getting advice:', error);
      setCrumbleAdvice("This recipe looks wonderful! I'm excited to help you bake something amazing.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (!supabase) {
        // Demo mode - just show success
        console.log('Demo recipe created:', { title, ingredients, steps });
        alert('Recipe created successfully! (Demo mode)');
        onClose();
        return;
      }

      // Create recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert([
          {
            owner_id: user.id,
            title,
            ingredients: ingredients.filter(ing => ing.name.trim()),
            steps: steps.filter(step => step.instruction.trim()),
            status: isPublic ? 'published' : 'draft'
          }
        ])
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Reset form
      setTitle('');
      setIngredients([{ name: '', quantity: '' }]);
      setSteps([{ instruction: '', duration: 0, modality: 'preparation' }]);
      setCrumbleAdvice('');
      onClose();
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Error creating recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 sm:items-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E0C7D0] p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#3B3B3B]">Create Recipe</h2>
          <button
            onClick={onClose}
            className="text-[#5E5E5E] hover:text-[#3B3B3B]"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3B3B3B] mb-2">
                Recipe Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-[#E0C7D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F8BFCB]"
                placeholder="My Amazing Cookie Recipe"
                required
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#3B3B3B]">Ingredients</h3>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center text-[#EF6D9F] hover:text-[#d85a8a] font-medium"
              >
                <Plus size={16} className="mr-1" />
                Add
              </button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    className="w-24 p-2 border border-[#E0C7D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BFCB]"
                  />
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="flex-1 p-2 border border-[#E0C7D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BFCB]"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-[#E63946] hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#3B3B3B]">Instructions</h3>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center text-[#EF6D9F] hover:text-[#d85a8a] font-medium"
              >
                <Plus size={16} className="mr-1" />
                Add Step
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="border border-[#E0C7D0] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-[#5E5E5E]">Step {index + 1}</span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-[#E63946] hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <textarea
                    placeholder="Describe this step..."
                    value={step.instruction}
                    onChange={(e) => updateStep(index, 'instruction', e.target.value)}
                    className="w-full p-3 border border-[#E0C7D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BFCB] h-20 mb-3"
                  />

                  <div className="flex space-x-3">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-[#5E5E5E]" />
                      <input
                        type="number"
                        placeholder="0"
                        value={step.duration}
                        onChange={(e) => updateStep(index, 'duration', parseInt(e.target.value) || 0)}
                        className="w-16 p-2 border border-[#E0C7D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BFCB]"
                      />
                      <span className="text-sm text-[#5E5E5E]">min</span>
                    </div>

                    <select
                      value={step.modality}
                      onChange={(e) => updateStep(index, 'modality', e.target.value)}
                      className="p-2 border border-[#E0C7D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8BFCB]"
                    >
                      <option value="preparation">Preparation</option>
                      <option value="mixing">Mixing</option>
                      <option value="baking">Baking</option>
                      <option value="decorating">Decorating</option>
                      <option value="cooling">Cooling</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crumble Advice */}
          {crumbleAdvice && (
            <div className="bg-[#FFF5F7] border border-[#E0C7D0] rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <ChefHat className="w-5 h-5 text-[#EF6D9F] mt-1" />
                <div>
                  <p className="text-sm font-medium text-[#3B3B3B] mb-1">Crumble says:</p>
                  <p className="text-sm text-[#5E5E5E]">{crumbleAdvice}</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="flex items-center justify-between py-4 border-t border-[#E0C7D0]">
            <span className="text-[#3B3B3B] font-medium">Make recipe public</span>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-[#EF6D9F]' : 'bg-[#E0C7D0]'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isPublic ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={getAdviceFromCrumble}
              className="flex-1 py-3 border border-[#E0C7D0] text-[#5E5E5E] rounded-xl font-medium hover:bg-[#FFF5F7] transition-colors"
            >
              Ask Crumble
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-3 bg-[#EF6D9F] text-white rounded-xl font-medium hover:bg-[#d85a8a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}