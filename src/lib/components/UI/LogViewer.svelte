<script lang="ts">
    import { Logger } from '$lib/utils/logger';
    import type { LogEntry } from '$lib/utils/logger';
    import { onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';

    interface Props {
        onClose: () => void;
    }

    let { onClose }: Props = $props();

    let logs: LogEntry[] = $state([]);
    let filterText = $state('');
    let showDebug = $state(true);
    let showInfo = $state(true);
    let showWarn = $state(true);
    let showError = $state(true);

    const unsubscribe = Logger.logsStore.subscribe(value => {
        logs = value;
    });

    onDestroy(() => {
        unsubscribe();
    });

    let filteredLogs = $derived(logs.filter(log => {
        if (filterText) {
             const messageText = log.message.map(m => (typeof m === 'object' ? JSON.stringify(m) : String(m))).join(' ');
             if (!messageText.toLowerCase().includes(filterText.toLowerCase())) return false;
        }
        if (log.level === 'DEBUG' && !showDebug) return false;
        if (log.level === 'INFO' && !showInfo) return false;
        if (log.level === 'WARN' && !showWarn) return false;
        if (log.level === 'ERROR' && !showError) return false;
        return true;
    }));

    function formatTime(isoString: string) {
        return new Date(isoString).toLocaleTimeString();
    }

    function copyLog(log: LogEntry) {
         const text = log.message.map(m => (typeof m === 'object' ? JSON.stringify(m, null, 2) : String(m))).join(' ');
         navigator.clipboard.writeText(text);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" transition:fade={{ duration: 200 }} onclick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
    <div class="bg-base-100 w-11/12 max-w-5xl h-[80vh] rounded-lg shadow-xl flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="p-4 border-b border-base-300 flex justify-between items-center bg-base-200">
            <h2 class="text-xl font-bold flex items-center gap-2">
                <i class="bi bi-terminal"></i> System Logs
            </h2>
            <div class="flex items-center gap-2">
                 <button class="btn btn-sm btn-error btn-outline" onclick={() => Logger.clear()}>
                    <i class="bi bi-trash"></i> Clear
                </button>
                <button class="btn btn-sm btn-ghost btn-circle" onclick={onClose}>
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        </div>

        <!-- Controls -->
        <div class="p-4 border-b border-base-300 flex flex-wrap gap-4 items-center bg-base-100">
            <input
                type="text"
                class="input input-bordered input-sm flex-grow"
                placeholder="Search logs..."
                bind:value={filterText}
            />
            <div class="flex gap-2">
                <label class="label cursor-pointer gap-2">
                    <span class="label-text text-xs font-bold text-gray-500">DEBUG</span>
                    <input type="checkbox" class="checkbox checkbox-xs" bind:checked={showDebug} />
                </label>
                <label class="label cursor-pointer gap-2">
                    <span class="label-text text-xs font-bold text-blue-500">INFO</span>
                    <input type="checkbox" class="checkbox checkbox-xs checkbox-info" bind:checked={showInfo} />
                </label>
                <label class="label cursor-pointer gap-2">
                    <span class="label-text text-xs font-bold text-yellow-500">WARN</span>
                    <input type="checkbox" class="checkbox checkbox-xs checkbox-warning" bind:checked={showWarn} />
                </label>
                <label class="label cursor-pointer gap-2">
                    <span class="label-text text-xs font-bold text-red-500">ERROR</span>
                    <input type="checkbox" class="checkbox checkbox-xs checkbox-error" bind:checked={showError} />
                </label>
            </div>
        </div>

        <!-- Log List -->
        <div class="flex-grow overflow-y-auto p-4 bg-[#1e1e1e] text-gray-300 font-mono text-sm">
            {#if filteredLogs.length === 0}
                <div class="text-center text-gray-500 mt-10">No logs found.</div>
            {/if}
            {#each filteredLogs as log (log.timestamp + Math.random())}
                <div class="mb-1 hover:bg-[#2d2d2d] p-1 rounded group flex items-start gap-2 break-all border-b border-gray-800">
                    <span class="text-gray-500 shrink-0 select-none text-xs w-[80px] text-right">[{formatTime(log.timestamp)}]</span>

                    {#if log.level === 'DEBUG'}
                        <span class="text-gray-500 font-bold shrink-0 w-12 text-center select-none text-xs">DEBUG</span>
                    {:else if log.level === 'INFO'}
                        <span class="text-blue-400 font-bold shrink-0 w-12 text-center select-none text-xs">INFO</span>
                    {:else if log.level === 'WARN'}
                        <span class="text-yellow-400 font-bold shrink-0 w-12 text-center select-none text-xs">WARN</span>
                    {:else if log.level === 'ERROR'}
                        <span class="text-red-500 font-bold shrink-0 w-12 text-center select-none text-xs">ERROR</span>
                    {/if}

                    <div class="flex-grow overflow-x-auto">
                        {#each log.message as part}
                             {#if typeof part === 'string'}
                                <span class="mr-1">{part}</span>
                             {:else}
                                <span class="mr-1 text-green-300 whitespace-pre-wrap font-mono text-xs">{JSON.stringify(part, null, 2)}</span>
                             {/if}
                        {/each}
                    </div>

                     <button
                        class="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy Log"
                        onclick={() => copyLog(log)}
                    >
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
            {/each}
        </div>
    </div>
</div>
