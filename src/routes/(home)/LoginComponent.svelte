<script lang="ts">
    import {supabase} from "$lib/supabaseClient";
    import { user } from "$lib/stores";
    import { userSchema, type User } from "$lib/types/index.js";
    import { Button } from "$lib/components/ui/button";

    const { redirectTo } = $props();
    
    async function signInWithGoogle() {
       const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo
            }
        })
        
        if (error) {
            console.error('Error during sign-in:', error.message);
            return;
        }
    }
</script>

<h1 class="text-3xl font-semibold tracking-tight mb-4">You are signed out...</h1>

<Button onclick={signInWithGoogle}>Sign in with Google</Button>

<p class="mt-8 text-lg max-w-xl text-center">
    Sign up to track your points, earn rewards, and compete with other members!
</p>

<div class="grid grid-cols-2 mt-6 gap-4 font-display">
    <div class="p-4 border rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-2">Club Activities</h2>
        <p>Join us for exciting workshops, hackathons, and tech talks that keep you at the forefront of emerging technologies.</p>
    </div>
    <div class="p-4 border rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-2">Networking Opportunities</h2>
        <p>Connect with industry professionals, alumni, and fellow tech enthusiasts to build your network and open doors to new opportunities.</p>
    </div>
</div>