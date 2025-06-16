<template>
    <div class="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Ticket To-Do List</h2>
        <div v-for="ticket in tickets" :key="ticket.id" class="mb-4">
            <div v-if="ticket.status === 'To Do'" class="ticket-card bg-white p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold">{{ ticket.title }}</h3>
                <p class="text-gray-600">{{ ticket.description }}</p>
                <p class="text-sm text-gray-500">Created: {{ ticket.createdAt }}</p>
                <button @click="$emit('start-processing', ticket.id)"
                    class="mt-2 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600">
                    Todo
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
// import type { Ticket } from '../';

export default defineComponent({
    name: 'TicketList',
    props: {
        tickets: {
            type: Array as PropType<any[]>,
            required: true,
        },
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