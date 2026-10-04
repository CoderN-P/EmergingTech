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

       const latestMeetingID = meetings[0].id;

       const usersRes = await getAttendees(latestMeetingID);

       if (usersRes.error || usersRes.users.length === 0) {
           return;
       }

       users = usersRes.users;
   });
</script>

<div class="max-w-[960px] mx-auto w-full p-4 space-y-8">
   <section class="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
       <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
           <div class="space-y-2">
               <p class="text-sm uppercase tracking-[0.2em] text-neutral-500">Dashboard</p>
               <h1 class="text-3xl font-semibold tracking-tight text-neutral-100">Welcome, {$user?.name ?? "member"}</h1>
               <p class="max-w-2xl text-sm text-neutral-400">
                   Track your total points and your current points balance at a glance.
               </p>
           </div>

           {#if $user}
               <div class="grid grid-cols-2 gap-3">
                   <div class="min-w-36 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
                       <p class="text-xs uppercase tracking-[0.18em] text-neutral-500">Current points</p>
                       <p class="mt-2 text-3xl font-semibold text-emerald-400">{$user.current_points}</p>
                   </div>
                   <div class="min-w-36 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
                       <p class="text-xs uppercase tracking-[0.18em] text-neutral-500">Total points</p>
                       <p class="mt-2 text-3xl font-semibold text-neutral-100">{$user.points}</p>
                   </div>
               </div>
           {/if}
       </div>
   </section>

   {#if meetings.length > 0 && $user && $user.officer}
       <section class="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
           <div class="mb-6 flex items-center justify-between gap-4">
               <div>
                   <p class="text-sm uppercase tracking-[0.2em] text-neutral-500">Attendance</p>
                   <h2 class="text-2xl font-semibold tracking-tight text-neutral-100">Meeting {meetings[0].date}</h2>
               </div>
               <span class="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                   {users.length} checked in
               </span>
           </div>

           <div class="flex flex-col gap-3">
               {#each users as user, index}
                   <div class="flex flex-row items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                       <div class="flex flex-row items-center gap-4">
                           <p class="text-base font-medium text-neutral-500">{String(index + 1).padStart(2, '0')}</p>
                           <img src={user.profile_picture} alt="Avatar" class="h-8 w-8 rounded-full object-cover" />

                           <p class="text-base font-light text-neutral-200">
                               {user.name} '{user.email.split("@")[0].slice(user.email.split("@")[0].length - 2, user.email.split("@")[0].length)}
                           </p>
                       </div>
                       <Check class="h-5 w-5 text-emerald-400" />
                   </div>
               {/each}
           </div>
       </section>
   {/if}
</div>