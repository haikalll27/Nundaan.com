<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="container mx-auto">
      <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
        <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">Create Ticket</h1>
        <div class="space-y-6">
          <!-- Nomor Antrian -->
          <div class="relative">
            <label for="queueNumber" class="block text-sm font-medium text-gray-700 mb-1">Nomor Antrian</label>
            <div class="relative">
              <input id="queueNumber" v-model="queueNumber" type="number" placeholder="Masukkan Nomor Antrian"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                :disabled="isLoading || !isConnected" @input="validateInput('queueNumber')"
                aria-describedby="queueNumber-error" />
              <HashtagIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p v-if="errors.queueNumber" id="queueNumber-error" class="text-red-500 text-sm mt-1">{{ errors.queueNumber
            }}</p>
          </div>

          <!-- Jenis Layanan -->
          <div class="relative">
            <label for="serviceType" class="block text-sm font-medium text-gray-700 mb-1">Jenis Layanan</label>
            <div class="relative">
              <select id="serviceType" v-model="serviceType"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 appearance-none"
                :disabled="isLoading || !isConnected" @change="validateInput('serviceType')"
                aria-describedby="serviceType-error">
                <option value="" disabled>Pilih Jenis Layanan</option>
                <option value="Layanan A">Layanan A</option>
                <option value="Layanan B">Layanan B</option>
                <option value="Layanan C">Layanan C</option>
              </select>
              <CogIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p v-if="errors.serviceType" id="serviceType-error" class="text-red-500 text-sm mt-1">{{ errors.serviceType
            }}</p>
          </div>

          <!-- Nama -->
          <div class="relative">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <div class="relative">
              <input id="name" v-model="name" type="text" placeholder="Masukkan Nama"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                :disabled="isLoading || !isConnected" @input="validateInput('name')" aria-describedby="name-error" />
              <UserIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p v-if="errors.name" id="name-error" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>

          <!-- No Handphone (Opsional) -->
          <div class="relative">
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">No Handphone (Opsional)</label>
            <div class="relative">
              <input id="phone" v-model="phone" type="tel" placeholder="Masukkan No Handphone"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                :disabled="isLoading || !isConnected" @input="validateInput('phone')" aria-describedby="phone-error" />
              <PhoneIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p v-if="errors.phone" id="phone-error" class="text-red-500 text-sm mt-1">{{ errors.phone }}</p>
          </div>

          <!-- Email (Opsional) -->
          <div class="relative">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email (Opsional)</label>
            <div class="relative">
              <input id="email" v-model="email" type="email" placeholder="Masukkan Email"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                :disabled="isLoading || !isConnected" @input="validateInput('email')" aria-describedby="email-error" />
              <EnvelopeIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p v-if="errors.email" id="email-error" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <!-- Status Koneksi -->
          <div v-if="!isConnected" class="flex items-center justify-center text-yellow-600 text-sm mt-4">
            <ArrowPathIcon class="h-5 w-5 mr-2 animate-spin" />
            Menghubungkan ke server...
          </div>

          <!-- Notifikasi Sukses/Gagal -->
          <div v-if="notification.message"
            :class="['p-4 rounded-lg flex items-center', notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
            <CheckCircleIcon v-if="notification.type === 'success'" class="h-5 w-5 mr-2" />
            <ExclamationCircleIcon v-else class="h-5 w-5 mr-2" />
            {{ notification.message }}
          </div>
        </div>

        <!-- Tombol Panggil -->
        <button @click="callQueue" :disabled="!isFormValid || isLoading || !isConnected"
          class="w-full mt-8 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center">
          <svg v-if="isLoading" class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          {{ isLoading ? 'Memanggil...' : 'Panggil Antrian' }}
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { useWebSocket } from '@/composables/useWebSocket';
import { HashtagIcon, CogIcon, UserIcon, PhoneIcon, EnvelopeIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';

const currentPageTitle = ref<string>('Caller');
const queueNumber = ref<string>('');
const serviceType = ref<string>('');
const name = ref<string>('');
const phone = ref<string>('');
const email = ref<string>('');
const errors = ref<{ [key: string]: string }>({
  queueNumber: '',
  serviceType: '',
  name: '',
  phone: '',
  email: '',
});
const isLoading = ref<boolean>(false);
const notification = ref<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });

const { sendMessage, isConnected } = useWebSocket();

const validateInput = (field: string) => {
  switch (field) {
    case 'queueNumber':
      if (!queueNumber.value || Number(queueNumber.value) <= 0) {
        errors.value.queueNumber = 'Nomor antrian harus lebih besar dari 0';
      } else {
        errors.value.queueNumber = '';
      }
      break;
    case 'serviceType':
      if (!serviceType.value) {
        errors.value.serviceType = 'Pilih jenis layanan';
      } else {
        errors.value.serviceType = '';
      }
      break;
    case 'name':
      if (!name.value.trim()) {
        errors.value.name = 'Nama harus diisi';
      } else {
        errors.value.name = '';
      }
      break;
    case 'phone':
      if (phone.value.trim() && !/^\+?\d{10,13}$/.test(phone.value.trim())) {
        errors.value.phone = 'No handphone tidak valid (10-13 digit)';
      } else {
        errors.value.phone = '';
      }
      break;
    case 'email':
      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        errors.value.email = 'Email tidak valid';
      } else {
        errors.value.email = '';
      }
      break;
  }
};

const isFormValid = computed(() => {
  return (
    queueNumber.value &&
    Number(queueNumber.value) > 0 &&
    serviceType.value &&
    name.value.trim() &&
    (!phone.value.trim() || /^\+?\d{10,13}$/.test(phone.value.trim())) &&
    (!email.value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
  );
});

const callQueue = async () => {
  validateInput('queueNumber');
  validateInput('serviceType');
  validateInput('name');
  validateInput('phone');
  validateInput('email');

  if (!isFormValid.value) {
    notification.value = { message: 'Harap isi semua field yang diperlukan dengan benar.', type: 'error' };
    setTimeout(() => {
      notification.value = { message: '', type: '' };
    }, 3000);
    return;
  }

  isLoading.value = true;
  try {
    const queueData = {
      queueNumber: queueNumber.value,
      serviceType: serviceType.value,
      name: name.value.trim(),
      phone: phone.value.trim() || '',
      email: email.value.trim() || '',
      ticket: queueNumber.value,
    };
    console.log('Sending queue data:', queueData);
    await sendMessage(JSON.stringify(queueData));
    if ('speechSynthesis' in window) {
      const textToSpeak = `Nomor antrian: ${queueData.queueNumber}, Tiket: ${queueData.ticket}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      utterance.volume = 1;
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Browser tidak mendukung Web Speech API.');
    }

    console.log('Queue data sent successfully');
    notification.value = { message: 'Antrian berhasil dipanggil.', type: 'success' };
    setTimeout(() => {
      notification.value = { message: '', type: '' };
    }, 3000);

    // Reset form
    queueNumber.value = '';
    serviceType.value = '';
    name.value = '';
    phone.value = '';
    email.value = '';
    errors.value = { queueNumber: '', serviceType: '', name: '', phone: '', email: '' };
  } catch (error: any) {
    console.error('Error sending queue data:', error);
    notification.value = { message: error.message || 'Gagal memanggil antrian. Coba lagi.', type: 'error' };
    setTimeout(() => {
      notification.value = { message: '', type: '' };
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};
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