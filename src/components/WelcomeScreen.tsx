import React, { useState, useEffect } from 'react';
import { ChefHat, Heart, Users, BookOpen } from 'lucide-react';
import { crumbleAI } from '../lib/gemini';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(true);

  const tutorialSteps = [
    {
      icon: <ChefHat className="w-12 h-12 text-[#EF6D9F]" />,
      title: "Meet Crumble!",
      description: "Your friendly baking companion. I'm here to guide you through every recipe and help you become a better baker."
    },
    {
      icon: <BookOpen className="w-12 h-12 text-[#EF6D9F]" />,
      title: "Create & Share Recipes",
      description: "Build your personal recipe collection and share your baking creations with the community."
    },
    {
      icon: <Users className="w-12 h-12 text-[#EF6D9F]" />,
      title: "Join the Community",
      description: "Discover amazing recipes, vote for your favorites, and connect with fellow baking enthusiasts."
    },
    {
      icon: <Heart className="w-12 h-12 text-[#EF6D9F]" />,
      title: "Guided Progression",
      description: "Let Crumble guide you step-by-step through your baking journey with helpful tips and encouragement."
    }
  ];

  useEffect(() => {
    const loadWelcome = async () => {
      try {
        console.log('Loading welcome message from Crumble...');
        const message = await crumbleAI.getWelcomeMessage();
        console.log('Welcome message received:', message);
        setWelcomeMessage(message);
      } catch (error) {
        console.error('Error loading welcome message:', error);
        setWelcomeMessage("Hi there! I'm Crumble, your friendly baking companion. Ready to create some delicious recipes together?");
      } finally {
        setLoadingMessage(false);
      }
    };

    loadWelcome();
  }, []);

  const LoadingDots = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-3 h-3 bg-[#EF6D9F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-[#EF6D9F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-[#EF6D9F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="h-64 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center border border-[#E0C7D0]">
            <div className="w-24 h-24 bg-[#F8BFCB] rounded-full flex items-center justify-center mb-4">
              <ChefHat className="w-12 h-12 text-[#EF6D9F]" />
            </div>
            {loadingMessage ? (
              <>
                <LoadingDots />
                <p className="text-[#5E5E5E] mt-4">Loading Crumble...</p>
              </>
            ) : (
              <div className="text-center px-6">
                <h2 className="text-xl font-bold text-[#3B3B3B] mb-2">Hello! I'm Crumble</h2>
                <p className="text-[#5E5E5E] text-sm">Your AI baking companion</p>
              </div>
            )}
          </div>

          {welcomeMessage && !loadingMessage && (
            <div className="mt-6 p-4 bg-white rounded-xl border border-[#E0C7D0] shadow-sm">
              <p className="text-[#3B3B3B] text-center font-medium">{welcomeMessage}</p>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white border-t border-[#E0C7D0] p-6">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between mb-4">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-[#EF6D9F]' : 'bg-[#E0C7D0]'
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <div className="mb-4">
              {tutorialSteps[currentStep].icon}
            </div>
            <h3 className="text-xl font-semibold text-[#3B3B3B] mb-2">
              {tutorialSteps[currentStep].title}
            </h3>
            <p className="text-[#5E5E5E] mb-6">
              {tutorialSteps[currentStep].description}
            </p>

            <div className="flex space-x-3">
              {currentStep < tutorialSteps.length - 1 ? (
                <>
                  <button
                    onClick={onGetStarted}
                    className="flex-1 py-3 px-6 border border-[#E0C7D0] text-[#5E5E5E] rounded-xl font-medium hover:bg-[#FFF5F7] transition-colors"
                  >
                    Skip Tour
                  </button>
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex-1 py-3 px-6 bg-[#F8BFCB] text-[#3B3B3B] rounded-xl font-medium hover:bg-[#EF6D9F] hover:text-white transition-colors"
                  >
                    Next
                  </button>
                </>
              ) : (
                <button
                  onClick={onGetStarted}
                  className="w-full py-3 px-6 bg-[#EF6D9F] text-white rounded-xl font-medium hover:bg-[#d85a8a] transition-colors"
                >
                  Start Baking!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}