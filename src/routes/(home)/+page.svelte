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
    

    function getNextMilestone(points) {
        if (points < 20) return 50;
        if (points < 50) return 80;
        if (points < 80) return 110;
        if (points < 110) return 140;
        return Math.ceil(points / 1000) * 1000;
    }

    const nextMilestone = getNextMilestone($user ? $user.points : 0);
    const progress = $user ? ($user.points / nextMilestone) * 100 : 0;
</script>

{#if $user}
    <div class="w-full p-4 max-w-[800px] mx-auto">
        <h1 class="text-3xl dark:text-white font-medium mb-4 ">Welcome, <span class="text-emerald-400">{$user.name}</span>!</h1>

        <Input type="text" bind:value={meetingText} placeholder="Enter meeting ID" class="w-full justify-center mt-6 mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 "/>
        <Button {loading} disabled={!meetingText} class="w-full mb-8 p-3 bg-emerald-400 transition-colors" onclick={onClickJoin}>Join Meeting</Button>
        
        <!-- Enhanced Points Section -->
        <div class="relative mb-8">
            <Card.Card class="overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 p-0 dark:from-emerald-950/20 dark:to-blue-950/20 border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                <!-- Background Pattern -->
                <div class="absolute inset-0 opacity-10">
                    <div class="absolute top-4 right-4 w-20 h-20 bg-emerald-400 rounded-full blur-xl"></div>
                    <div class="absolute bottom-4 left-4 w-16 h-16 bg-blue-400 rounded-full blur-lg"></div>
                </div>
                
                <Card.Content class="relative z-10 p-8">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Your Points</h2>
                        </div>
                        <div class="text-emerald-600 dark:text-emerald-400">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <div class="mb-2">
                            <span class="text-6xl font-light text-emerald-400 drop-shadow-sm">
                                {$user.points}
                            </span>
                            <span class="text-lg text-gray-600 dark:text-gray-400 ml-2">points</span>
                        </div>
                        
                        <!-- Progress bar showing points to next milestone -->
                     
                        
                        <div class="mt-4 space-y-2">
                            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Progress to {nextMilestone} points</span>
                                <span>{$user.points}/{nextMilestone}</span>
                            </div>
                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    class="h-2.5 bg-emerald-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                                    style="width: {Math.min(progress, 100)}%"
                                ></div>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-500 text-center">
                                {nextMilestone - $user.points} points until next milestone! 🎯
                            </p>
                        </div>
                        
                        <!-- Achievement badges -->
                        <div class="flex justify-center gap-2 mt-4">
                            {#if $user.points >= 20}
                                <div class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full border border-emerald-200 dark:border-emerald-800">
                                    🌟 Beginner
                                </div>
                            {/if}
                            {#if $user.points >= 50}
                                <div class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800">
                                    🚀 Rising Star
                                </div>
                            {/if}
                            {#if $user.points >= 80}
                                <div class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full border border-purple-200 dark:border-purple-800">
                                    👑 Expert
                                </div>
                            {/if}
                            {#if $user.points >= 100}
                                <div class="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full border border-yellow-200 dark:border-yellow-800">
                                    🏆 Legend
                                </div>
                            {/if}
                        </div>
                    </div>
                </Card.Content>
            </Card.Card>
        </div>
        
        
        
        
    </div>
{:else}
    <div class="w-full h-full p-4 max-w-[800px] mx-auto justify-center flex flex-col items-center ">
        <LoginComponent redirectTo="/"/>
    </div>
{/if}