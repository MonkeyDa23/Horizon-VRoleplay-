// /lib/config.ts
import type { DiscordRole } from '../types';

// ===================================================================================
// --- CENTRAL WEBSITE CONFIGURATION ---
// ===================================================================================
// This file contains all the important variables for your community website.
// Fill in the placeholder values with your actual server details.
// ===================================================================================

export const CONFIG = {

  // ===================================================================================
  // --- General Settings ---
  // ===================================================================================

  /**
   * The URL for your community's logo.
   * Recommended format: PNG with a transparent background.
   */
  LOGO_URL: 'https://l.top4top.io/p_356271n1v1.png',

  /**
   * The full invite URL for your Discord server.
   */
  DISCORD_INVITE_URL: 'https://discord.gg/u3CazwhxVa',

  /**
   * The connection URL for your Multi Theft Auto (MTA) server.
   * Format: 'mtasa://ip:port'
   */
  MTA_SERVER_URL: 'mtasa://134.255.216.22:22041',

  // ===================================================================================
  // --- Discord Application & OAuth2 ---
  // ===================================================================================
  // These are public-facing settings for your Discord Application.
  // Get them from the Discord Developer Portal: https://discord.com/developers/applications
  
  /**
   * Your Application's "APPLICATION ID" from the Discord Developer Portal.
   */
  DISCORD_CLIENT_ID: '1423341328355295394', // Replace with your actual Client ID

  /**
   * The full URL Discord should redirect to after a user logs in.
   * IMPORTANT: This EXACT URL must be added to the "Redirects" section of your
   * Discord Application's "OAuth2" settings page.
   * For this project's HashRouter setup, it must end with `/#/auth/callback`.
   * Example (Production): 'https://your-website.com/#/auth/callback'
   * Example (Development): 'http://localhost:5173/#/auth/callback'
   */
  REDIRECT_URI: 'https://horizonroleplay-seven.vercel.app/#/auth/callback', // IMPORTANT: Change this to your production URL when you deploy!

  // ===================================================================================
  // --- SECRETS (FOR BACKEND USE ONLY) ---
  // ===================================================================================
  // WARNING: DO NOT store real secrets in frontend code. This is extremely insecure.
  // These values are included here ONLY as a reference for your backend developer.
  // In a real application, these would be environment variables on your server.
  // ===================================================================================

  /**
   * Your Discord Bot's Token. Used by the backend to interact with the Discord API.
   * **NEVER** expose this in your frontend code.
   */
  DISCORD_BOT_TOKEN: 'MTQyMzM0MTMyODM1NTI5NTM5NA.GAOUnm.GGJ4DdpRNPonFCvs0Ga7CSG73HZO9OtVeh2-zw',
  
  /**
   * Your Application's "CLIENT SECRET". Used by the backend for the OAuth2 flow.
   * **NEVER** expose this in your frontend code.
   */
  DISCORD_CLIENT_SECRET: 'yLwGf1g6OKVm-3lntrQ33GAY-RN4_cZP',

  // ===================================================================================
  // --- Server, Channel & Role IDs ---
  // ===================================================================================
  // How to get IDs: https://support.discord.com/hc/en-us/articles/206346498
  
  /**
   * Your main Discord Server ID (also called Guild ID).
   */
  DISCORD_SERVER_ID: '1422936346233933980', // Replace with your actual Server ID

  /**
   * Channel ID where the bot should post "New Application Submitted" notifications.
   */
  APPLICATION_NOTIFICATION_CHANNEL_ID: '1422941415486390334',

  /**
   * An array of Discord Role IDs that grant admin access on the website.
   * A secure backend is required to verify if a logged-in user has one of these roles.
   */
  ADMIN_ROLE_IDS: ['1423683069893673050'], // Replace with your actual Admin Role ID(s)
  

  // ===================================================================================
  // --- MOCK DATA FOR OFFLINE SIMULATION ---
  // ===================================================================================
  // This data is used by `AuthCallbackPage.tsx` to simulate fetching roles from your server
  // without a live backend. In production, your backend would fetch this info from the Discord API.
  
  /**
   * A list of all relevant roles on your Discord server for the simulation.
   * The `position` property determines priority (higher is better).
   */
  MOCK_DISCORD_ROLES: [
    { id: '1423683069893673050', name: 'Founder', color: '#f1c40f', position: 5 },
    { id: 'mock_admin_role', name: 'Admin', color: '#e74c3c', position: 4 },
    { id: 'mock_vip_role', name: 'Gold VIP', color: '#e67e22', position: 3 },
    { id: 'mock_member_role', name: 'Member', color: '#ffffff', position: 2 },
  ] as (DiscordRole & { position: number })[],

  /**
   * A mapping of mock user IDs to their simulated roles.
   * This mimics the response from the Discord API's "Get Guild Member" endpoint.
   */
  MOCK_GUILD_MEMBERS: {
    // This user will get Admin privileges because they have the '1423683069893673050' role.
    '1328693484798083183': {
      username: 'Founder',
      avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
      roles: ['1423683069893673050', 'mock_member_role']
    },
    // This user will be a regular member with the Gold VIP role.
    '100000000000000001': {
      username: 'VIP_Gamer',
      avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
      roles: ['mock_vip_role', 'mock_member_role']
    },
     // This user will just have the 'Member' role.
    '200000000000000002': {
      username: 'JustAMember',
      avatar: 'https://cdn.discordapp.com/embed/avatars/3.png',
      roles: ['mock_member_role']
    }
  } as Record<string, { username: string, avatar: string, roles: string[] }>,
};
