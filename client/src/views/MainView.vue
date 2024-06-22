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

        <div class="row mb-md-2">
            <div class="col-md-4 mb-md-0 mb-2">
                <div class="box h-100 p-5 rounded-3">
                    <h1>Discover New Music Events</h1>
                    <p class="fs-4">Never miss a concert again. Discover events for your favorite artists and genres.
                    </p>
                </div>
            </div>
            <div class="col-md-4 px-md-0 mb-md-0 mb-2">
                <div class="box h-100 rounded-3 d-flex flex-column align-items-center">
                    <img :src="logo" alt="Spotify Logo" class="img-fluid mb-3">
                    <div class="p-3">
                        <button v-if="!authStore.accessToken" @click="login" class="btn btn-success">
                            Login with Spotify
                        </button>
                        <button v-else @click="logout" class="btn btn-success">
                            Logout</button>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-md-0 mb-2">
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
    height: calc(100vh - 1rem);
}

.box {
    flex: 1;
}

.row {
    --bs-gutter-x: 1.2rem;
    justify-content: center;
}

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