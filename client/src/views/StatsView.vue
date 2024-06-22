<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Artist, getTopArtists, logout } from '@/model/spotify';
import { type Event, getEvents } from '@/model/ticketmaster';

const topArtists = ref<Artist[]>([]);
const events = ref<Record<string, Event[]>>({});

onMounted(async () => {
    const artists = await getTopArtists();
    topArtists.value = artists;
    if (artists.length > 0) {
        const topArtist = artists[0]; // Assuming the top artist is the first one
        const artistEvents = await getEvents(topArtist.name);
        console.log(artistEvents);
        events.value[topArtist.id] = artistEvents; // This now correctly assigns the events to the artist's ID
    }
});
</script>

<template>
    <!-- <h1>Stats View</h1>
        <div v-if="topArtists.length">
            <h2>Your Top Artists</h2>
            <ul>
                <li v-for="artist in topArtists" :key="artist.id">
                    {{ artist.name }}
                    <ul>
                        <li v-for="event in (events[artist.id] || [])" :key="event.id">
                            <b>{{ event.name }}</b> 
                            - {{ event.dates.start.timeTBA ? 'Time TBA' :
                            event.dates.start.localDate}} in
                            {{ event._embedded.venues[0].city ? event._embedded.venues[0].city.name : 'Unknown' }}
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <div v-else>
            <p>Loading...</p>
        </div> -->
    <!-- <div class="row mb-md-2">
            <div class="col-md-1 mb-md-0 mb-2 d-flex justify-content-center align-items-center" style="height: 100%;">
                <div class="box p-4 rounded-3">
                    <router-link to="/" class="btn btn-secondary circle-btn">
                        <i class="fa-solid fa-house"></i>
                    </router-link>
                </div>
            </div>
            <div class="col-md-11 mb-md-0 mb-2">
                <div class="box h-100 p-5 rounded-3">

                </div>
            </div>
        </div> -->

    <!-- 3 cols -->

    <div class="container mt-2">
        <div class="row h-100">

            <div class="col-md-1 d-flex justify-content-center align-items-center">
                <div class="box p-3 rounded-3 w-100 d-flex justify-content-center align-items-center">
                    <router-link to="/" class="btn btn-secondary circle-btn">
                        <i class="fa-solid fa-house"></i>
                    </router-link>
                </div>
            </div>

            <div class="col-md-7 d-flex flex-column">
                <div class="row flex-grow-1" style="margin-bottom: .6rem;">
                    <div class="box p-4 rounded-3">
                        <h1>Artists</h1>
                        
                    </div>
                </div>
                <div class="row flex-grow-1">
                    <div class="box p-4 rounded-3">
                        <h1>Genres</h1>

                    </div>
                </div>
            </div>

            <div class="col-md-4 d-flex">
                <div class="box p-4 rounded-3 w-100">
                    <h1>Calendar</h1>

                </div>
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

.row {
    --bs-gutter-x: 1.2rem;
    justify-content: center;
}
</style>