<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { type Genre } from '@/model/spotify';
import { type Event, getEvents } from '@/model/ticketmaster';

const props = defineProps<{
    genre: Genre;
    listIndex: number;
    centerIndex: number;
}>();

const events = ref<Event[]>([]);

const hasEvents = ref(false);

const emit = defineEmits(['data']);

const emitData = () => {
    emit('data', { events: events.value, modalTitle: props.genre.genre });
};

onMounted(async () => {
    if (props.genre && props.genre.genre) {
        let genreEvents = await getEvents(props.genre.genre);
        if (!genreEvents || genreEvents.length === 0) {
            const alternativeGenre = getAlternativeGenre(props.genre.genre);
            genreEvents = await getEvents(alternativeGenre);
        }

        if (genreEvents && genreEvents.length > 0) {
            events.value = genreEvents;
            hasEvents.value = true;
        }
    }
});

function getAlternativeGenre(initialGenre: string) {
    const alternativeGenres: { [key: string]: string } = {
        "pov: indie": "Indie",
        "springfield mo indie": "Indie",
        "electropop": "electric pop",
        // Add more mappings
    };

    return alternativeGenres[initialGenre] || "Alternative"; // Fallback to "Alternative" if no mapping found
}

function formatGenre(genre: string) {
    const exceptions = ["mo", "uk", "dj"]; // Add more exceptions as needed
    return genre
        .split(' ')
        .map(word => {
            if (exceptions.includes(word.toLowerCase())) {
                return word.toUpperCase();
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        })
        .join(' ');
}
</script>

<template>
    <div class="card d-flex flex-column align-items-center" style="width: 14rem; position: relative;">
        <h5 class="mt-2 mx-3 text-center truncate">{{ formatGenre(props.genre.genre) }}</h5>
        <a :href="props.genre.artist.external_urls.spotify" target="_blank" class="text-decoration-none text-dark"
            :class="{ disabled: props.listIndex !== props.centerIndex }">
            <template v-if="props.listIndex === props.centerIndex">
                <img v-tooltip="{ content: 'Open Spotify', theme: 'tooltip-top' }"
                    v-if="props.genre.artist.images && props.genre.artist.images.length > 0"
                    :src="props.genre.artist.images[0].url" class="artist-image" style="margin-top: 2.5rem;"
                    alt="Artist Genre Image">
            </template>
            <template v-else>
                <img v-if="props.genre.artist.images && props.genre.artist.images.length > 0"
                    :src="props.genre.artist.images[0].url" class="artist-image" style="margin-top: 2.5rem;"
                    alt="Artist Genre Image">
            </template>
        </a>
        <div v-if="hasEvents" class="card-body pt-0 d-flex flex-column justify-content-end align-items-center"
            style="height: 100%;">
            <p class="my-2">
            <div class="truncate-event">
                <span class="name-with-colon">{{ events[0].name }}:</span>
            </div>
            <span style="color: #6d6d6d;">
                {{ events[0].dates.start.localDate }}
                in
                {{ events[0]._embedded?.venues[0]?.city?.name || 'Unknown' }},
                {{ events[0]._embedded?.venues[0]?.state?.stateCode ? events[0]._embedded?.venues[0]?.state?.stateCode :
                    (events[0]._embedded?.venues[0]?.country ?
                        events[0]._embedded?.venues[0]?.country.name : 'Unknown') }}
            </span>
            </p>
            <button @click="emitData" class="btn btn-success mt-auto" data-bs-toggle="modal"
                data-bs-target="#eventGenreModal"
                :class="{ 'btn-disabled': props.listIndex !== props.centerIndex, 'btn-enabled': props.listIndex === props.centerIndex }"
                :disabled="props.listIndex !== props.centerIndex">
                View Events
            </button>
        </div>
        <div v-else class="card-body d-flex flex-column justify-content-end align-items-center">
            <button class="btn btn-secondary" disabled>No Events</button>
        </div>
    </div>
</template>

<style scoped>
.disabled {
    cursor: default;
    pointer-events: none;
}

.btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transition: opacity 0.5s ease;
}

.btn-enabled {
    opacity: 1;
    transition: opacity 0.5s ease;
}

.card-title,
h5,
p {
    color: white;
}

* {
    user-select: none;
}
</style>