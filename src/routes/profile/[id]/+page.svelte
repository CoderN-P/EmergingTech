<script lang="ts">
	import { page } from '$app/state';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';
	import OfficerBadge from '$lib/components/OfficerBadge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { getAttendedMeetings, getProfile, type AttendedMeeting } from '$lib/getProfile';
	import { user } from '$lib/stores';
	import { supabase } from '$lib/supabaseClient';
	import type { User } from '$lib/types';
	import { toast } from 'svelte-sonner';

	let profile = $state<User | null>(null);
	let attendedMeetings = $state<AttendedMeeting[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let attendanceError = $state<string | null>(null);
	let updateLoading = $state(false);
	let editCurrentPoints = $state(0);
	let editTotalPoints = $state(0);

	const profileId = $derived(page.params.id ?? '');
	const isSignedIn = $derived(!!$user);
	const canEditPoints = $derived(!!$user?.officer && !!profile);

	function resetPointEditor() {
		if (!profile) return;

		editCurrentPoints = profile.current_points;
		editTotalPoints = profile.points;
	}

	async function updateProfilePoints() {
		if (!profile || !canEditPoints || updateLoading) {
			return;
		}

		updateLoading = true;

		const nextCurrentPoints = Math.trunc(Number(editCurrentPoints));
		const nextTotalPoints = Math.trunc(Number(editTotalPoints));

		const { data, error: updateError } = await supabase
			.from('Users')
			.update({
				current_points: nextCurrentPoints,
				points: nextTotalPoints
			})
			.eq('id', profile.id)
			.select('id, created_at, name, email, profile_picture, officer, current_points, points')
			.single();

		updateLoading = false;

		if (updateError || !data) {
			console.error('Error updating profile points:', updateError);
			toast.error('Unable to update points.');
			return;
		}

		profile = data as User;
		resetPointEditor();

		if ($user?.id === profile.id) {
			$user = profile;
		}

		toast.success('Points updated.');
	}

	$effect(() => {
		const id = profileId;
		let cancelled = false;

		if (!id) {
			error = 'Profile not found.';
			loading = false;
			return;
		}

		loading = true;
		error = null;
		attendanceError = null;
		profile = null;
		attendedMeetings = [];

		void (async () => {
			const profileRes = await getProfile(id);

			if (cancelled) {
				return;
			}

			if (profileRes.error || !profileRes.profile) {
				error = 'Profile not found.';
				loading = false;
				return;
			}

			profile = profileRes.profile;
			resetPointEditor();

			if ($user) {
				const attendanceRes = await getAttendedMeetings(id);

				if (cancelled) {
					return;
				}

				if (attendanceRes.error) {
					attendanceError = 'Unable to load attendance history.';
				} else {
					attendedMeetings = attendanceRes.meetings;
				}
			}

			loading = false;
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

{#if loading}
	<LoadingScreen />
{:else if error}
	<div class="mx-auto w-full max-w-3xl p-4">
		<div class="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-neutral-200">
			{error}
		</div>
	</div>
{:else if profile}
	<div class="mx-auto w-full max-w-4xl space-y-6 p-4">
		<section class="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
			<div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
				<div class="flex items-center gap-4">
					<img
						src={profile.profile_picture}
						alt={profile.name}
						class="h-20 w-20 rounded-full border border-neutral-800 object-cover"
					/>
					<div>
						<p class="text-sm tracking-[0.2em] text-neutral-500 uppercase">Profile</p>
						<div class="flex flex-wrap items-center gap-2">
							<h1 class="text-3xl font-semibold tracking-tight text-neutral-100">{profile.name}</h1>
							<OfficerBadge officer={profile.officer} />
						</div>
						{#if isSignedIn}
							<p class="mt-1 text-sm text-neutral-400">{profile.email}</p>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<section class="grid gap-4 sm:grid-cols-2">
			<div class="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
				<p class="text-xs tracking-[0.18em] text-neutral-500 uppercase">Current points</p>
				<p class="mt-2 text-4xl font-semibold text-emerald-400">{profile.current_points}</p>
			</div>
			<div class="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
				<p class="text-xs tracking-[0.18em] text-neutral-500 uppercase">Total points</p>
				<p class="mt-2 text-4xl font-semibold text-neutral-100">{profile.points}</p>
			</div>
		</section>

		{#if canEditPoints}
			<section class="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
				<div class="mb-5">
					<p class="text-sm tracking-[0.2em] text-neutral-500 uppercase">Officer tools</p>
					<h2 class="text-2xl font-semibold tracking-tight text-neutral-100">Update points</h2>
				</div>

				<form
					class="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
					onsubmit={(event) => {
						event.preventDefault();
						void updateProfilePoints();
					}}
				>
					<label class="space-y-2">
						<span class="text-sm font-medium text-neutral-300">Current points</span>
						<Input
							type="number"
							min="0"
							step="1"
							bind:value={editCurrentPoints}
							disabled={updateLoading}
							class="border-neutral-800 bg-neutral-900/60 text-neutral-100"
						/>
					</label>

					<label class="space-y-2">
						<span class="text-sm font-medium text-neutral-300">Total points</span>
						<Input
							type="number"
							min="0"
							step="1"
							bind:value={editTotalPoints}
							disabled={updateLoading}
							class="border-neutral-800 bg-neutral-900/60 text-neutral-100"
						/>
					</label>

					<div class="flex items-end gap-2">
						<Button
							type="submit"
							loading={updateLoading}
							disabled={updateLoading}
							class="bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
						>
							Save
						</Button>
						<Button
							type="button"
							variant="outline"
							disabled={updateLoading}
							onclick={resetPointEditor}
							class="border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100"
						>
							Reset
						</Button>
					</div>
				</form>
			</section>
		{/if}

		{#if isSignedIn}
			<section class="grid gap-4 md:grid-cols-2">
				<div class="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
					<p class="text-xs tracking-[0.18em] text-neutral-500 uppercase">Email</p>
					<p class="mt-2 text-lg text-neutral-200">{profile.email}</p>
				</div>
				<div class="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
					<p class="text-xs tracking-[0.18em] text-neutral-500 uppercase">Meetings attended</p>
					<p class="mt-2 text-4xl font-semibold text-neutral-100">
						{attendedMeetings.length}
					</p>
					{#if attendanceError}
						<p class="mt-2 text-sm text-neutral-500">{attendanceError}</p>
					{/if}
				</div>
			</section>

			{#if attendedMeetings.length > 0}
				<section class="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
					<div class="mb-4">
						<p class="text-sm tracking-[0.2em] text-neutral-500 uppercase">Attendance history</p>
						<h2 class="text-2xl font-semibold tracking-tight text-neutral-100">Recent meetings</h2>
					</div>

					<div class="flex flex-col gap-3">
						{#each attendedMeetings as attendance}
							<div
								class="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
							>
								<div>
									<p class="text-base font-medium text-neutral-100">
										{attendance.meeting?.date ?? 'Meeting'}
									</p>
									<p class="text-sm text-neutral-500">
										Attended {new Date(attendance.attended_at).toLocaleString()}
									</p>
								</div>
								<p class="text-sm text-neutral-400">
									{attendance.meeting_id}
								</p>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		{/if}
	</div>
{/if}
