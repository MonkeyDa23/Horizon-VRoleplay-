import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { CONFIG } from '../lib/config';
import type { User, DiscordRole } from '../types';

// ===================================================================================
// --- SIMULATED BACKEND: OAUTH2 CALLBACK HANDLER ---
// ===================================================================================
// This page's entire purpose is to act like a backend server after a user
// authorizes the app on Discord. It fixes the "Invalid authentication request" bug
// by correctly validating the state from localStorage and handling the HashRouter URL.
//
// IN A REAL, SECURE APPLICATION:
// 1. Discord would redirect to a real backend URL (e.g., `https://api.yourdomain.com/auth/discord/callback?code=...`).
// 2. The backend would take the `code` and securely exchange it for an `access_token`.
// 3. Using the token, it would fetch user identity and guild-specific roles.
// 4. The backend would then create a secure session (e.g., JWT) for the frontend.
//
// This component SIMULATES this flow for demonstration purposes and provides a clear
// roadmap for a backend developer.
// ===================================================================================

const AuthCallbackPage: React.FC = () => {
    const [status, setStatus] = useState('Processing login...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processAuth = async () => {
            // For HashRouter, params are in the hash part of the URL.
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            const code = params.get('code');
            const state = params.get('state');
            // Get state from localStorage, which is shared between the main window and popup.
            const storedState = localStorage.getItem('oauth_state');

            // --- Step 1: Validate the request (CRITICAL FIX) ---
            if (!code || !state || state !== storedState) {
                const errorMessage = 'Invalid authentication request. Please try logging in again.';
                setError(errorMessage);
                if (window.opener) {
                   window.opener.postMessage({ type: 'auth-error', error: errorMessage }, window.location.origin);
                   window.close();
                }
                return;
            }
            localStorage.removeItem('oauth_state');

            try {
                // --- Step 2: (SIMULATED) Exchange code for access token ---
                setStatus('Verifying identity...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // --- Step 3: (SIMULATED) Fetch user identity and guild member info ---
                // We'll pick a random mock user from our config.
                // A real backend would use the access token to get the *actual* user's ID.
                setStatus('Fetching server roles...');
                await new Promise(resolve => setTimeout(resolve, 500));

                const mockUserKeys = Object.keys(CONFIG.MOCK_GUILD_MEMBERS);
                const randomUserId = mockUserKeys[Math.floor(Math.random() * mockUserKeys.length)];
                const mockUserIdentity = { id: randomUserId, ...CONFIG.MOCK_GUILD_MEMBERS[randomUserId] };
                const userRoleIds = mockUserIdentity.roles;

                // --- Step 4: Determine user's primary role and admin status ---
                let primaryRole: DiscordRole | undefined = undefined;
                // Sort defined roles by position (highest first) to find the primary role
                const sortedRoles = [...CONFIG.MOCK_DISCORD_ROLES].sort((a, b) => b.position - a.position);
                for (const definedRole of sortedRoles) {
                    if (userRoleIds.includes(definedRole.id)) {
                        primaryRole = definedRole;
                        break; 
                    }
                }
                
                const isAdmin = userRoleIds.some(roleId => CONFIG.ADMIN_ROLE_IDS.includes(roleId));

                // --- Step 5: Construct the final User object ---
                const finalUser: User = {
                    id: mockUserIdentity.id,
                    username: mockUserIdentity.username,
                    avatar: mockUserIdentity.avatar,
                    isAdmin: isAdmin,
                    primaryRole: primaryRole,
                };

                // --- Step 6: (SIMULATED) Trigger welcome message bot ---
                setStatus('Finalizing...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.groupCollapsed(`[BACKEND SIM] Bot Welcome Message Trigger`);
                console.log(`A real backend server would now send a welcome DM to the user.`);
                console.log(`This requires a separate, running bot application connected to Discord.`);
                console.log(`Payload:`, {
                  discordUserId: finalUser.id,
                  discordUsername: finalUser.username,
                  message: `Welcome to Horizon Roleplay, ${finalUser.username}! We're glad to have you.`
                });
                console.groupEnd();
                
                // --- Step 7: Send the user data back to the main window and close ---
                if (window.opener) {
                    window.opener.postMessage({ type: 'auth-success', user: finalUser }, window.location.origin);
                    window.close();
                } else {
                     setError("Could not communicate with the main application window.");
                }

            } catch (e) {
                const errorMessage = "An unexpected error occurred during login.";
                console.error("Auth processing error:", e);
                setError(errorMessage);
                 if (window.opener) {
                   window.opener.postMessage({ type: 'auth-error', error: errorMessage }, window.location.origin);
                   setTimeout(() => window.close(), 3000);
                }
            }
        };

        processAuth();
    }, []);
    
    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-brand-dark text-white p-4 text-center">
            <Loader size={48} className="text-brand-cyan animate-spin" />
            <p className="mt-4 text-lg font-semibold">{error || status}</p>
            {!error && <p className="text-gray-400 text-sm">Please wait, this window will close automatically.</p>}
            {error && <button onClick={() => window.close()} className="mt-4 bg-brand-cyan text-brand-dark font-bold py-2 px-4 rounded">Close</button>}
        </div>
    );
};

export default AuthCallbackPage;
