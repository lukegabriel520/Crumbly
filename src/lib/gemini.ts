const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDu1ZgcDiRoONoUZqmlBfVU6G-RM6LzmJQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface CrumbleResponse {
  message: string;
  suggestions?: string[];
  completionPercentage?: number;
}

export class CrumbleAI {
  private systemPrompt = `You are Crumble, a friendly AI baking assistant for the Crumbly app. You are warm, encouraging, and knowledgeable about baking. Always:

1. Introduce yourself as "Crumble" (never mention Gemini or AI)
2. Keep responses short, friendly, and baking-focused only (max 80 words)
3. Use encouraging language like "Great choice!", "Perfect!", "That looks delicious!"
4. Provide helpful baking tips and suggestions
5. Only discuss baking, recipes, ingredients, and cooking techniques
6. If asked about non-baking topics, redirect: "I'm here to help with your baking adventures! What are you planning to bake today?"
7. Use casual, warm tone like a friendly baking mentor
8. Never mention being an AI or Gemini`;

  async chat(message: string, context?: any): Promise<CrumbleResponse> {
    try {
      console.log('Crumble AI: Sending request to Gemini...');
      
      const requestBody = {
        contents: [{
          parts: [{
            text: `${this.systemPrompt}\n\nUser message: ${message}\n\n${context ? `Recipe context: ${JSON.stringify(context)}` : ''}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150,
        }
      };

      console.log('Request body:', requestBody);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini response:', data);

      const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hi there! I'm Crumble, your baking companion. What delicious recipe are we making today?";

      return {
        message: aiMessage.trim(),
        suggestions: this.extractSuggestions(aiMessage),
        completionPercentage: this.calculateCompletion(context)
      };
    } catch (error) {
      console.error('Crumble AI Error:', error);
      
      // Return contextual fallback messages based on the input
      const fallbackMessage = this.getFallbackMessage(message, context);
      
      return {
        message: fallbackMessage,
        suggestions: ["Try again", "Check recipe", "Keep baking!"]
      };
    }
  }

  private getFallbackMessage(message: string, context?: any): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('welcome') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hi there! I'm Crumble, your friendly baking companion. Ready to create something delicious together?";
    }
    
    if (lowerMessage.includes('recipe') || lowerMessage.includes('bake') || lowerMessage.includes('cook')) {
      return "That sounds like a wonderful recipe! I'm here to help guide you through every step of your baking journey.";
    }
    
    if (lowerMessage.includes('ingredient')) {
      return "Great choice of ingredients! Remember, quality ingredients make all the difference in baking.";
    }
    
    if (context?.title) {
      return `${context.title} sounds absolutely delicious! I can already imagine how amazing it's going to taste.`;
    }
    
    return "I'm here to help with your baking adventures! What are you planning to create today?";
  }

  private extractSuggestions(message: string): string[] {
    const suggestions = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('try') || lowerMessage.includes('attempt')) suggestions.push('Give it a try!');
    if (lowerMessage.includes('add') || lowerMessage.includes('mix')) suggestions.push('Add ingredient');
    if (lowerMessage.includes('bake') || lowerMessage.includes('oven')) suggestions.push('Start baking');
    if (lowerMessage.includes('temperature') || lowerMessage.includes('time')) suggestions.push('Check timing');
    if (lowerMessage.includes('perfect') || lowerMessage.includes('great')) suggestions.push('Keep going!');
    
    // Default suggestions if none found
    if (suggestions.length === 0) {
      suggestions.push('Continue recipe', 'Ask for tips', 'Check steps');
    }
    
    return suggestions.slice(0, 3);
  }

  private calculateCompletion(context?: any): number {
    if (!context?.steps) return 0;
    const completedSteps = context.steps.filter((step: any) => step.completed).length;
    return Math.round((completedSteps / context.steps.length) * 100);
  }

  async analyzeRecipe(recipe: any): Promise<CrumbleResponse> {
    const recipeText = `Title: ${recipe.title}\nIngredients: ${recipe.ingredients?.map((i: any) => `${i.quantity} ${i.name}`).join(', ')}\nSteps: ${recipe.steps?.map((s: any) => s.instruction).join('. ')}`;
    
    return this.chat(`Analyze this recipe and give me encouraging feedback: ${recipeText}`, recipe);
  }

  async getWelcomeMessage(): Promise<string> {
    try {
      const response = await this.chat("Give a brief welcome message for new users to the Crumbly baking app");
      return response.message;
    } catch (error) {
      return "Hi there! I'm Crumble, your friendly baking companion. Welcome to Crumbly - let's create some amazing recipes together!";
    }
  }

  async getRecipeAdvice(title: string, ingredients: any[], steps: any[]): Promise<string> {
    const recipe = { title, ingredients, steps };
    try {
      const response = await this.analyzeRecipe(recipe);
      return response.message;
    } catch (error) {
      if (title.toLowerCase().includes('cookie')) {
        return "Cookies are my favorite! Make sure your butter is at room temperature for the perfect texture.";
      } else if (title.toLowerCase().includes('cake')) {
        return "Cakes are wonderful! Remember not to overmix the batter to keep it light and fluffy.";
      } else if (title.toLowerCase().includes('bread')) {
        return "Fresh bread is amazing! Take your time with the kneading - it's worth the effort.";
      }
      return "This recipe looks fantastic! I'm excited to see how it turns out.";
    }
  }
}

export const crumbleAI = new CrumbleAI();