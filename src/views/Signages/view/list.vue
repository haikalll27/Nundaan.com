<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
        <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">Signage Antrian</h1>
        <div class="text-center space-y-6">
          <!-- Nomor Antrian -->
          <div>
            <p class="text-lg text-gray-600 font-medium">Nomor Antrian Saat Ini:</p>
            <p v-if="currentQueue" class="text-5xl sm:text-6xl font-bold text-blue-600 mt-2 animate-pulse">
              {{ currentQueue.queueNumber }}
            </p>
            <p v-else class="text-lg text-gray-500 mt-2">Menunggu nomor antrian...</p>
          </div>

          <!-- Informasi Antrian -->
          <div v-if="currentQueue" class="space-y-3">
            <p class="text-lg text-gray-700 flex items-center justify-center">
              <CogIcon class="h-5 w-5 mr-2 text-gray-500" />
              <span class="font-semibold">Layanan:</span> {{ currentQueue.serviceType }}
            </p>
            <p class="text-lg text-gray-700 flex items-center justify-center">
              <UserIcon class="h-5 w-5 mr-2 text-gray-500" />
              <span class="font-semibold">Nama:</span> {{ currentQueue.name }}
            </p>
            <p v-if="currentQueue.phone" class="text-lg text-gray-700 flex items-center justify-center">
              <PhoneIcon class="h-5 w-5 mr-2 text-gray-500" />
              <span class="font-semibold">No Handphone:</span> {{ currentQueue.phone }}
            </p>
            <p v-if="currentQueue.email" class="text-lg text-gray-700 flex items-center justify-center">
              <EnvelopeIcon class="h-5 w-5 mr-2 text-gray-500" />
              <span class="font-semibold">Email:</span> {{ currentQueue.email }}
            </p>
          </div>

          <!-- Status Koneksi -->
          <p class="text-sm mt-4 flex items-center justify-center">
            <span class="font-medium">Status Koneksi:</span> 
            <span :class="isConnected ? 'text-green-600' : 'text-yellow-600'">
              {{ isConnected ? 'Terhubung' : 'Menghubungkan ke server...' }}
              <ArrowPathIcon v-if="!isConnected" class="inline-block h-5 w-5 ml-2 animate-spin" />
              <CheckCircleIcon v-else class="inline-block h-5 w-5 ml-2" />
            </span>
          </p>

          <!-- Notifikasi -->
          <div v-if="notification.message" :class="['p-4 rounded-lg flex items-center justify-center', notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
            <CheckCircleIcon v-if="notification.type === 'success'" class="h-5 w-5 mr-2" />
            <ExclamationCircleIcon v-else class="h-5 w-5 mr-2" />
            {{ notification.message }}
          </div>

          <!-- Tombol Aktifkan Suara -->
          <button
            v-if="!audioEnabled"
            @click="enableAudio"
            :disabled="isLoading || !currentQueue"
            class="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
          >
            <svg v-if="isLoading" class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <SpeakerWaveIcon class="h-5 w-5 mr-2" v-if="!isLoading" />
            {{ isLoading ? 'Mengaktifkan...' : 'Aktifkan Suara' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { useWebSocket } from '@/composables/useWebSocket';
import { CogIcon, UserIcon, PhoneIcon, EnvelopeIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, SpeakerWaveIcon } from '@heroicons/vue/24/outline';

interface QueueData {
  queueNumber: string;
  serviceType: string;
  name: string;
  phone: string;
  email: string;
  ticket: string;
}

const currentPageTitle = ref<string>('Signage');
const currentQueue = ref<QueueData | null>(null);
const audioEnabled = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const notification = ref<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });

const { message, isConnected } = useWebSocket();

const loadVoices = () => {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });
};

const enableAudio = async () => {
  if (!currentQueue.value) {
    notification.value = { message: 'Tidak ada data antrian untuk dibaca.', type: 'error' };
    setTimeout(() => {
      notification.value = { message: '', type: '' };
    }, 3000);
    return;
  }

  isLoading.value = true;
  try {
    if ('speechSynthesis' in window) {
      const textToSpeak = `Nomor antrian: ${currentQueue.value.queueNumber}, Tiket: ${currentQueue.value.ticket}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      utterance.volume = 1.0;
      utterance.rate = 0.9;
      const voices = await loadVoices();
      const femaleVoice = voices.find((v) => v.name.toLowerCase().includes('female') || v.lang === 'id-ID') || voices[0];
      utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
      audioEnabled.value = true;
      notification.value = { message: 'Suara berhasil diaktifkan.', type: 'success' };
      setTimeout(() => {
        notification.value = { message: '', type: '' };
      }, 3000);
    } else {
      throw new Error('Browser tidak mendukung Web Speech API.');
    }
  } catch (e) {
    console.error('Text-to-speech failed:', e);
    notification.value = { message: 'Gagal mengaktifkan suara.', type: 'error' };
    setTimeout(() => {
      notification.value = { message: '', type: '' };
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

watch(
  message,
  async (newMessage) => {
    console.log('Watch triggered with message:', newMessage);
    if (newMessage) {
      try {
        currentQueue.value = JSON.parse(newMessage) as QueueData;
        console.log('Updated currentQueue:', currentQueue.value);
        if (audioEnabled.value) {
          const utterance = new SpeechSynthesisUtterance();
          utterance.text = `Nomor antrian ${currentQueue.value?.queueNumber}, layanan ${currentQueue.value?.serviceType}, atas nama ${currentQueue.value?.name}. Silakan menuju loket.`;
          utterance.lang = 'id-ID';
          utterance.volume = 1.0;
          utterance.rate = 0.9;
          const voices = await loadVoices();
          const femaleVoice = voices.find((v) => v.name.toLowerCase().includes('female') || v.lang === 'id-ID') || voices[0];
          utterance.voice = femaleVoice;
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        notification.value = { message: 'Gagal memproses data antrian.', type: 'error' };
        setTimeout(() => {
          notification.value = { message: '', type: '' };
        }, 3000);
      }
    }
  },
  { immediate: true },
);
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

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>