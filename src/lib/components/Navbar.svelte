<script lang="ts">
	import { user } from '$lib/stores';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { LogOut, Menu, X } from 'lucide-svelte';
	import Logo from '$lib/components/Logo.svelte';
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

	function goToProfile() {
		if ($user) {
			goto(`/profile/${$user.id}`);
		}
	}

	function navigateToProfileAndClose() {
		if ($user) {
			navigateAndClose(`/profile/${$user.id}`);
		}
	}

	async function signInWithGoogle() {
		const redirectPath = window.location.pathname + window.location.search;

		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/?redirectTo=${encodeURIComponent(redirectPath)}`,
				queryParams: {
					hd: 'mittymonarch.com'
				}
			}
		});
	}
</script>

<div
	class="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md"
>
	<div class="w-full h-14 flex justify-between px-4 md:px-8">
		<!-- Logo -->
		<a href="/" class="flex w-fit items-center gap-3 transition-opacity hover:opacity-80">
			<Logo size="sm" />
			<h1 class="hidden text-sm font-semibold text-neutral-100 sm:block">Emerging Tech</h1>
		</a>

		<!-- Desktop Navigation -->
		<nav class="hidden items-center justify-center gap-1 sm:flex">
			<a
				href="/"
				class="rounded-md px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-emerald-400"
				>Home</a
			>
			<a
				href="/leaderboard"
				class="rounded-md px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-emerald-400"
				>Leaderboard</a
			>
			{#if $user && $user.officer}
				<a
					href="/dashboard"
					class="rounded-md px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-emerald-400"
					>Dashboard</a
				>
			{/if}
		</nav>

		<!-- User Section -->
		<div class="flex items-center justify-end gap-4">
			{#if $user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="flex h-9 w-9 items-center justify-center rounded-full transition hover:opacity-80"
					>
						<img
							src={$user.profile_picture}
							alt={$user.name}
							class="h-8 w-8 rounded-full border border-emerald-500/30 object-cover"
						/>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						align="end"
						class="w-56 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900"
					>
						<div class="border-b border-neutral-800 px-4 py-3">
							<p class="text-sm font-medium text-neutral-100">{$user.name}</p>
							<p class="text-xs text-neutral-500">{$user.email}</p>
						</div>
						<DropdownMenu.Item
							class="cursor-pointer px-4 py-2 text-neutral-300 hover:bg-neutral-800/50 hover:text-emerald-400"
							onclick={goToProfile}>Profile</DropdownMenu.Item
						>
						{#if $user.officer}
							<DropdownMenu.Item
								class="cursor-pointer px-4 py-2 text-neutral-300 hover:bg-neutral-800/50 hover:text-emerald-400"
								onclick={() => goto('/dashboard')}>Dashboard</DropdownMenu.Item
							>
						{/if}
						<DropdownMenu.Separator class="border-neutral-800" />
						<DropdownMenu.Item
							class="flex cursor-pointer items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
							onclick={async () => {
								await supabase.auth.signOut();
								$user = null;
							}}
						>
							<LogOut class="h-4 w-4" />
							Sign Out
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<button
					onclick={signInWithGoogle}
					class="hidden rounded-md border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:border-emerald-500/30 hover:text-emerald-400 sm:block"
				>
					Sign in
				</button>
			{/if}

			<!-- Mobile Menu Toggle -->
			<button
				onclick={toggleModal}
				aria-label="Open menu"
				class="transition-transform hover:scale-110 active:scale-95 sm:hidden"
			>
				<Menu class="h-6 w-6 text-neutral-300" />
			</button>
		</div>
	</div>
</div>

<!-- Fullscreen Modal -->
{#if isModalOpen}
	<div
		class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-neutral-950"
		transition:fade={{ duration: 300, easing: quintOut }}
	>
		<!-- Modal Header -->
		<div
			class="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-800"
			transition:fly={{ y: -20, duration: 400, delay: 100, easing: quintOut }}
		>
			<div class="flex items-center gap-4">
				<Logo size="sm" />
				<h1 class="text-lg font-semibold">Emerging Tech Club</h1>
			</div>
			<button
				onclick={closeModal}
				aria-label="Close menu"
				class="transition-transform duration-200 hover:scale-110 active:scale-95"
			>
				<X class="h-6 w-6 text-neutral-300 transition-opacity duration-200 hover:opacity-70" />
			</button>
		</div>

		<!-- Modal Content -->
		<div class="flex-1 p-4">
			<nav class="space-y-4">
				<button
					onclick={() => navigateAndClose('/')}
					class="block w-full rounded-lg px-4 py-3 text-left text-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-sm dark:hover:bg-neutral-800"
					transition:fly={{ x: -20, duration: 400, delay: 200, easing: quintOut }}
				>
					Home
				</button>
				<button
					onclick={() => navigateAndClose('/leaderboard')}
					class="block w-full rounded-lg px-4 py-3 text-left text-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-sm dark:hover:bg-neutral-800"
					transition:fly={{ x: -20, duration: 400, delay: 300, easing: quintOut }}
				>
					Leaderboard
				</button>
				{#if $user && $user.officer}
					<button
						onclick={() => navigateAndClose('/dashboard')}
						class="block w-full rounded-lg px-4 py-3 text-left text-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-sm dark:hover:bg-neutral-800"
						transition:fly={{ x: -20, duration: 400, delay: 400, easing: quintOut }}
					>
						Dashboard
					</button>
				{/if}
			</nav>

			<!-- User Section -->
			{#if $user}
				<div
					class="mt-8 space-y-4 border-t border-gray-200 pt-8 dark:border-gray-800"
					transition:fly={{ y: 20, duration: 400, delay: 600, easing: quintOut }}
				>
					<div class="flex items-center gap-4 px-4 py-2">
						<img
							src={$user.profile_picture}
							alt={$user.name}
							class="h-10 w-10 rounded-full transition-transform duration-200 hover:scale-110"
							transition:scale={{ duration: 300, delay: 700, easing: quintOut }}
						/>
						<div transition:fly={{ x: -10, duration: 300, delay: 750, easing: quintOut }}>
							<p class="font-medium">{$user.name || 'User'}</p>
							<p class="text-sm text-gray-500">{$user.email}</p>
						</div>
					</div>

					<button
						onclick={navigateToProfileAndClose}
						class="block w-full rounded-lg px-4 py-3 text-left text-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-sm dark:hover:bg-neutral-800"
						transition:fly={{ x: -20, duration: 400, delay: 800, easing: quintOut }}
					>
						Profile
					</button>

					{#if $user.officer}
						<button
							onclick={() => navigateAndClose('/dashboard')}
							class="block w-full rounded-lg px-4 py-3 text-left text-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-sm dark:hover:bg-neutral-800"
							transition:fly={{ x: -20, duration: 400, delay: 900, easing: quintOut }}
						>
							Officer Dashboard
						</button>
					{/if}

					<button
						onclick={async () => {
							await supabase.auth.signOut();
							$user = null;
							closeModal();
						}}
						class="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-lg text-red-600 transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-sm dark:text-red-400 dark:hover:bg-neutral-800"
						transition:fly={{ x: -20, duration: 400, delay: 1000, easing: quintOut }}
					>
						<LogOut class="h-4 w-4" />
						Sign Out
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
