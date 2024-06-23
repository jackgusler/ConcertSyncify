<script setup lang="ts">
import { type Artist } from '@/model/spotify';
import { type Event, getEvents } from '@/model/ticketmaster';
import { h, onMounted, ref } from 'vue';

const props = defineProps<{
    artist: Artist;
}>();
const events = ref<Event[]>([]);

const hasEvents = ref(false);

onMounted(async () => {
    if (props.artist) {
        const artistEvents = await getEvents(props.artist.name);;
        if (artistEvents && artistEvents.length > 0) {
            events.value = artistEvents;
            hasEvents.value = true;
        }
    }
})

</script>

<template>
    <div class="card d-flex flex-column align-items-center" style="width: 14rem; position: relative;">
        <h5 class="my-2 mx-3 text-center truncate">{{ props.artist.name }}</h5>
        <a :href="props.artist.external_urls.spotify" target="_blank" class="text-decoration-none text-dark">
            <img :src="props.artist.images[0].url" class="mb-3 mt-5 artist-image" alt="Artist Image">
        </a>
        <div v-if="hasEvents" class="card-body pt-0 d-flex flex-column justify-content-center align-items-center"
            style="height: 100%;">
            <p class="mb-2 mt-2">
                <span style="color: white;">{{ events[0].name }}</span>:
                <span style="color: #6d6d6d;">
                    {{ events[0].dates.start.localDate }} in {{ events[0]._embedded.venues[0].city.name }}
                </span>
            </p>
            <button class="btn btn-success mt-auto">View Events</button>
        </div>
        <div v-else class="card-body d-flex flex-column justify-content-center align-items-center">
            <button class="btn btn-secondary" disabled>No Events</button>
        </div>
    </div>
</template>

<style scoped>
.truncate {
    position: absolute;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 2rem); /* Adjust the subtraction value based on actual margins if different */
}

.card {
    background: linear-gradient(to bottom, #242424 0%, #242424 75%, #323231 100%);
    border-radius: 20px;
    border: 2px solid rgb(60, 60, 60);
    overflow: hidden;
    height: 380px;
    box-shadow: 0px 0px 4px rgba(30, 30, 30, 1);
}

.card-body {
    width: 100%;
}

.artist-image {
    width: 12rem;
    height: 12rem;
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 1);
}

.card-title,
h5,
p {
    color: white;
}
</style>