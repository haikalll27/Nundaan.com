<template>
  <nav class="bg-blue-500 text-white p-4 flex justify-between items-center">
      <div>
        <img src="https://via.placeholder.com/40" alt="Logo" class="h-10" />
      </div>
    <div class="flex items-center">
      <span class="text-lg font-semibold">{{ currentTime }}</span>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import moment from 'moment-timezone';

export default defineComponent({
  name: 'Navbar',
  data() {
    return {
      currentTime: '',
    };
  },
  methods: {
    updateTime() {
      this.currentTime = moment().tz('Asia/Jakarta').format('DD MMMM YYYY, HH:mm:ss');
    },
  },
  mounted() {
    this.updateTime();
    setInterval(this.updateTime, 1000);
  },
});
</script>