<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Artist, getTopArtists } from '@/model/spotify';
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
    <div>
        <h1>Stats View</h1>
        <div v-if="topArtists.length">
            <h2>Your Top Artists</h2>
            <ul>
                <li v-for="artist in topArtists" :key="artist.id">
                    {{ artist.name }}
                    <ul>
                        <!-- Ensure events[artist.id] is defined before iterating over it -->
                        <li v-for="event in (events[artist.id] || [])" :key="event.id">
                            <b>{{ event.name }}</b> - {{ event.dates.start.timeTBA ? 'Time TBA' : event.dates.start.localDate}}
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <div v-else>
            <p>Loading...</p>
        </div>
    </div>
</template>

<style scoped>
/* Add any necessary styles */
</style>