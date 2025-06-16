<template>
    <div class="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Ticket To-Do List</h2>

        <div v-if="tickets.length > 0">
            <div v-for="ticket in filteredTickets" :key="ticket.id"
                class="ticket-card bg-white p-4 rounded-lg shadow mb-4">
                <h3 class="text-lg font-semibold text-blue-700">{{ ticket.ticketNumber }} - {{ ticket.name }}</h3>
                <p class="text-gray-600">{{ ticket.serviceName }}</p>
                <p class="text-sm text-gray-500 mt-1">
                    Created: {{ formatDate(ticket.created_at || ticket.createdAt) }}
                </p>

                <div class="mt-3 flex justify-end">
                    <button
                        class="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition">
                       {{ ticket.status === 'pending' ? 'To Do' : 'Processing' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-else class="text-gray-500 text-center mt-8">Tidak ada tiket dalam antrian</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
    name: 'TicketList',
    props: {
        tickets: {
            type: Array as PropType<any[]>,
            required: true,
        },
    },
    setup(props) {
        const filteredTickets = computed(() =>
            props.tickets.filter((ticket) => ticket.status === 'pending')
        );

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

        return {
            filteredTickets,
            formatDate,
        };
    },
});
</script>

<style scoped>
.ticket-card {
    transition: transform 0.2s ease;
}

.ticket-card:hover {
    transform: scale(1.02);
}
</style>
