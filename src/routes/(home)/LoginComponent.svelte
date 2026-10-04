<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	const { redirectTo } = $props();

	let loading = $state(false);
	let error = $state<string | null>(null);

	async function signInWithGoogle() {
		loading = true;
		error = null;

		const { error: authError } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo,
				queryParams: {
					hd: 'mittymonarch.com'
				}
			}
		});

		if (authError) {
			error = 'Failed to sign in. Please try again.';
			loading = false;
			console.error('Sign-in error:', authError.message);
			return;
		}
	}
</script>

<Card.Card class="w-full max-w-md border border-neutral-800 bg-neutral-950 shadow-sm">
	<Card.Content class="p-6">
		<div class="space-y-6">
			<div class="space-y-2">
				<p class="text-sm tracking-[0.2em] text-neutral-500 uppercase">Emerging Tech</p>
				<h1 class="text-3xl font-semibold tracking-tight text-neutral-100">Sign in</h1>
				<p class="text-sm text-neutral-400">Use your Mitty Monarch Google account to continue.</p>
			</div>

			{#if error}
				<div class="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
					{error}
				</div>
			{/if}

			<Button
				{loading}
				onclick={signInWithGoogle}
				disabled={loading}
				class="h-11 w-full bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
			>
				{loading ? 'Redirecting...' : 'Sign in with Google'}
			</Button>
		</div>
	</Card.Content>
</Card.Card>
