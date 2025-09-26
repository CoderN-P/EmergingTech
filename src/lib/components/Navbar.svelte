<script>
    import { user } from "$lib/stores";
    import { Button } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { supabase } from "$lib/supabaseClient";
    import { goto } from "$app/navigation";
    import { LogOut } from "lucide-svelte";
    import Logo from "$lib/components/Logo.svelte";
    
</script>


<div class="w-full z-50 mx-auto rounded-none flex items-center justify-between  sticky top-0 bg-white dark:bg-neutral-950/50 backdrop-blur-sm border-b px-4 md:px-16 lg:px-24 py-2 border-gray-200 dark:border-gray-800 ">
    <div class="grow shrink-0 flex items-center flex-row gap-4">
        <Logo size="sm"/>
        <h1 class="text-lg font-semibold ">Emerging Tech Club</h1>
    </div>
    
    <div class="flex flex-row gap-2 grow ">
        <Button variant="link" class="hover:text-emerald-300" onclick={() => goto("/")}>Home</Button>
        <Button variant="link" onclick={() => goto("/events")}>Leaderboard</Button>
        <Button variant="link" onclick={() => goto("/about")}>Rewards</Button>
        {#if $user && $user.officer}
            <Button variant="ghost" onclick={() => goto("/dashboard")}>Dashboard</Button>
        {/if}
    </div>
    
    <div class="grow flex justify-end">
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