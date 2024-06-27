<script setup lang="ts">
import { googleLogin, googleLogout, isLoggedInGoogle } from '@/model/google';
import { onMounted, ref } from 'vue';

const loggedIn = ref(false)
onMounted(async () => {
    const isLogged = await isLoggedInGoogle()
    loggedIn.value = isLogged
    console.log(isLogged)
})

const handleLogout = async () => {
    await googleLogout();
    const isLogged = await isLoggedInGoogle();
    loggedIn.value = isLogged;
};
</script>

<template>
    <button v-if="!loggedIn" @click="googleLogin" class="btn btn-success">Login with Google</button>
    <button v-else @click="handleLogout" class="btn btn-success">Logout</button>
</template>

<style scoped>

</style>