<script setup lang="ts">
import { login, logout } from '../model/spotify'
import { useAuthStore } from '../stores/auth'
import logo from '../assets/logos/Spotify_Logo_RGB_Green.png'

const authStore = useAuthStore()

</script>

<template>
    <div class="container mt-2">
        <div class="box p-5 mb-2 rounded-3 d-flex align-items-center justify-content-center">
            <div class="text-center">
                <h1 class="display-5 fw-bold">ConcertSyncify</h1>
                <p class="fs-4">Sync your Spotify top artists or genres with upcoming concerts and add them to your
                    Google Calendar!</p>
            </div>
        </div>

        <div class="row g-3 mb-2">
            <div class="col-md-4">
                <div class="box h-100 p-5 rounded-3">
                    <h1>Discover New Music Events</h1>
                    <p class="fs-4">Never miss a concert again. Discover events for your favorite artists and genres.
                    </p>
                </div>
            </div>
            <div class="col-md-4 p-0">
                <div class="box h-100 rounded-3 d-flex flex-column align-items-center">
                    <img :src="logo" alt="Spotify Logo" class="img-fluid mb-3">
                    <button v-if="!authStore.accessToken" @click="login" class="btn btn-success btn-lg">Login with
                        Spotify</button>
                    <button v-else @click="logout" class="btn btn-success btn-lg">Logout</button>
                </div>
            </div>
            <div class="col-md-4">
                <div class="box h-100 p-5 rounded-3">
                    <h1>Easy Calendar Integration</h1>
                    <p class="fs-4">Add events directly to your Google Calendar with just a click. Stay organized
                        effortlessly.</p>
                </div>
            </div>
        </div>

        <div class="box p-5 rounded-3 d-flex align-items-center justify-content-center">
            <div class="text-center">
                <h1>About</h1>
                <p class="fs-4">
                    <!-- About content goes here -->
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 1rem); /* Make the container take up the full height of the viewport */
    width: 100vw;
}

.box, .row {
    flex: 1; /* Each main div (top box, middle row, bottom box) takes up equal space */
    justify-content: center; /* Center content vertically */
}

/* Adjustments for the row to ensure proper spacing and alignment */
.row {
    --bs-gutter-x: 1.2rem;
}

/* Adjustments for images and additional styles remain unchanged */
img {
    min-width: 70px;
}

img.img-fluid {
    width: 100%;
    height: auto;
    --logo-height: 100px;
    padding: calc(var(--logo-height, 100px) / 2);
}
</style>