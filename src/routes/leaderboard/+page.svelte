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
    <div class="flex flex-col gap-2">
        {#each users as user, index}
            <div class="flex flex-row justify-between p-4 border items-center border-neutral-900 rounded-lg shadow hover:shadow-md transition-shadow">
                <div class="flex flex-row gap-4 items-center">
                    <div class="bg-neutral-900 rounded-md flex justify-center items-center w-10 h-10 p-2">
                        <p class="text-xl font-bold text-neutral-200">{index + 1}</p>
                    </div>
                    <img src={user.profile_picture} alt="Avatar" class="w-10 h-10 rounded-full object-cover"/>
                    
                    <p class="text-lg text-black dark:text-white font-medium">{user.name}</p>
                </div>
                <p class="text-lg font-medium text-emerald-400 ">{user.points} pts</p>
            </div>
        {/each}
    </div>
    
    <InfiniteScroll on:infinite={infiniteHandler}/>
</div>