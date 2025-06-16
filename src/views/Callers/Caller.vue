<template>
  <AdminLayout>
    <div
      class="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
      <div class="mx-auto w-full max-w-7xl">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-2xl font-bold text-gray-800 dark:text-white">List Ticket</h3>
          <div class="flex items-center gap-4">
            <div class="relative w-64">
              <input v-model="searchQuery" type="text" placeholder="Cari nomor, nama, atau layanan..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                aria-label="Search tickets" />
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <button @click="openAddModal"
              class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2">
              <PlusIcon class="h-5 w-5" />
              Tambah Antrian
            </button>
          </div>
        </div>

        <!-- Notifikasi -->
        <div v-if="notification.message" :class="[
          'p-4 rounded-lg flex items-center mb-6',
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
        ]">
          <CheckCircleIcon v-if="notification.type === 'success'" class="h-5 w-5 mr-2" />
          <ExclamationCircleIcon v-else class="h-5 w-5 mr-2" />
          {{ notification.message }}
        </div>

        <!-- Kolom Kanban -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div v-for="(column, index) in filteredColumns" :key="index"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="mb-4 text-lg font-semibold text-gray-700 dark:text-white flex justify-between items-center">
              {{ column.title }}
              <span class="text-sm text-gray-500 dark:text-gray-400">({{ column.tickets.length }})</span>
            </h4>
            <draggable v-model="column.tickets" group="tickets" item-key="id" @end="onDragEnd($event, column)"
              class="space-y-4 min-h-[100px]">
              <template #item="{ element: ticket }">
                <div
                  class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 animate-fade-in">
                  <div class="flex justify-between items-start">
                    <h5 class="font-medium text-gray-800 dark:text-white">
                      Nomor: {{ ticket.ticketNumber }}
                    </h5>
                    <div class="flex gap-2">
                      <button @click="openEditModal(ticket, column)"
                        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        aria-label="Edit ticket">
                        <PencilIcon class="h-5 w-5" />
                      </button>
                      <button @click="deleteTicket(ticket, column)"
                        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        aria-label="Delete ticket">
                        <TrashIcon class="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    <strong>Layanan:</strong> {{ ticket.serviceName }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-300">
                    <strong>Nama:</strong> {{ ticket.name }}
                  </p>
                  <p v-if="ticket.phone" class="text-sm text-gray-500 dark:text-gray-300">
                    <strong>Phone:</strong> {{ ticket.phone }}
                  </p>
                  <p v-if="ticket.email" class="text-sm text-gray-500 dark:text-gray-300">
                    <strong>Email:</strong> {{ ticket.email }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-300">
                    <strong>Prioritas:</strong> {{ ticket.priority }}
                  </p>
                  <p v-if="ticket.notes" class="text-sm text-gray-500 dark:text-gray-300">
                    <strong>Catatan:</strong> {{ ticket.notes }}
                  </p>
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <!-- Modal Tambah/Edit -->
        <Modal v-if="showModal" :fullScreenBackdrop="true" @close="closeModal">
          <template #body>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md z-1">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {{ isEditMode ? 'Edit Antrian' : 'Tambah Antrian' }}
              </h3>
              <form @submit.prevent="saveTicket" class="z-1">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nomor Antrian</label>
                    <input v-model="form.ticketNumber" type="text" :disabled="true"
                      class="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Otomatis oleh sistem" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Layanan</label>
                    <select v-model="form.serviceId"
                      class="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required>
                      <option value="" disabled>Pilih Layanan</option>
                      <option v-for="service in services" :key="service.id" :value="service.id">
                        {{ service.name }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama</label>
                    <input v-model="form.name" type="text"
                      class="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">No Handphone
                      (Opsional)</label>
                    <input v-model="form.phone" type="tel"
                      class="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email (Opsional)</label>
                    <input v-model="form.email" type="email"
                      class="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Prioritas</label>
                    <select v-model="form.priority"
                      class="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required>
                      <option value="low">Rendah</option>
                      <option value="medium">Sedang</option>
                      <option value="high">Tinggi</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Catatan (Opsional)</label>
                    <textarea v-model="form.notes"
                      class="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows="4"></textarea>
                  </div>
                </div>
                <div class="mt-6 flex justify-end gap-2">
                  <button type="button" @click="closeModal"
                    class="px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    Batal
                  </button>
                  <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </template>
        </Modal>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Modal from '@/components/ui/Modal.vue';
import { triggerPusherEvent } from '@/composables/triggerPusherEvent';
import draggable from 'vuedraggable';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import { supabase } from '@/utils/supabase';
// import usePusher from '@/composables/usePusher';

// State management
const currentPageTitle = ref('Kanban Antrian');
const columns = ref([
  { title: 'To Do', status: 'pending', tickets: [] },
  { title: 'In Progress', status: 'processing', tickets: [] },
  { title: 'Done', status: 'completed', tickets: [] },
  { title: 'Cancelled', status: 'cancelled', tickets: [] },
]);
const services = ref([]);
const searchQuery = ref('');
const showModal = ref(false);
const isEditMode = ref(false);
const currentColumn = ref(null);
const currentTicket = ref(null);
const notification = ref({ message: '', type: '' });
const form = ref({
  id: null,
  ticketNumber: '',
  serviceId: null,
  name: '',
  phone: '',
  email: '',
  priority: 'medium',
  notes: '',
  status: 'pending',
});

const getAccessToken = () => {
  try {
    const raw = localStorage.getItem('sb-nbhsvuqycjizirnusafy-auth-token');
    const token = JSON.parse(raw)?.access_token;
    return token;
  } catch (error) {
    console.error('Gagal mengambil access_token:', error);
    return null;
  }
};

const token = getAccessToken();

// Fetch services from Supabase
const fetchServices = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    services.value = data;
  } catch (error) {
    notification.value = { message: `Gagal mengambil layanan: ${error.message}`, type: 'error' };
    setTimeout(() => (notification.value = { message: '', type: '' }), 3000);
  }
};

