<script lang="ts">
    import type { User, Meeting } from "$lib/types";
    import { user } from "$lib/stores";
    import { Check } from "lucide-svelte";
    import { onMount } from "svelte";
    import {getMeetings} from "$lib/getMeetings";
    import {getAttendees} from "$lib/getAttendees";

    
    let users = $state<User[]>([]);
    let meetings = $state<Meeting[]>([]);

   onMount(async () => {
        const meetingRes = await getMeetings();
        
        if (meetingRes.error || meetingRes.meetings.length === 0) {
            return;
        }
        
        meetings = meetingRes.meetings;
        
        console.log(meetings);
        
        const latestMeetingID = meetings[0].id;
        
        const usersRes = await getAttendees(latestMeetingID);
        
        if (usersRes.error || usersRes.users.length === 0) {
            return;
        }
        
        users = usersRes.users;
    })
        

    
</script>

{#if meetings.length > 0 && $user && $user.officer}
    <div class="max-w-[800px] mx-auto w-full p-4">
        <h1 class="text-3xl font-semibold tracking-tight mb-4">Attendance for Meeting {meetings[0].date}</h1>
        <div class="flex flex-col gap-6 mb-8">
            {#each users as user, index}
                <div class="flex flex-row justify-between p-2 hover:bg-neutral-900 rounded-md ">
                    <div class="flex flex-row gap-4 items-center">
                        <p class="text-xl font-light text-neutral-500">{String(index+1).padStart(2, '0')}</p>
                        <img src={user.profile_picture} alt="Avatar" class="w-6 h-6 rounded-full object-cover"/>
    
                        <p class="text-xl text-black dark:text-neutral-300 font-light">{user.name} '{user.email.split("@")[0].slice(user.email.split("@")[0].length - 2, user.email.split("@")[0].length) }</p>
                    </div>
                    <Check class="w-6 h-6 text-emerald-400"/>
                </div>
            {/each}
        </div>
    </div>
{/if}