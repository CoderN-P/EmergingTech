<script lang="ts">
	import { page } from '$app/state';
	import { user } from '$lib/stores';
	import LoginComponent from './LoginComponent.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { attendMeeting } from '$lib/attendMeeting';
	import * as Card from '$lib/components/ui/card';
	import OfficerBadge from '$lib/components/OfficerBadge.svelte';

	let meetingText = $state('');
	let loading = $state(false);

	async function onClickJoin() {
		if (loading || !$user) return;
		loading = true;
		const result = await attendMeeting(meetingText, $user.id);
		loading = false;

		if (result) {
			meetingText = '';
		}
	}

	function getNextMilestone(points: number) {
		if (points < 20) return 50;
		if (points < 50) return 80;
		if (points < 80) return 110;
		if (points < 110) return 140;
		return Math.ceil(points / 1000) * 1000;
	}

	const nextMilestone = $derived(getNextMilestone($user ? $user.points : 0));
	const progress = $derived($user ? ($user.points / nextMilestone) * 100 : 0);
</script>

{#if $user}
	<div class="mx-auto w-full max-w-[800px] p-4">
		<h1 class="mb-4 text-3xl font-medium text-neutral-100">
			Welcome, <span class="text-emerald-400">{$user.name}</span>!
			<OfficerBadge officer={$user.officer} />
		</h1>

		<Input
			type="text"
			bind:value={meetingText}
			placeholder="Enter meeting ID"
			class="mt-6 mb-4 w-full justify-center rounded-lg border p-3 focus:ring-2 focus:outline-none "
		/>
		<Button
			{loading}
			disabled={!meetingText}
			class="mb-8 w-full bg-emerald-400 p-3 transition-colors"
			onclick={onClickJoin}>Join Meeting</Button
		>

		<Card.Card class="mb-8 overflow-hidden border border-neutral-800 bg-neutral-950 p-0 shadow-sm">
			<Card.Content class="p-6">
				<div class="flex flex-col gap-6">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="text-xl font-semibold text-neutral-100">Points summary</h2>
							<p class="text-sm text-neutral-500">Your current balance and lifetime total.</p>
						</div>
						<div
							class="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 pt-1 text-xs font-medium text-emerald-400"
						>
							{nextMilestone - $user.points} to next milestone
						</div>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div class="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
							<p class="text-xs tracking-[0.18em] text-neutral-500 uppercase">Current points</p>
							<p class="mt-2 text-4xl font-semibold text-emerald-400">{$user.current_points}</p>
						</div>
						<div class="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
							<p class="text-xs tracking-[0.18em] text-neutral-500 uppercase">Total points</p>
							<p class="mt-2 text-4xl font-semibold text-neutral-100">{$user.points}</p>
						</div>
					</div>

					<div class="space-y-2">
						<div class="flex justify-between text-sm text-neutral-400">
							<span>Progress to {nextMilestone} total points</span>
							<span>{$user.points}/{nextMilestone}</span>
						</div>
						<div class="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
							<div
								class="h-2.5 rounded-full bg-emerald-500 transition-all duration-700 ease-out"
								style="width: {Math.min(progress, 100)}%"
							></div>
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Card>
	</div>
{:else}
	<section
		class="mx-auto grid min-h-[calc(100vh-9rem)] w-full max-w-[960px] items-center gap-8 p-4 md:grid-cols-[1fr_420px]"
	>
		<div class="space-y-6">
			<div class="space-y-3">
				<p class="text-sm tracking-[0.2em] text-neutral-500 uppercase">Emerging Tech</p>
				<h1 class="max-w-xl text-4xl font-semibold tracking-tight text-neutral-100 md:text-5xl">
					Keep track of meetings and points.
				</h1>
				<p class="max-w-lg text-base leading-7 text-neutral-400">
					Sign in to check in, view your point balance, and see where you stand on the leaderboard.
				</p>
			</div>

			<div class="flex flex-wrap gap-3">
				<a
					href="/leaderboard"
					class="rounded-md border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-emerald-500/30 hover:text-emerald-400"
				>
					View leaderboard
				</a>
			</div>
		</div>

		<LoginComponent redirectTo={page.url.searchParams.get('redirectTo') ?? '/'} />
	</section>
{/if}
