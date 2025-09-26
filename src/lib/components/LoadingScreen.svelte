<script lang="ts">
	import { onMount } from 'svelte';
	import Logo from '$lib/components/Logo.svelte';

	interface Props {
		message?: string;
		showProgress?: boolean;
	}

	let { message = 'Loading...', showProgress = true }: Props = $props();

	let progress = $state(0);
	let dots = $state('');

	onMount(() => {
		// Animated dots
		const dotsInterval = setInterval(() => {
			dots = dots.length >= 3 ? '' : dots + '.';
		}, 500);

		// Progress animation (if enabled)
		let progressInterval: ReturnType<typeof setInterval> | undefined;
		if (showProgress) {
			progressInterval = setInterval(() => {
				progress = progress >= 100 ? 0 : progress + 1;
			}, 50);
		}

		return () => {
			clearInterval(dotsInterval);
			if (progressInterval) clearInterval(progressInterval);
		};
	});
</script>

<div class="fixed inset-0 bg-neutral-950 flex items-center justify-center z-[9999] font-inter">
	<div class="text-center max-w-sm p-8">
		<!-- Logo/Icon -->
		<Logo size="lg" />

		<!-- Title -->
		<h1 class="text-3xl mt-8 md:text-4xl font-bold text-transparent bg-gradient-to-r from-emerald-100 to-emerald-400 bg-clip-text mb-4 tracking-tight">
			Emerging Tech Club
		</h1>
		

		<!-- Progress bar (optional) -->
		{#if showProgress}
			<div class="mb-8">
				<div class="w-full h-1 bg-slate-700 rounded-full overflow-hidden mb-2">
					<div 
						class="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-300 ease-out shadow-lg shadow-emerald-400/50" 
						style="width: {progress}%"
					></div>
				</div>
				<span class="text-sm text-slate-500 font-medium">{progress}%</span>
			</div>
		{/if}

		<!-- Spinner -->
		<div class="flex justify-center">
			<div class="w-10 h-10 border-3 border-slate-700 border-t-emerald-400 rounded-full animate-spin"></div>
		</div>
	</div>
</div>

<style>
	/* Custom animations not available in Tailwind by default */
	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes pulse-ring {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.7;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.1);
			opacity: 0.3;
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.7;
		}
	}

	.animate-float {
		animation: float 3s ease-in-out infinite;
	}

	.animate-pulse-ring {
		animation: pulse-ring 2s ease-in-out infinite;
	}
</style>