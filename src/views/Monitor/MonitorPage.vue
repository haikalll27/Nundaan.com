<template>
    <div class="min-h-screen bg-gray-50" ref="appContainer">
        <!-- Navbar -->
        <Navbar />

        <!-- Main Content -->
        <div class="flex fullscreen">
            <TicketList :tickets="tickets" />
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

        let ws: WebSocket | null = null;
        const connectWebSocket = () => {
            ws = new WebSocket('ws://localhost:8080');

            console.log("ws", ws);


            ws.onopen = () => {
                console.log('[WS] Terkoneksi ke WebSocket server');
            };


            ws.onmessage = (event) => {
                try {
                    const { event: evt, message, data } = JSON.parse(event.data);
                    console.log('[WS] Pesan diterima:', evt, message, data);
                    console.log(message, data.evt);
                    if (evt === 'NEW') {
                        const newTicket = {
                            id: data.id,
                            ticketNumber: data.ticket_number,
                            serviceId: data.service_id,
                            serviceName: data.service_name || '-',
                            name: data.name,
                            phone: data.phone || '',
                            email: data.email || '',
                            priority: data.priority,
                            notes: data.notes || '',
                            status: data.status,
                            createdAt: data.created_at || new Date().toISOString(),
                        };

                        // Update tiket kalau udah ada, atau tambah baru
                        const existingIndex = tickets.value.findIndex(t => t.id === newTicket.id);
                        if (existingIndex !== -1) {
                            tickets.value[existingIndex] = newTicket;
                            if (currentTicket.value?.id === newTicket.id) {
                                currentTicket.value = newTicket;
                            }
                        } else {
                            tickets.value.push(newTicket);
                        }
                        console.log('[WS] Tiket diperbarui/ditambahkan:', newTicket);
                    }
                } catch (error: any) {
                    console.error('[WS] Error parsing pesan:', error.message);
                }
            };

            ws.onclose = () => {
                console.log('[WS] Koneksi terputus, reconnect dalam 5 detik...');
                setTimeout(connectWebSocket, 5000);
            };

            ws.onerror = (error) => {
                console.error('[WS] Error:', error);
            };
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
            connectWebSocket();
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