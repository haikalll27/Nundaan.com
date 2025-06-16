<template>
    <div class="w-2/3 bg-gray-50 p-8 flex items-center justify-center">
        <div v-if="currentTicket" class="ticket-card bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 class="text-2xl font-bold mb-4">Current Ticket</h2>
            <h3 class="text-xl font-semibold">{{ currentTicket.title }}</h3>
            <p class="text-gray-600 mb-4">{{ currentTicket.description }}</p>
            <p class="text-sm text-gray-500">Status: {{ currentTicket.status }}</p>
            <p class="text-sm text-gray-500">Created: {{ currentTicket.createdAt }}</p>
            <button @click="$emit('complete-ticket', currentTicket.id)"
                class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Proses
            </button>
        </div>
        <div v-else class="text-gray-500 text-lg">
            No ticket being processed
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// import { Ticket } from '../types/ticket';

export default defineComponent({
    name: 'CurrentTicket',
    props: {
        currentTicket: {
            type: Object as any,
            default: null,
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