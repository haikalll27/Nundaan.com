<template>
  <div class="min-h-screen bg-gray-50" ref="appContainer">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <div class="flex fullscreen">
      <!-- Left: Ticket List -->
      <TicketList :tickets="tickets" @start-processing="startProcessing" />

      <!-- Right: Current Ticket -->
      <CurrentTicket :current-ticket="currentTicket" @complete-ticket="completeTicket" />
    </div>

    <!-- Fullscreen Button (Fallback) -->
    <button 
      v-if="!isFullscreen"
      @click="enterFullscreen"
      class="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition"
    >
      Fullscreen Mode
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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
  data() {
    return {
      tickets: [
        { id: 1, title: 'Ticket #1', description: 'Resolve login issue', status: 'To Do', createdAt: '2025-06-16 09:00' },
        { id: 2, title: 'Ticket #2', description: 'Fix payment gateway', status: 'To Do', createdAt: '2025-06-16 10:00' },
        { id: 3, title: 'Ticket #3', description: 'Update user profile', status: 'To Do', createdAt: '2025-06-16 11:00' },
      ] as any[],
      currentTicket: null as any | null,
      isFullscreen: false,
    };
  },
  mounted() {
    this.enterFullscreen();
    
    // Event listeners untuk deteksi perubahan fullscreen
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('msfullscreenchange', this.handleFullscreenChange);
  },
  beforeUnmount() {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('msfullscreenchange', this.handleFullscreenChange);
  },
  methods: {
    startProcessing(ticketId: number) {
      const ticket = this.tickets.find((t) => t.id === ticketId);
      if (ticket) {
        ticket.status = 'In Process';
        this.currentTicket = ticket;
      }
    },
    completeTicket(ticketId: number) {
      const ticket = this.tickets.find((t) => t.id === ticketId);
      if (ticket) {
        ticket.status = 'Done';
        this.currentTicket = null;
        this.tickets = this.tickets.filter((t) => t.id !== ticketId);
      }
    },
    enterFullscreen() {
      const elem = this.$refs.appContainer as HTMLElement;
      
      if (!elem) return;

      if (elem.requestFullscreen) {
        elem.requestFullscreen().then(() => {
          this.isFullscreen = true;
        }).catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
          this.isFullscreen = false;
        });
      } else if (elem.requestFullscreen) { /* Safari */
        elem.requestFullscreen();
        this.isFullscreen = true;
      } else if (elem.requestFullscreen) { /* IE11 */
        elem.requestFullscreen();
        this.isFullscreen = true;
      }
    },
    handleFullscreenChange() {
      this.isFullscreen = !!document.fullscreenElement || 
                         !!(document as any).webkitFullscreenElement || 
                         !!(document as any).msFullscreenElement;
    }
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