import { createClient } from "@/utils/supabase/client";

export default async function auth(platform: string) {
    const supabase = await createClient();
    switch (platform) {
        case 'slack':
            await supabase.auth.signInWithOAuth({
                provider: 'slack_oidc',
            });
            break;
        case 'google':
            await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            break;
        case 'github':
            await supabase.auth.signInWithOAuth({
                provider: 'github',
            });
            break;
        default:
            throw new Error('unsupported platform');
    }    
}