// Fetch tickets from Supabase
const fetchTickets = async () => {
  try {
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
        notes
      `)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Clear existing tickets
    columns.value.forEach(column => (column.tickets = []));

    // Distribute tickets to columns based on status
    data.forEach(ticket => {
      const column = columns.value.find(col => col.status === ticket.status);
      if (column) {
        column.tickets.push({
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          serviceId: ticket.service_id,
          serviceName: ticket.services.name,
          name: ticket.name,
          phone: ticket.phone || '',
          email: ticket.email || '',
          priority: ticket.priority,
          notes: ticket.notes || '',
          status: ticket.status,
        });
      }
    });
  } catch (error) {
    notification.value = { message: `Gagal mengambil data: ${error.message}`, type: 'error' };
    setTimeout(() => (notification.value = { message: '', type: '' }), 3000);
  }
};

// Computed property for filtering tickets
const filteredColumns = computed(() => {
  if (!searchQuery.value) return columns.value;
  const query = searchQuery.value.toLowerCase();
  return columns.value.map((column) => ({
    ...column,
    tickets: column.tickets.filter(
      (ticket) =>
        ticket.ticketNumber.toLowerCase().includes(query) ||
        ticket.name.toLowerCase().includes(query) ||
        ticket.serviceName.toLowerCase().includes(query)
    ),
  }));
});


// Modal handlers
const openAddModal = () => {
  form.value = {
    id: null,
    ticketNumber: '',
    serviceId: null,
    name: '',
    phone: '',
    email: '',
    priority: 'medium',
    notes: '',
    status: 'pending',
  };
  isEditMode.value = false;
  showModal.value = true;
};

const openEditModal = (ticket, column) => {
  form.value = { ...ticket };
  isEditMode.value = true;
  currentColumn.value = column;
  currentTicket.value = ticket;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  currentColumn.value = null;
  currentTicket.value = null;
};

// Save ticket (Create or Update)
const saveTicket = async () => {
  if (!form.value.serviceId || !form.value.name) {
    notification.value = { message: 'Harap isi semua field wajib.', type: 'error' };
    setTimeout(() => (notification.value = { message: '', type: '' }), 3000);
    return;
  }

  try {
    if (isEditMode.value && currentTicket.value) {
      // Update ticket in Supabase
      const { error } = await supabase
        .from('ticket')
        .update({
          service_id: form.value.serviceId,
          name: form.value.name,
          phone: form.value.phone || null,
          email: form.value.email || null,
          priority: form.value.priority,
          notes: form.value.notes || null,
          status: form.value.status,
          completed_at: form.value.status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', currentTicket.value.id, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

      if (error) throw error;

      notification.value = { message: 'Antrian berhasil diperbarui.', type: 'success' };
    } else {
      // Create new ticket in Supabase
      const { data, error } = await supabase
        .from('ticket')
        .insert({
          service_id: form.value.serviceId,
          name: form.value.name,
          phone: form.value.phone || null,
          email: form.value.email || null,
          priority: form.value.priority,
          notes: form.value.notes || null,
          status: form.value.status,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).select();

      const { error: errTriger } = await supabase.channel('caller-channel')
        .send({
          type: 'broadcast',
          event: 'new-ticket',
          data,
        });

      if (errTriger) {
        console.error('Send error:', error);
      }

      if (error) throw error;

      notification.value = { message: 'Antrian berhasil ditambahkan.', type: 'success' };
    }

    // Refresh tickets
    await fetchTickets();
    setTimeout(() => (notification.value = { message: '', type: '' }), 3000);
    closeModal();
  } catch (error) {
    notification.value = { message: `Gagal menyimpan antrian: ${error.message}`, type: 'error' };
    setTimeout(() => (notification.value = { message: '', type: '' }), 3000);
  }
};

// Delete ticket
const deleteTicket = async (ticket, column) => {
  if (confirm(`Hapus antrian ${ticket.ticketNumber}?`)) {
    try {
      const { error } = await supabase
        .from('ticket')
        .delete({}, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        .eq('id', ticket.id);

      if (error) throw error;

      // Remove ticket from local state
      column.tickets = column.tickets.filter((t) => t.id !== ticket.id);
      notification.value = { message: 'Antrian berhasil dihapus.', type: 'success' };
      setTimeout(() => (notification.value = { message: '', type: '' }), 3000);
    } catch (error) {
      notification.value = { message: `Gagal menghapus antrian: ${error.message}`, type: 'error' };
      setTimeout(() => (notification.value = { message: '', type: '' }), 3000);
    }
  }
};

// Handle drag-and-drop
const onDragEnd = async (event, targetColumn) => {
  try {
    const ticket = targetColumn.tickets[event.newIndex];
    const newStatus = targetColumn.status;

    // Update ticket status in Supabase
    const { error } = await supabase
      .from('ticket')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', ticket.id, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

    if (error) throw error;

    notification.value = { message: 'Antrian berhasil dipindahkan.', type: 'success' };
    setTimeout(() => (notification.value = { message: '', type: '' }), 3000);
  } catch (error) {
    notification.value = { message: `Gagal memindahkan antrian: ${error.message}`, type: 'error' };
    setTimeout(() => (notification.value = { message: '', type: '' }), 3000);
    // Re-fetch to revert any local changes
    await fetchTickets();
  }
};

// Fetch data on component mount
onMounted(async () => {
  await Promise.all([fetchServices(), fetchTickets()]);
});
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
</style>