<script lang="ts">
    import { page } from "$app/state";
    import LoadingScreen from "$lib/components/LoadingScreen.svelte";
    import { getAttendedMeetings, getProfile, type AttendedMeeting } from "$lib/getProfile";
    import { user } from "$lib/stores";
    import type { User } from "$lib/types";

    let profile = $state<User | null>(null);
    let attendedMeetings = $state<AttendedMeeting[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let attendanceError = $state<string | null>(null);

    const profileId = $derived(page.params.id);
    const isSignedIn = $derived(!!$user);

    $effect(() => {
        const id = profileId;
        let cancelled = false;

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
                error = "Profile not found.";
                loading = false;
                return;
            }

            profile = profileRes.profile;

            if ($user) {
                const attendanceRes = await getAttendedMeetings(id);

                if (cancelled) {
                    return;
                }

                if (attendanceRes.error) {
                    attendanceError = "Unable to load attendance history.";
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
    <div class="mx-auto w-full max-w-4xl p-4 space-y-6">
        <section class="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div class="flex items-center gap-4">
                    <img
                        src={profile.profile_picture}
                        alt={profile.name}
                        class="h-20 w-20 rounded-full object-cover border border-neutral-800"
                    />
                    <div>
                        <p class="text-sm uppercase tracking-[0.2em] text-neutral-500">Profile</p>
                        <h1 class="text-3xl font-semibold tracking-tight text-neutral-100">{profile.name}</h1>
                        {#if isSignedIn}
                            <p class="mt-1 text-sm text-neutral-400">{profile.email}</p>
                        {/if}
                    </div>
                </div>
            </div>
        </section>

        <section class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                <p class="text-xs uppercase tracking-[0.18em] text-neutral-500">Current points</p>
                <p class="mt-2 text-4xl font-semibold text-emerald-400">{profile.current_points}</p>
            </div>
            <div class="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                <p class="text-xs uppercase tracking-[0.18em] text-neutral-500">Total points</p>
                <p class="mt-2 text-4xl font-semibold text-neutral-100">{profile.points}</p>
            </div>
        </section>

        {#if isSignedIn}
            <section class="grid gap-4 md:grid-cols-2">
                <div class="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                    <p class="text-xs uppercase tracking-[0.18em] text-neutral-500">Email</p>
                    <p class="mt-2 text-lg text-neutral-200">{profile.email}</p>
                </div>
                <div class="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                    <p class="text-xs uppercase tracking-[0.18em] text-neutral-500">Meetings attended</p>
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
                        <p class="text-sm uppercase tracking-[0.2em] text-neutral-500">Attendance history</p>
                        <h2 class="text-2xl font-semibold tracking-tight text-neutral-100">Recent meetings</h2>
                    </div>

                    <div class="flex flex-col gap-3">
                        {#each attendedMeetings as attendance}
                            <div class="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                                <div>
                                    <p class="text-base font-medium text-neutral-100">
                                        {attendance.meeting?.date ?? "Meeting"}
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
