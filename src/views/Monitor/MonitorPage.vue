<template>
    <div class="min-h-screen bg-gray-50" ref="appContainer">
        <!-- Navbar -->
        <Navbar />

        <!-- Main Content -->
        <div class="flex fullscreen">
            <!-- Left: Ticket List -->
            <TicketList :tickets="tickets"/>

            <!-- Right: Current Ticket -->
            <CurrentTicket :current="tickets" />
        </div>

        <!-- Fullscreen Button -->
        <button v-if="!isFullscreen" @click="enterFullscreen"
            class="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition">
            Fullscreen Mode
        </button>
    </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { supabase } from '@/utils/supabase';
import Navbar from '@/components/monitor/Navbar.vue';
import TicketList from '@/components/monitor/TicketList.vue';
import CurrentTicket from '@/components/monitor/CurrentTicket.vue';

export default defineComponent({
    name: 'App',
    components: {
        Navbar,
        TicketList,
        CurrentTicket,
    },
    setup() {
        const appContainer = ref<HTMLElement | null>(null);
        const isFullscreen = ref(false);
        const currentTicket = ref<any | null>(null);
        const tickets = ref<any[]>([]);

        // 🧠 Fetch ticket dari Supabase
        const fetchTickets = async () => {
            const { data, error } = await supabase
                .from('ticket')
                .select(`
                    id,
                    ticket_number,
                    status,
                    name,
                    email,
                    phone,
                    service_id,
                    services (name),
                    priority,
                    notes,
                    created_at
                `)
                .order('created_at', { ascending: true });

            if (!error && data) {
                tickets.value = data.map(ticket => ({
                    id: ticket.id,
                    ticketNumber: ticket.ticket_number,
                    serviceId: ticket.service_id,
                    // serviceName: ticket.services?.name || '-',
                    name: ticket.name,
                    phone: ticket.phone || '',
                    email: ticket.email || '',
                    priority: ticket.priority,
                    notes: ticket.notes || '',
                    status: ticket.status,
                    createdAt: ticket.created_at,
                }));

            } else {
                console.error('Fetch error:', error?.message);
            }
        };

        const startProcessing = (ticketId: number) => {
            const ticket = tickets.value.find(t => t.id === ticketId);
            if (ticket) {
                ticket.status = 'In Process';
                currentTicket.value = ticket;
            }
        };

        const completeTicket = (ticketId: number) => {
            const ticket = tickets.value.find(t => t.id === ticketId);
            if (ticket) {
                ticket.status = 'Done';
                currentTicket.value = null;
                tickets.value = tickets.value.filter(t => t.id !== ticketId);
            }
        };

        // 📡 Listen to Supabase Realtime
        const initRealtimeListener = () => {
            supabase
                .channel('ticket-channel')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'ticket',
                    },
                    async payload => {
                        console.log('🟢 Change detected in tickets:', payload);
                        await fetchTickets();
                    }
                )
                .subscribe();
        };

        const enterFullscreen = () => {
            const elem = appContainer.value;
            if (!elem) return;

            const request = elem.requestFullscreen || (elem as any).webkitRequestFullscreen || (elem as any).msRequestFullscreen;
            if (request) {
                request.call(elem);
            }
        };

        const handleFullscreenChange = () => {
            isFullscreen.value = !!document.fullscreenElement ||
                !!(document as any).webkitFullscreenElement ||
                !!(document as any).msFullscreenElement;
        };

        onMounted(() => {
            fetchTickets();
            initRealtimeListener();
            enterFullscreen();

            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.addEventListener('msfullscreenchange', handleFullscreenChange);
        });

        onBeforeUnmount(() => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        });

        return {
            appContainer,
            tickets,
            currentTicket,
            isFullscreen,
            startProcessing,
            completeTicket,
            enterFullscreen,
        };
    },
});
</script>

<style scoped>
.fullscreen {
    height: calc(100vh - 64px);
}

/* Style untuk fullscreen mode */
:fullscreen .fullscreen {
    height: 100vh;
}

:-webkit-full-screen .fullscreen {
    height: 100vh;
}

:-ms-fullscreen .fullscreen {
    height: 100vh;
}
</style>