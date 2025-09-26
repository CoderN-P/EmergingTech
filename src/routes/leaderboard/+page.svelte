<script lang="ts">
    import {getLeaderboard} from "$lib/getLeaderboard.js";
    import type { User } from "$lib/types";
    import InfiniteScroll  from "svelte-infinite-loading";

    let page = $state(1);
    let users = $state<User[]>([]);
    
    function infiniteHandler({ detail: { loaded, complete } }){
        getLeaderboard(page).then(data => {
            if (data.error || data.users.length === 0) {
                complete();
                return;
            }
            page += 1;
            loaded();
            users = [...users, ...data.users];
            loaded();
        })
    }
</script>

<div class="max-w-[800px] mx-auto w-full">
    <h1 class="text-3xl font-semibold tracking-tight mb-4">Leaderboard</h1>
    <div class="flex flex-col gap-6 mb-8">
        {#each users as user, index}
            <div class="flex flex-row justify-between p-2 hover:bg-neutral-900 rounded-md ">
                <div class="flex flex-row gap-4 items-center">
                    <p class="text-xl font-light text-neutral-500">{String(index+1).padStart(2, '0')}</p>
                    <img src={user.profile_picture} alt="Avatar" class="w-6 h-6 rounded-full object-cover"/>
                    
                    <p class="text-xl text-black dark:text-neutral-300 font-light">{user.name}</p>
                </div>
                <p class="text-lg font-medium text-emerald-400 ">{user.points} pts</p>
            </div>
        {/each}
    </div>
    
    <InfiniteScroll on:infinite={infiniteHandler}/>
</div>