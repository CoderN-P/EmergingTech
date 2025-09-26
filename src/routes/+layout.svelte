<script>
	import { onMount } from 'svelte'
    import { supabase } from '$lib/supabaseClient'
    import { user } from '$lib/stores'
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import Navbar from '$lib/components/Navbar.svelte';
    import { Toaster } from "$lib/components/ui/sonner/index";
    import '../app.css';
    import {userSchema} from "$lib/types/index.js";
    import LoadingScreen from "$lib/components/LoadingScreen.svelte";
    
    let loading = $state(true);
	let { children } = $props();
    
    const logout = async () => {
        await supabase.auth.signOut();
        $user = null;
        await goto("/");
    }

	onMount(async () => {
    
		const { data, error } = await supabase.auth.getSession();
        
        if (error || !data?.session) {
            $user = null;
            loading = false;
            await supabase.auth.signOut();
            return;
        }
        
        const supabaseAuthUser = data.session.user;
        
        if (!supabaseAuthUser) {
           return await logout();
        }
        
        if ($user){
            if (page.url.pathname === "/dashboard/" && !$user.officer) {
                await goto("/");
            }
            loading = false;
            return;
        }
        
        const { data: userData, error: loadUserError } = await supabase.from("Users").select("*").eq("id", supabaseAuthUser.id);
        
        if (loadUserError) {
            return await logout();
        }
        
        if (!userData || userData.length === 0) {
            const userParsed = userSchema.parse({
                id: supabaseAuthUser.id,
                name: supabaseAuthUser.user_metadata.full_name,
                email: supabaseAuthUser.email || "",
                profile_picture: supabaseAuthUser.user_metadata.avatar_url || "",
                created_at: new Date().toISOString()
            });
            await supabase.from("Users").insert([
                userParsed
            ])
            
            $user = userParsed;
        } else {
            $user = userData[0];

            if (!$user) {
                return await logout();
            }
        }
        
        if (page.url.pathname === "/dashboard/" && !$user.officer) {
            await goto("/");
        }
        loading = false;
	})
</script>

<Toaster position="top-right" richColors />

<div class="w-full h-screen dark:bg-neutral-950">
    {#if loading}
        <LoadingScreen/>
    {:else}
        <Navbar />
        <div class="mt-12">
            {@render children()}
        </div>  
    {/if}
</div>