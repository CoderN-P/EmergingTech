<script lang="ts">
    import { user } from "$lib/stores";
    import {onMount} from "svelte";
    import { goto } from "$app/navigation";
    import {attendMeeting} from "$lib/attendMeeting";
    import { page } from "$app/state";
    import LoadingScreen from "$lib/components/LoadingScreen.svelte";
    import {supabase} from "$lib/supabaseClient";

    async function signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + page.url.pathname + page.url.search,
                queryParams: {
                    hd: 'mittymonarch.com'
                }
            },

        })

        if (error) {
            console.error('Error during sign-in:', error.message);
            return;
        }
    }
    
    $effect(() => {
        if ($user === undefined) return;
        
        if (!$user) {
            signInWithGoogle();
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const meetingId = urlParams.get('meetingId');

        if (meetingId) {
            attendMeeting(meetingId, $user.id);
        } else {
            goto('/');
            return;
        }

        goto('/');
    })
    
    
</script>

<LoadingScreen/>