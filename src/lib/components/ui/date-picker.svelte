<script lang="ts">
	import { Button } from './button/index.js';
	import * as Popover from './popover/index.js';
	import { Calendar } from './calendar/index.js';
	import {Calendar as CalendarIcon, ChevronDownIcon} from 'lucide-svelte';
	import { today, getLocalTimeZone, CalendarDate, type DateValue, DateFormatter } from '@internationalized/date';

	interface Props {
		value?: DateValue;
		onchange?: (date: DateValue) => void;
		placeholder?: string;
		disabled?: boolean;
		minDate?: DateValue;
		class?: string;
	}

	let {
		value = $bindable(),
		onchange,
		placeholder = 'Pick a date',
		disabled = false,
		minDate,
		class: className = ''
	}: Props = $props();

	let isOpen = $state(false);
	let calendarValue = $derived.by(() => {
		if (!value) return undefined;
		try {
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) return undefined;
			return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
		} catch {
			return undefined;
		}
	});

	function formatDisplayDate(dateStr: string): string {
		if (!dateStr) return placeholder;
		try {
			const date = new Date(dateStr);
			if (Number.isNaN(date.getTime())) return placeholder;
			return date.toLocaleDateString('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
		} catch {
			return placeholder;
		}
	}

	function handleDateSelect(date: DateValue) {
		value = date;
		onchange?.(date);
		isOpen = false;
	}

	function handleClear() {
		value = undefined;
		onchange?.(undefined);
		isOpen = false;
	}

	const todayDate = today(getLocalTimeZone());
	const df = new DateFormatter("en-US", {
		dateStyle: "long"
	});
	const effectiveMinDate = minDate || todayDate;
	
	// Get tomorrow's date (only allow picking after today)
	const tomorrowDate = todayDate.add({ days: 1 });
</script>

<Popover.Root bind:open={isOpen}>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
					{...props}
					variant="outline"
					data-empty={!value}
					class="w-full justify-between text-start font-normal data-[empty=true]:text-muted-foreground"
			>
				{value ? df.format(value.toDate(getLocalTimeZone())) : "Pick a date"}
				<ChevronDownIcon data-icon="inline-end" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0" align="start">
		<Calendar type="single" bind:value on:select={(e) => handleDateSelect(e.detail)} minValue={tomorrowDate} />
	</Popover.Content>
</Popover.Root>