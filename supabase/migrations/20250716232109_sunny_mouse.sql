/*
  # Initial Schema for Crumbly Baking App

  1. New Tables
    - `users`
      - `id` (uuid, primary key) 
      - `email` (text, unique)
      - `username` (text, unique)
      - `bio` (text, optional)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
    - `recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `title` (text)
      - `description` (text)
      - `image_url` (text, optional)
      - `is_public` (boolean, default true)
      - `created_at` (timestamp)
    - `ingredients`
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, references recipes)
      - `name` (text)
      - `quantity` (text)
      - `order` (integer)
    - `steps`
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, references recipes)
      - `instruction` (text)
      - `duration` (integer, minutes)
      - `modality` (text)
      - `order` (integer)
    - `comments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `recipe_id` (uuid, references recipes)
      - `content` (text)
      - `created_at` (timestamp)
    - `votes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `recipe_id` (uuid, references recipes)
      - `value` (integer, +1 or -1)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for recipes, comments (when recipe is public)
    - Users can vote and comment on public recipes
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity text NOT NULL,
  order_index integer NOT NULL DEFAULT 0
);

-- Create steps table
CREATE TABLE IF NOT EXISTS steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  instruction text NOT NULL,
  duration integer DEFAULT 0,
  modality text DEFAULT 'preparation',
  order_index integer NOT NULL DEFAULT 0
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  value integer NOT NULL CHECK (value IN (-1, 1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are visible"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Recipes policies
CREATE POLICY "Users can manage own recipes"
  ON recipes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public recipes are readable"
  ON recipes FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Ingredients policies
CREATE POLICY "Recipe owners can manage ingredients"
  ON ingredients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Ingredients visible for public recipes"
  ON ingredients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredients.recipe_id
      AND recipes.is_public = true
    )
  );

-- Steps policies
CREATE POLICY "Recipe owners can manage steps"
  ON steps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = steps.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Steps visible for public recipes"
  ON steps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = steps.recipe_id
      AND recipes.is_public = true
    )
  );

-- Comments policies
CREATE POLICY "Users can manage own comments"
  ON comments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Comments visible for public recipes"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = comments.recipe_id
      AND recipes.is_public = true
    )
  );

-- Votes policies
CREATE POLICY "Users can manage own votes"
  ON votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Votes visible for public recipes"
  ON votes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = votes.recipe_id
      AND recipes.is_public = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_public ON recipes(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id, order_index);
CREATE INDEX IF NOT EXISTS idx_steps_recipe_id ON steps(recipe_id, order_index);
CREATE INDEX IF NOT EXISTS idx_comments_recipe_id ON comments(recipe_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_recipe_id ON votes(recipe_id);