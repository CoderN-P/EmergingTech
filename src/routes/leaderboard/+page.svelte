<script lang="ts">
	import { getLeaderboard } from '$lib/getLeaderboard.js';
	import { getCurrentLeaderboard } from '$lib/getCurrentLeaderboard.js';
	import OfficerBadge from '$lib/components/OfficerBadge.svelte';
	import type { User } from '$lib/types';
	import InfiniteScroll from 'svelte-infinite-loading';

	type LeaderboardMode = 'all-time' | 'current';

	let leaderboardMode = $state<LeaderboardMode>('all-time');
	let page = $state(1);
	let users = $state<User[]>([]);

	function loadLeaderboard(pageNumber: number) {
		return leaderboardMode === 'all-time'
			? getLeaderboard(pageNumber)
			: getCurrentLeaderboard(pageNumber);
	}

	function setLeaderboardMode(mode: LeaderboardMode) {
		if (leaderboardMode === mode) {
			return;
		}

		leaderboardMode = mode;
		page = 1;
		users = [];
	}

	function infiniteHandler({
		detail: { loaded, complete }
	}: CustomEvent<{
		loaded: () => void;
		complete: () => void;
	}>) {
		loadLeaderboard(page).then((data) => {
			if (data.error || data.users.length === 0) {
				complete();
				return;
			}

			page += 1;
			users = [...users, ...data.users];
			loaded();
		});
	}
</script>

<div class="mx-auto w-full max-w-[800px] p-4">
	<h1 class="mb-4 text-3xl font-semibold tracking-tight">Leaderboard</h1>

	<div class="mb-6 inline-flex rounded-lg border border-neutral-800 bg-neutral-950 p-1">
		<button
			class:bg-neutral-800={leaderboardMode === 'all-time'}
			class="rounded-md px-4 py-2 text-sm font-medium text-neutral-300 transition"
			onclick={() => setLeaderboardMode('all-time')}
		>
			All time
		</button>
		<button
			class:bg-neutral-800={leaderboardMode === 'current'}
			class="rounded-md px-4 py-2 text-sm font-medium text-neutral-300 transition"
			onclick={() => setLeaderboardMode('current')}
		>
			Current
		</button>
	</div>

	<p class="mb-4 text-sm text-neutral-500">
		Ranking by {leaderboardMode === 'all-time' ? 'total points' : 'current points'}.
	</p>

	<div class="mb-8 flex flex-col gap-6">
		{#each users as user, index}
			<button
				onclick={() => (window.location.href = `/profile/${user.id}`)}
				class="w-full cursor-pointer text-left"
			>
				<div
					class="flex cursor-pointer flex-row justify-between rounded-md p-2 hover:bg-neutral-900"
				>
					<div class="flex flex-row items-center gap-4">
						<p class="text-xl font-light text-neutral-500">{String(index + 1).padStart(2, '0')}</p>
						<img
							src={user.profile_picture}
							alt="Avatar"
							class="h-6 w-6 rounded-full object-cover"
						/>

						<div class="flex flex-wrap items-center gap-2">
							<p class="text-xl font-light text-black dark:text-neutral-300">
								{user.name} '{user.email
									.split('@')[0]
									.slice(user.email.split('@')[0].length - 2, user.email.split('@')[0].length)}
							</p>
							<OfficerBadge officer={user.officer} />
						</div>
					</div>
					<p class="text-lg font-medium text-emerald-400">
						{leaderboardMode === 'all-time' ? `${user.points} pts` : `${user.current_points} pts`}
					</p>
				</div>
			</button>
		{/each}
	</div>

	{#key leaderboardMode}
		<InfiniteScroll on:infinite={infiniteHandler} />
	{/key}
</div>
