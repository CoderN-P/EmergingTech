<script>
    import {user} from "$lib/stores";
    import LoginComponent from "./LoginComponent.svelte";
    import NumberLoader from "$lib/components/NumberLoader.svelte";
    import MeetingCard from "$lib/components/MeetingCard.svelte";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { attendMeeting } from "$lib/attendMeeting";
    import * as Card from "$lib/components/ui/card";
    
    
    let meetingText = $state("");
    let loading = $state(false);
    
    async function onClickJoin() {
        if (loading || !$user) return;
        loading = true;
        const result = await attendMeeting(meetingText, $user.id)
        loading = false;
        
        if (result) {
            meetingText = "";
        }
    }
    
</script>

{#if $user}
    <div class="w-full p-4 max-w-[800px] mx-auto">
        <h1 class="text-3xl dark:text-white font-medium mb-4 ">Welcome, <span class="text-emerald-400">{$user.name}</span>!</h1>

        <Input type="text" bind:value={meetingText} placeholder="Enter meeting ID" class="w-full mt-6 mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 "/>
        <Button {loading} disabled={!meetingText} class="w-full mb-8 p-3 bg-emerald-400 transition-colors" onclick={onClickJoin}>Join Meeting</Button>
        
        <Card.Root class="mb-6">
            <Card.Header>
                <Card.Title>Your Points</Card.Title>
                <Card.Description>Keep up the great work!</Card.Description>
            </Card.Header>
            <Card.Content>
                <div class="flex flex-col gap-4">
                    <div class="flex flex-row gap-2 items-center">
                        <p class="text-9xl font-bold ">{$user.points}</p> 
                        <p class="text-xl font-medium text-gray-800">points</p>
                    </div>
                    
                    <div class="flex flex-row gap-4 w-full">
                        <div class="rounded-lg p-4 flex flex-col items-center grow justify-center border border-green-200 bg-gray-50">
                            <p class="text-3xl font-medium">0</p>
                            <p class="text-xs text-gray-700">Meetings Attended</p>
                        </div>
                        <div class="rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 border border-green-200 grow">
                            <p class="text-3xl font-medium">3</p>
                            <p class="text-xs text-gray-700">Activities won</p>
                        </div>
                        <div class="rounded-lg p-4 flex flex-col items-center justify-center grow border border-green-200 bg-gray-50">
                            <p class="text-3xl font-medium">90% </p>
                            <p class="text-xs text-gray-700">Attendance rate</p>
                        </div>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>
        
        
        
        
        
        
    </div>
{:else}
    <div class="w-full h-full p-4 max-w-[800px] mx-auto justify-center flex flex-col items-center ">
        <LoginComponent redirectTo="/"/>
    </div>
{/if}