<script lang="ts">
    import { user } from "$lib/stores";
    import { Button } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { supabase } from "$lib/supabaseClient";
    import { goto } from "$app/navigation";
    import { LogOut, X } from "lucide-svelte";
    import { Menu } from "lucide-svelte";
    import Logo from "$lib/components/Logo.svelte";
    import { fade, fly, scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
    let isModalOpen = false;
    
    function toggleModal() {
        isModalOpen = !isModalOpen;
    }
    
    function closeModal() {
        isModalOpen = false;
    }
    
    function navigateAndClose(path: string) {
        goto(path);
        closeModal();
    }
    
</script>


<div class="w-full z-50 mx-auto rounded-none flex items-center justify-between  sticky top-0 bg-white dark:bg-neutral-950/50 backdrop-blur-sm border-b px-4 md:px-16 lg:px-24 py-2 border-gray-200 dark:border-gray-800 ">
    <a tabindex={1} href="/" class="group grow shrink-0 flex items-center flex-row gap-4">
        <Logo size="sm"/>
        <h1 class="text-lg font-semibold group-hover:text-neutral-300">Emerging Tech Club</h1>
    </a>
    
    <div class="flex sm:hidden grow justify-end">
        <button on:click={toggleModal} aria-label="Open menu" class="transition-transform duration-200 hover:scale-110 active:scale-95">
            <Menu class="w-6 h-6 text-neutral-300 hover:opacity-70 transition-opacity duration-200"/>
        </button>
    </div>
    
    <div class="flex-row gap-2 grow hidden sm:flex">
        <Button variant="link" class="hover:text-emerald-300" onclick={() => goto("/")}>Home</Button>
        <Button variant="link" onclick={() => goto("/leaderboard")}>Leaderboard</Button>
        <Button variant="link" onclick={() => goto("/rewards")}>Rewards</Button>
        {#if $user && $user.officer}
            <Button variant="ghost" onclick={() => goto("/dashboard")}>Dashboard</Button>
        {/if}
    </div>
    
    <div class="grow justify-end hidden sm:flex">
    {#if $user}
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <img src={$user.profile_picture} alt="Profile Picture" class="hover:opacity-70 w-8 h-8 rounded-full"/>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" class="w-48 shadow-lg rounded-md overflow-hidden">
                <DropdownMenu.Item class="px-4 py-2 cursor-pointer" onclick={() => goto("/profile")}>Profile</DropdownMenu.Item>
                {#if $user.officer}
                    <DropdownMenu.Item class="px-4 py-2  cursor-pointer" onclick={() => goto("/officer")}>Dashboard</DropdownMenu.Item>
                {/if}
                <DropdownMenu.Separator class="border-t"/>
                <DropdownMenu.Item class="px-4 py-2 cursor-pointer flex flex-row gap-2" onclick={async () => {
                    await supabase.auth.signOut();
                    $user = null;
            
                }}>
                    <LogOut class="w-4 h-4"/>
                    Sign Out
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        
    {:else}
    {/if}
    </div>
</div>

<!-- Fullscreen Modal -->
{#if isModalOpen}
    <div 
        class="fixed inset-0 z-50 bg-white dark:bg-neutral-950 flex flex-col"
        transition:fade={{ duration: 300, easing: quintOut }}
    >
        <!-- Modal Header -->
        <div 
            class="flex items-center justify-between py-2  px-4 border-b border-gray-200 dark:border-gray-800"
            transition:fly={{ y: -20, duration: 400, delay: 100, easing: quintOut }}
        >
            <div class="flex items-center gap-4">
                <Logo size="sm"/>
                <h1 class="text-lg font-semibold">Emerging Tech Club</h1>
            </div>
            <button on:click={closeModal} aria-label="Close menu" class="transition-transform duration-200 hover:scale-110 active:scale-95">
                <X class="w-6 h-6 text-neutral-300 hover:opacity-70 transition-opacity duration-200"/>
            </button>
        </div>
        
        <!-- Modal Content -->
        <div class="flex-1 p-4">
            <nav class="space-y-4">
                <button 
                    on:click={() => navigateAndClose("/")}
                    class="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                    transition:fly={{ x: -20, duration: 400, delay: 200, easing: quintOut }}
                >
                    Home
                </button>
                <button 
                    on:click={() => navigateAndClose("/leaderboard")}
                    class="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                    transition:fly={{ x: -20, duration: 400, delay: 300, easing: quintOut }}
                >
                    Leaderboard
                </button>
                <button 
                    on:click={() => navigateAndClose("/rewards")}
                    class="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                    transition:fly={{ x: -20, duration: 400, delay: 400, easing: quintOut }}
                >
                    Rewards
                </button>
                {#if $user && $user.officer}
                    <button 
                        on:click={() => navigateAndClose("/dashboard")}
                        class="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                        transition:fly={{ x: -20, duration: 400, delay: 500, easing: quintOut }}
                    >
                        Dashboard
                    </button>
                {/if}
            </nav>
            
            <!-- User Section -->
            {#if $user}
                <div 
                    class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4"
                    transition:fly={{ y: 20, duration: 400, delay: 600, easing: quintOut }}
                >
                    <div class="flex items-center gap-4 px-4 py-2">
                        <img 
                            src={$user.profile_picture} 
                            alt="Profile Picture" 
                            class="w-10 h-10 rounded-full transition-transform duration-200 hover:scale-110"
                            transition:scale={{ duration: 300, delay: 700, easing: quintOut }}
                        />
                        <div transition:fly={{ x: -10, duration: 300, delay: 750, easing: quintOut }}>
                            <p class="font-medium">{$user.name || 'User'}</p>
                            <p class="text-sm text-gray-500">{$user.email}</p>
                        </div>
                    </div>
                    
                    <button 
                        on:click={() => navigateAndClose("/profile")}
                        class="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                        transition:fly={{ x: -20, duration: 400, delay: 800, easing: quintOut }}
                    >
                        Profile
                    </button>
                    
                    {#if $user.officer}
                        <button 
                            on:click={() => navigateAndClose("/officer")}
                            class="block w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                            transition:fly={{ x: -20, duration: 400, delay: 900, easing: quintOut }}
                        >
                            Officer Dashboard
                        </button>
                    {/if}
                    
                    <button 
                        on:click={async () => {
                            await supabase.auth.signOut();
                            $user = null;
                            closeModal();
                        }}
                        class="flex items-center gap-2 w-full text-left px-4 py-3 text-lg hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200 text-red-600 dark:text-red-400 hover:scale-[1.02] hover:shadow-sm"
                        transition:fly={{ x: -20, duration: 400, delay: 1000, easing: quintOut }}
                    >
                        <LogOut class="w-4 h-4"/>
                        Sign Out
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}