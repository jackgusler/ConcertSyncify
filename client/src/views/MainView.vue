<script setup lang="ts">
import { spotifyLogin, spotifyLogout, isLoggedInSpotify } from '../model/spotify'
import logo from '../assets/logos/Spotify_Logo_RGB_Green.png'
import { onMounted, ref } from 'vue';

const loggedIn = ref(false)
onMounted(async () => {
    const isLogged = await isLoggedInSpotify()
    loggedIn.value = isLogged
})

</script>

<template>
    <div class="container mt-2 custom-margin-end">
        <div class="box p-md-5 p-3 mb-2 rounded-3 d-flex align-items-center justify-content-center">
            <div class="text-center">
                <h1 class="fw-bold larger-title medium-title mb-md-1 mb-0">
                    Concert Syncify
                </h1>
            </div>
        </div>

        <div class="row mb-md-2 h-100">
            <div class="col-md-4 mb-md-0 mb-2">
                <div class="box h-100 p-lg-5 p-3 rounded-3">
                    <h1>Discover New Music Events</h1>
                    <p class="fs-4 mb-md-1 mb-0">Never miss a concert again. Discover events for your favorite artists
                        and genres, or
                        find new ones to explore.
                    </p>
                </div>
            </div>
            <div class="col-md-4 px-md-0 mb-md-0 mb-2">
                <div class="box h-100 rounded-3 d-flex flex-column align-items-center">
                    <img :src="logo" alt="Spotify Logo" class="img-fluid mb-3">
                    <div class="p-3 d-flex flex-column">
                        <button v-if="!loggedIn" @click="spotifyLogin" class="btn btn-success mb-2">
                            Login with Spotify
                        </button>
                        <button v-else @click="spotifyLogout" class="btn btn-success mb-2">
                            Logout
                        </button>
                        <router-link v-if="loggedIn" to="/dashboard" class="btn btn-success">Dashboard</router-link>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-md-0 mb-2">
                <div class="box h-100 p-lg-5 p-3 rounded-3">
                    <h1>Easy Calendar Integration</h1>
                    <p class="fs-4 mb-md-1 mb-0">Add events directly to your Google Calendar with just a click. Stay
                        organized
                        effortlessly.</p>
                </div>
            </div>
        </div>

        <div class="box p-lg-5 p-3 rounded-3 h-100">
            <div class="text-md-center">
                <h1>About</h1>
                <p class="fs-4 mb-md-1 mb-0">
                    ConcertSyncify is a web application that allows users to sync their Spotify top artists or genres
                    with upcoming concerts and add them to their Google Calendar. The application uses the Spotify API
                    to fetch the user's top artists and genres and the Ticketmaster API to fetch upcoming concerts. The
                    user can then add the concerts to their Google Calendar with just a click. You can view the GitHub
                    <a href="https://github.com/jackgusler/ConcertSyncify">here</a>!
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

a {
    color: #198754;
}

.larger-title {
    font-size: 8rem;
}

@media (max-width: 1400px) {
    .custom-margin-end {
        margin-bottom: 0.6rem;
    }

    .container {
        height: auto;
    }
}

@media (max-width: 768px) {
    .medium-title {
        font-size: 5rem;
    }
}
</style>