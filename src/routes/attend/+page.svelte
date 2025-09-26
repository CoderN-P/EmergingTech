<script lang="ts">
    import { user } from "$lib/stores";
    import LoginComponent from "../(home)/LoginComponent.svelte";
    import {onMount} from "svelte";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import {attendMeeting} from "$lib/attendMeeting";
    import { page } from "$app/state";
    import LoadingScreen from "$lib/components/LoadingScreen.svelte";

    onMount(async () => {
        if (!$user) {
            return;
        }
        const urlParams = new URLSearchParams(window.location.search);
        const meetingId = urlParams.get('meetingId');
        
        if (meetingId) {
            await attendMeeting(meetingId, $user.id);
        } else {
            toast.error("No meeting ID found in URL.");
        }

        await goto('/');
            
    });
</script>

{#if !$user}
    <div class="w-full h-full p-4 max-w-[800px] mx-auto justify-center flex flex-col items-center ">
        <LoginComponent redirectTo={page.url.pathname+page.url.search}/>
    </div>
{:else}
    <LoadingScreen/>
{/if}