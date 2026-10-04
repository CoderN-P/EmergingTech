<script lang="ts">
	const { officer = false } = $props<{ officer?: boolean }>();
</script>

{#if officer}
	<span
		class="inline-flex shrink-0 items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 pt-1 text-xs font-medium text-emerald-400"
	>
		Officer
	</span>
{/if}
