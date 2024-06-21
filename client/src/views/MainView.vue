<script setup lang="ts">
import { login, logout } from '../model/spotify'
import { useAuthStore } from '../stores/auth'
import logo from '../assets/logos/Spotify_Logo_RGB_Green.png'

const authStore = useAuthStore()

</script>

<template>
    <div class="box p-5 mb-2 rounded-3 d-flex align-items-center justify-content-center">
        <div class="text-center">
            <h1 class="display-5 fw-bold">ConcertSyncify</h1>
            <p class="fs-4">Sync your Spotify top artists or genres with upcoming concerts and add them to your
                Google Calendar!</p>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-md-4">
            <div class="box h-100 p-5 rounded-3">
                <h1>Discover New Music Events</h1>
                <p class="fs-4">Never miss a concert again. Discover events for your favorite artists and genres.</p>
            </div>
        </div>
        <div class="col-md-4 px-0">
            <div class="box h-100 p-2 rounded-3">
                <img :src="logo" alt="Spotify Logo" class="img-fluid">
                <div class="d-flex justify-content-center m-3">
                    <button v-if="!authStore.accessToken" @click="login" class="btn btn-success btn-lg">Login with
                        Spotify</button>
                    <button v-else @click="logout" class="btn btn-success btn-lg">Logout</button>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="box h-100 p-5 rounded-3">
                <h1>Easy Calendar Integration</h1>
                <p class="fs-4">Add events directly to your Google Calendar with just a click. Stay organized
                    effortlessly.
                </p>
            </div>
        </div>
    </div>

    <div class="box p-5 mb-2 rounded-3 d-flex align-items-center justify-content-center">
        <div class="text-center">
            <h1>About</h1>
            <p class="fs-4">

            </p>
        </div>
    </div>
</template>

<style scoped>
.row {
    --bs-gutter-x: 1.2rem;
}

img {
    min-width: 70px;
    /* Half the height of the icon as margin */
}

/* Additional styles for better control and responsiveness */
img.img-fluid {
    width: 100%;
    /* Make the image responsive */
    height: auto;
    /* Maintain aspect ratio */
    --logo-height: 100px;
    /* Default logo height, adjust as needed */

    padding: calc(var(--logo-height, 100px) / 2);
}
</style>