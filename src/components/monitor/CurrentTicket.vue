<template>
    <div class="w-2/3 bg-gray-50 p-8 flex flex-col items-center justify-center">
        <div v-if="filteredTickets.length > 0" class="space-y-6 w-full max-w-2xl">
            <h2 class="text-2xl font-bold mb-4">Current Tickets</h2>
            <div v-for="ticket in filteredTickets" :key="ticket.id"
                class="ticket-card bg-white p-8 rounded-lg shadow-lg">
                <h3 class="text-lg font-semibold text-blue-700">{{ ticket.ticketNumber }} - {{ ticket.name }}</h3>
                <p class="text-gray-600">{{ ticket.serviceName }}</p>
                <p class="text-sm text-gray-500 mt-1">
                    Created: {{ formatDate(ticket.created_at || ticket.createdAt) }}
                </p>
                <button type="button" :disabled="ticket.status === 'completed'" :class="[
                    'mt-4 text-white px-4 py-2 rounded',
                    ticket.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600',
                    ticket.status === 'completed' ? 'disabled:bg-green-400' : 'disabled:bg-gray-400',
                    'disabled:cursor-not-allowed'
                ]">
                    {{ ticket.status === 'processing' ? 'In Progress' : 'Completed' }}
                </button>
            </div>
        </div>
        <div v-else class="text-gray-500 text-lg">
            No tickets being processed
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
    name: 'CurrentTicket',
    props: {
        current: {
            type: Array as PropType<any[]>,
            default: () => [],
            required: true,
        },
    },
    setup(props) {
        const filteredTickets = computed(() => {
            return props.current.filter(
                (ticket: { status: string; }) => ticket.status === 'completed' || ticket.status === 'processing'
            );
        });

        const formatDate = (dateStr: string) => {
            const d = new Date(dateStr);
            return d.toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        };

        return { filteredTickets, formatDate };
    },
});
</script>

<style scoped>
.ticket-card {
    transition: all 0.3s ease;
}

.ticket-card:hover {
    transform: scale(1.02);
}
</style>