<script>
    import { nanoid } from "nanoid";
    import { inview } from "svelte-inview";

    const id = nanoid();

    let isInView;
    
    let {
        value,
        initial = 0,
        duration = 3000,
        step = 1,
        roundto = 1,
        format = true,
    } = $props();
    

    function formatNumber(input) {
        if (format) {
            return Math.round(input).toLocaleString();
        }
        return input;
    }

    const counterResult = [];
    const timers = [];

    const max = parseInt(value);
    while (duration / ((max - initial) / step) < 2) {
        step++;
    }

    counterResult[id] = initial;
    timers[id] = setInterval(
        () => {
            if (isInView) {
                if (counterResult[id] < max) {
                    counterResult[id] += step;
                } else {
                    clearInterval(timers[id]);
                    counterResult[id] = Math.round(max / roundto) * roundto;
                }
            }
        },
        duration / ((max - initial) / step)
    );
</script>

<span
        class="text-5xl"
        use:inview
        on:change={(event) => {
    const { inView } = event.detail;
    isInView = inView;
  }}>{formatNumber(counterResult[id])}</span
>