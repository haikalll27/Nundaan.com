<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center text-gray-700 dark:text-gray-400"
      @click.prevent="toggleDropdown"
      :disabled="isLoading"
    >
      <span v-if="isLoading" class="mr-3 overflow-hidden rounded-full h-11 w-11 bg-gray-200 animate-pulse"></span>
      <span v-else class="mr-3 overflow-hidden rounded-full h-11 w-11">
        <img src="/images/user/owner.jpg" alt="User" />
      </span>
      <span class="block mr-1 font-medium text-theme-sm">
        {{ isLoading ? 'Loading...' : userData.name }}
      </span>
      <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" />
    </button>

    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
    >
      <div>
        <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
          {{ userData.name }}
        </span>
        <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
          {{ userData.email }}
        </span>
      </div>

      <router-link
        to="/dashboard/signin"
        @click="signOut"
        class="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
      >
        <LogoutIcon class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
        Sign out
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/utils/supabase';
import { UserCircleIcon, ChevronDownIcon, LogoutIcon, SettingsIcon, InfoCircleIcon } from '@/icons';

interface UserData {
  name: string;
  email: string;
}

const dropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const router = useRouter();
const userData = ref<UserData>({ name: 'User', email: 'No email' });
const isLoading = ref(true);

const menuItems = [
  { href: '/profile', icon: UserCircleIcon, text: 'Edit profile' },
  { href: '/chat', icon: SettingsIcon, text: 'Account settings' },
  { href: '/profile', icon: InfoCircleIcon, text: 'Support' },
];

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};

const fetchUserData = async () => {
  isLoading.value = true;
  try {
    // Check session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found');
      router.push('/dashboard/signin');
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('Auth Error:', authError?.message || 'No user logged in');
      router.push('/dashboard/signin');
      return;
    }

    console.log('Authenticated User:', authData.user); // Debug log

    const userId = authData.user.id;
    const userEmail = authData.user.email?.toLowerCase() || 'No email';
    const fallbackName = userEmail.split('@')[0] || 'User';

    // Try to fetch user data from users table
    let { data: userDataFromTable, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    console.log('User Query Result:', { userDataFromTable, userError }); // Debug log

    if (userError && userError.code !== 'PGRST116') {
      console.error('User Query Error:', userError.message);
      // Fallback to auth data
      userData.value = { name: fallbackName, email: userEmail };
      return;
    }

    if (!userDataFromTable) {
      console.log('No user found in users table, inserting new record...');
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: userEmail,
          name: fallbackName,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('name, email')
        .single();

      console.log('Insert Result:', { insertedUser, insertError }); // Debug log

      if (insertError) {
        console.error('Insert Error:', insertError.message);
        // Fallback to auth data
        userData.value = { name: fallbackName, email: userEmail };
        return;
      }

      userDataFromTable = insertedUser;
    }

    // Ensure non-null values
    userData.value = {
      name: userDataFromTable?.name || fallbackName,
      email: userDataFromTable?.email || userEmail,
    };

    console.log('Final userData:', userData.value); // Debug log
  } catch (err) {
    console.error('Unexpected Error:', err);
    // Fallback to safe defaults
    userData.value = { name: 'User', email: 'No email' };
  } finally {
    isLoading.value = false;
  }
};

const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign Out Error:', error.message);
      return;
    }
    closeDropdown();
    router.push('/dashboard/signin');
  } catch (err) {
    console.error('Unexpected Sign Out Error:', err);
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  fetchUserData();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>