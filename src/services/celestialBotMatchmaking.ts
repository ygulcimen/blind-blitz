// src/services/celestialBotMatchmaking.ts
// Service to fetch and manage Celestial bot players

import { supabase } from '../lib/supabase';
import type { BotConfig } from './celestialBotAI';

export interface CelestialBot {
  id: string;
  username: string;
  rating: number;
  gold_balance: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  is_bot: boolean;
  config: BotConfig;
}

/**
 * Get all Celestial bots
 */
export async function getAllCelestialBots(): Promise<CelestialBot[]> {
  try {
    const { data, error } = await supabase
      .from('celestial_bot_configs')
      .select('*');

    if (error) {
      console.error('Error fetching celestial bots:', error);
      return [];
    }

    return (data || []).map((bot: any) => ({
      id: bot.id,
      username: bot.username,
      rating: bot.rating,
      gold_balance: 0, // Will be fetched separately if needed
      games_played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      is_bot: true,
      config: bot.config,
    }));
  } catch (error) {
    console.error('Failed to fetch celestial bots:', error);
    return [];
  }
}

/**
 * Get a random Celestial bot within rating range
 */
export async function getRandomCelestialBot(
  minRating: number = 800,
  maxRating: number = 2500
): Promise<CelestialBot | null> {
  try {
    const { data, error } = await supabase.rpc('get_random_celestial_bot', {
      min_rating: minRating,
      max_rating: maxRating,
    });

    if (error) {
      console.error('Error getting random celestial bot:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No celestial bot found in rating range:', minRating, '-', maxRating);
      return null;
    }

    const bot = data[0];
    return {
      id: bot.bot_id,
      username: bot.bot_username,
      rating: bot.bot_rating,
      gold_balance: 0,
      games_played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      is_bot: true,
      config: bot.bot_config,
    };
  } catch (error) {
    console.error('Failed to get random celestial bot:', error);
    return null;
  }
}

/**
 * Get a specific Celestial bot by username
 */
export async function getCelestialBotByUsername(
  username: string
): Promise<CelestialBot | null> {
  try {
    const { data, error } = await supabase
      .from('celestial_bot_configs')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching bot by username:', error);
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      rating: data.rating,
      gold_balance: 0,
      games_played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      is_bot: true,
      config: data.config,
    };
  } catch (error) {
    console.error('Failed to fetch bot by username:', error);
    return null;
  }
}

/**
 * Check if a player ID is a Celestial bot
 */
export async function isCelestialBot(playerId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('is_bot')
      .eq('id', playerId)
      .single();

    if (error) return false;
    return data?.is_bot === true;
  } catch (error) {
    return false;
  }
}

/**
 * Get bot configuration for a player ID
 */
export async function getBotConfig(playerId: string): Promise<BotConfig | null> {
  try {
    const { data, error } = await supabase
      .from('celestial_bot_configs')
      .select('config')
      .eq('id', playerId)
      .single();

    if (error) {
      console.error('Error fetching bot config:', error);
      return null;
    }

    return data?.config || null;
  } catch (error) {
    console.error('Failed to fetch bot config:', error);
    return null;
  }
}

/**
 * Get bot player details including full stats
 */
export async function getBotPlayerDetails(playerId: string): Promise<CelestialBot | null> {
  try {
    const { data, error } = await supabase
      .from('celestial_bot_configs')
      .select('*')
      .eq('id', playerId)
      .single();

    if (error) {
      console.error('Error fetching bot details:', error);
      return null;
    }

    // Also get the full player stats
    const { data: playerData } = await supabase
      .from('players')
      .select('gold_balance, games_played, wins, losses, draws')
      .eq('id', playerId)
      .single();

    return {
      id: data.id,
      username: data.username,
      rating: data.rating,
      gold_balance: playerData?.gold_balance || 0,
      games_played: playerData?.games_played || 0,
      wins: playerData?.wins || 0,
      losses: playerData?.losses || 0,
      draws: playerData?.draws || 0,
      is_bot: true,
      config: data.config,
    };
  } catch (error) {
    console.error('Failed to fetch bot player details:', error);
    return null;
  }
}

export const celestialBotMatchmaking = {
  getAllCelestialBots,
  getRandomCelestialBot,
  getCelestialBotByUsername,
  isCelestialBot,
  getBotConfig,
  getBotPlayerDetails,
};
