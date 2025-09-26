<script>
    const { size = 'md' } = $props();
    
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };
</script>
<div class="relative inline-block">
    <div class="relative z-10 animate-float">
        <svg class={"text-emerald-400 " + sizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" opacity="0.3"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
        </svg>
    </div>
</div>