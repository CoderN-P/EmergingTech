<script lang="ts">
	import type { User, Meeting } from '$lib/types';
	import { user } from '$lib/stores';
	import { Check, Pencil, Plus, Save, Trash2, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getMeetings } from '$lib/getMeetings';
	import { getAttendees } from '$lib/getAttendees';
	import OfficerBadge from '$lib/components/OfficerBadge.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import DatePicker from '$lib/components/ui/date-picker.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { toast } from 'svelte-sonner';
	import { CalendarDate, type DateValue } from '@internationalized/date';

	let users = $state<User[]>([]);
	let meetings = $state<Meeting[]>([]);
	let upcomingMeetings = $state<Meeting[]>([]);
	let meetingLoading = $state(false);
	let meetingCode = $state('');
	let meetingDate = $state<DateValue | undefined>(undefined);
	let editingMeetingOriginalId = $state<string | null>(null);
	let editingMeetingCode = $state('');
	let editingMeetingDate = $state<DateValue | undefined>(undefined);

	function getTomorrowStart() {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		date.setDate(date.getDate() + 1);
		return date;
	}

	function parseMeetingDate(value: string | DateValue | undefined): Date {
		if (!value) return new Date(NaN);
		
		let dateStr = '';
		if (typeof value === 'string') {
			dateStr = value;
		} else if (value && 'year' in value) {
			// DateValue object
			dateStr = `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
		}
		
		const match = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
		if (!match) return new Date(NaN);
		return new Date(dateStr + 'T00:00:00');
	}

	function isAtLeastTomorrow(value: string | DateValue | undefined) {
		const date = parseMeetingDate(value);
		return !Number.isNaN(date.getTime()) && date >= getTomorrowStart();
	}

	function validateMeetingDate(value: string | DateValue | undefined) {
		const date = parseMeetingDate(value);

		if (Number.isNaN(date.getTime())) {
			toast.error('Enter a valid meeting date.');
			return false;
		}

		if (date < getTomorrowStart()) {
			toast.error('Meetings must be scheduled for tomorrow or later.');
			return false;
		}

		return true;
	}

	function dateValueToIsoString(value: DateValue | undefined): string {
		if (!value || !('year' in value)) return '';
		return `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
	}

	function formatMeetingDate(value: string) {
		const date = parseMeetingDate(value);

		if (Number.isNaN(date.getTime())) {
			return value;
		}

		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function sortMeetingsByDate(a: Meeting, b: Meeting) {
		return parseMeetingDate(a.date).getTime() - parseMeetingDate(b.date).getTime();
	}

	async function loadUpcomingMeetings() {
		const tomorrowStart = getTomorrowStart();

		const { data, error } = await supabase
			.from('Meetings')
			.select('id, date')
			.gte('date', tomorrowStart.toISOString())
			.order('date', { ascending: true });

		if (error) {
			console.error('Error loading upcoming meetings:', error);
			toast.error('Unable to load upcoming meetings.');
			return;
		}

		upcomingMeetings = (data ?? []).filter((meeting) => isAtLeastTomorrow(meeting.date));
	}

	async function addMeeting() {
		const code = meetingCode.trim();
		const dateStr = dateValueToIsoString(meetingDate);

		if (!code || !dateStr || meetingLoading) {
			return;
		}

		if (!validateMeetingDate(meetingDate)) {
			return;
		}

		meetingLoading = true;

		const { data, error } = await supabase
			.from('Meetings')
			.insert({ id: code, date: dateStr })
			.select('id, date')
			.single();

		meetingLoading = false;

		if (error || !data) {
			console.error('Error adding meeting:', error);
			toast.error('Unable to add meeting.');
			return;
		}

		meetingCode = '';
		meetingDate = undefined;
		upcomingMeetings = [...upcomingMeetings, data].sort(sortMeetingsByDate);
		toast.success('Meeting added.');
	}

	function startEditingMeeting(meeting: Meeting) {
		editingMeetingOriginalId = meeting.id;
		editingMeetingCode = meeting.id;
		const dateParts = meeting.date.split('-');
		editingMeetingDate = new CalendarDate(parseInt(dateParts[0]), parseInt(dateParts[1]), parseInt(dateParts[2]));
	}

	function cancelEditingMeeting() {
		editingMeetingOriginalId = null;
		editingMeetingCode = '';
		editingMeetingDate = undefined;
	}

	async function updateMeeting() {
		if (!editingMeetingOriginalId || meetingLoading) {
			return;
		}

		const code = editingMeetingCode.trim();
		const dateStr = dateValueToIsoString(editingMeetingDate);

		if (!code || !dateStr) {
			return;
		}

		if (!validateMeetingDate(editingMeetingDate)) {
			return;
		}

		meetingLoading = true;

		const { data, error } = await supabase
			.from('Meetings')
			.update({ id: code, date: dateStr })
			.eq('id', editingMeetingOriginalId)
			.select('id, date')
			.single();

		meetingLoading = false;

		if (error || !data) {
			console.error('Error updating meeting:', error);
			toast.error('Unable to update meeting.');
			return;
		}

		upcomingMeetings = upcomingMeetings
			.map((meeting) => (meeting.id === editingMeetingOriginalId ? data : meeting))
			.sort(sortMeetingsByDate);
		cancelEditingMeeting();
		toast.success('Meeting updated.');
	}

	async function deleteMeeting(meetingId: string) {
		if (meetingLoading || !window.confirm('Delete this upcoming meeting?')) {
			return;
		}

		meetingLoading = true;

		const { error } = await supabase.from('Meetings').delete().eq('id', meetingId);

		meetingLoading = false;

		if (error) {
			console.error('Error deleting meeting:', error);
			toast.error('Unable to delete meeting.');
			return;
		}

		upcomingMeetings = upcomingMeetings.filter((meeting) => meeting.id !== meetingId);

		if (editingMeetingOriginalId === meetingId) {
			cancelEditingMeeting();
		}

		toast.success('Meeting deleted.');
	}

	onMount(async () => {
		const meetingRes = await getMeetings();

		if (!meetingRes.error && meetingRes.meetings.length > 0) {
			meetings = meetingRes.meetings;

			const latestMeetingID = meetings[0].id;

			const usersRes = await getAttendees(latestMeetingID);

			if (!usersRes.error && usersRes.users.length > 0) {
				users = usersRes.users;
			}
		}

		if ($user?.officer) {
			await loadUpcomingMeetings();
		}
	});
</script>

<div class="mx-auto w-full max-w-[960px] space-y-8 p-4">
	<section class="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
		<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
			<div class="space-y-2">
				<p class="text-sm tracking-[0.2em] text-neutral-500 uppercase">Dashboard</p>
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-3xl font-semibold tracking-tight text-neutral-100">
						Welcome, {$user?.name ?? 'member'}
					</h1>
					{#if $user}
						<OfficerBadge officer={$user.officer} />
					{/if}
				</div>
				<p class="max-w-2xl text-sm text-neutral-400">
					Track your total points and your current points balance at a glance.
				</p>
			</div>

			{#if $user}
				<div class="grid grid-cols-2 gap-3">
					<div class="min-w-36 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
						<p class="text-xs tracking-[0.18em] text-neutral-500 uppercase">Current points</p>
						<p class="mt-2 text-3xl font-semibold text-emerald-400">{$user.current_points}</p>
					</div>
					<div class="min-w-36 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
						<p class="text-xs tracking-[0.18em] text-neutral-500 uppercase">Total points</p>
						<p class="mt-2 text-3xl font-semibold text-neutral-100">{$user.points}</p>
					</div>
				</div>
			{/if}
		</div>
	</section>

	{#if $user && $user.officer}
		<section class="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
			<div class="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div>
					<p class="text-sm tracking-[0.2em] text-neutral-500 uppercase">Meetings</p>
					<h2 class="text-2xl font-semibold tracking-tight text-neutral-100">Upcoming meetings</h2>
				</div>
				<span
					class="w-fit rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-0.5 pt-1 text-xs font-medium text-neutral-400"
				>
					{upcomingMeetings.length} scheduled
				</span>
			</div>

			<form
				class="mb-6 flex w-full gap-3 flex-row justify-between items-end"
				onsubmit={(event) => {
					event.preventDefault();
					void addMeeting();
				}}
			>
				<label class="space-y-2 grow">
					<span class="text-sm font-medium text-neutral-300">Meeting code</span>
					<Input
						bind:value={meetingCode}
						placeholder="ex: oct-meeting"
						disabled={meetingLoading}
						class="border-neutral-800 bg-neutral-900/60 text-neutral-100"
					/>
				</label>

				<label class="gap-1 grow flex flex-col">
					<span class="text-sm font-medium text-neutral-300">Date</span>
					<DatePicker
						bind:value={meetingDate}
						onchange={(date) => {
							meetingDate = date;
						}}
						placeholder="Select a date"
						disabled={meetingLoading}
					/>
				</label>

				<div class="flex items-end">
					<Button
						type="submit"
						loading={meetingLoading}
						disabled={meetingLoading ||
							!meetingCode.trim() ||
							!meetingDate ||
							!isAtLeastTomorrow(meetingDate)}
						class="w-full bg-emerald-500 text-neutral-950 hover:bg-emerald-400 md:w-auto"
					>
						<Plus class="h-4 w-4" />
						Add
					</Button>
				</div>
			</form>

			{#if upcomingMeetings.length > 0}
				<div class="flex flex-col gap-3">
					{#each upcomingMeetings as meeting}
						<div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
							{#if editingMeetingOriginalId === meeting.id}
								<form
									class="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
									onsubmit={(event) => {
										event.preventDefault();
										void updateMeeting();
									}}
								>
									<label class="space-y-2">
										<span class="text-sm font-medium text-neutral-300">Meeting code</span>
										<Input
											bind:value={editingMeetingCode}
											disabled={meetingLoading}
											class="border-neutral-800 bg-neutral-950 text-neutral-100"
										/>
									</label>

									<label class="space-y-2">
										<span class="text-sm font-medium text-neutral-300">Date</span>
										<DatePicker
											bind:value={editingMeetingDate}
											onchange={(date) => {
												editingMeetingDate = date;
											}}
											placeholder="Select a date"
											disabled={meetingLoading}
										/>
									</label>

									<div class="flex items-end gap-2">
										<Button
											type="submit"
											loading={meetingLoading}
											disabled={meetingLoading ||
												!editingMeetingCode.trim() ||
												!editingMeetingDate ||
												!isAtLeastTomorrow(editingMeetingDate)}
											class="bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
										>
											<Save class="h-4 w-4" />
											Save
										</Button>
										<Button
											type="button"
											variant="outline"
											disabled={meetingLoading}
											onclick={cancelEditingMeeting}
											class="border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100"
										>
											<X class="h-4 w-4" />
										</Button>
									</div>
								</form>
							{:else}
								<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
									<div>
										<p class="text-xs tracking-[0.18em] text-neutral-500 uppercase">Code</p>
										<p class="mt-1 text-lg font-medium text-neutral-100">{meeting.id}</p>
										<p class="mt-1 text-sm text-neutral-400">{formatMeetingDate(meeting.date)}</p>
									</div>

									<div class="flex gap-2">
										<Button
											type="button"
											variant="outline"
											disabled={meetingLoading}
											onclick={() => startEditingMeeting(meeting)}
											class="border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100"
										>
											<Pencil class="h-4 w-4" />
											Edit
										</Button>
										<Button
											type="button"
											variant="outline"
											disabled={meetingLoading}
											onclick={() => deleteMeeting(meeting.id)}
											class="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
										>
											<Trash2 class="h-4 w-4" />
											Delete
										</Button>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-400"
				>
					No upcoming meetings scheduled.
				</div>
			{/if}
		</section>
	{/if}

	{#if meetings.length > 0 && $user && $user.officer}
		<section class="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
			<div class="mb-6 flex items-center justify-between gap-4">
				<div>
					<p class="text-sm tracking-[0.2em] text-neutral-500 uppercase">Attendance</p>
					<h2 class="text-2xl font-semibold tracking-tight text-neutral-100">
						Meeting {meetings[0].date}
					</h2>
				</div>
				<span
					class="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 pt-1 text-xs font-medium text-emerald-400"
				>
					{users.length} checked in
				</span>
			</div>

			<div class="flex flex-col gap-3">
				{#each users as user, index}
					<div
						class="flex flex-row items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3"
					>
						<div class="flex flex-row items-center gap-4">
							<p class="text-base font-medium text-neutral-500">
								{String(index + 1).padStart(2, '0')}
							</p>
							<img
								src={user.profile_picture}
								alt="Avatar"
								class="h-8 w-8 rounded-full object-cover"
							/>

							<div class="flex flex-wrap items-center gap-2">
								<p class="text-base font-light text-neutral-200">
									{user.name} '{user.email
										.split('@')[0]
										.slice(user.email.split('@')[0].length - 2, user.email.split('@')[0].length)}
								</p>
								<OfficerBadge officer={user.officer} />
							</div>
						</div>
						<Check class="h-5 w-5 text-emerald-400" />
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
