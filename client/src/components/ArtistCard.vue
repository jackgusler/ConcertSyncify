<script setup lang="ts">
import { type Artist } from '@/model/spotify';
import { type Event, getEvents } from '@/model/ticketmaster';
import { onMounted, ref } from 'vue';

const props = defineProps<{
    artist: Artist;
    listIndex: number;
    centerIndex: number;
}>();

const events = ref<Event[]>([]);

const hasEvents = ref(false);

const emit = defineEmits(['data']);

const emitData = async () => {
    if (hasEvents.value) {
        emit('data', { events: events.value, modalTitle: props.artist.name });
    } else if (props.artist.genres && props.artist.genres.length > 0) {
        const genre = getAlternativeGenre(props.artist.genres[0]);
        const genreEvents = await getEvents(genre);
        if (genreEvents && genreEvents.length > 0) {
            events.value = genreEvents;
            emit('data', { events: events.value, modalTitle: genre });
        }
    }
};

onMounted(async () => {
    if (props.artist && props.artist.name) {
        const artistEvents = await getEvents(props.artist.name);
        if (artistEvents && artistEvents.length > 0) {
            events.value = artistEvents;
            hasEvents.value = true;
        }
    }
});

function getAlternativeGenre(initialGenre: string) {
    const alternativeGenres: { [key: string]: string } = {
        "pov: indie": "Indie",
        "springfield mo indie": "Indie",
        "electropop": "Electro Pop",
        // Add more mappings
    };

    return alternativeGenres[initialGenre] || "Alternative"; // Fallback to "Alternative" if no mapping found
}
</script>

<template>
    <div class="card d-flex flex-column align-items-center" style="width: 14rem; position: relative;">
        <h5 class="mt-2 mx-3 text-center truncate">{{ props.artist.name }}</h5>
        <a :href="props.artist.external_urls.spotify" target="_blank" class="text-decoration-none text-dark"
            :class="{ disabled: props.listIndex !== props.centerIndex }">
            <template v-if="props.listIndex === props.centerIndex">
                <img v-tooltip="{ content: 'Open Spotify', theme: 'tooltip-top' }"
                    v-if="props.artist.images && props.artist.images.length > 0" :src="props.artist.images[0].url"
                    class="artist-image" style="margin-top: 2.5rem;" alt="Artist Image">
            </template>
            <template v-else>
                <img v-if="props.artist.images && props.artist.images.length > 0" :src="props.artist.images[0].url"
                    class="artist-image" style="margin-top: 2.5rem;" alt="Artist Image">
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
                {{ events[0]._embedded?.venues[0]?.state?.stateCode ?
                    events[0]._embedded?.venues[0]?.state?.stateCode :
                    (events[0]._embedded?.venues[0]?.country ?
                        events[0]._embedded?.venues[0]?.country.name : 'Unknown') }}
            </span>
            </p>
            <button @click="emitData" class="btn btn-success mt-auto" data-bs-toggle="modal"
                data-bs-target="#eventArtistModal"
                :class="{ 'btn-disabled': props.listIndex !== props.centerIndex, 'btn-enabled': props.listIndex === props.centerIndex }"
                :disabled="props.listIndex !== props.centerIndex">
                View Events
            </button>
        </div>
        <div v-else class="card-body pt-0 d-flex flex-column justify-content-end align-items-center">
            <p class="my-4">
                <span style="color: #6d6d6d;">No upcoming events</span>
            </p>
            <button @click="emitData" class="btn btn-success mt-auto" data-bs-toggle="modal"
                data-bs-target="#eventArtistModal"
                :class="{ 'btn-disabled': props.listIndex !== props.centerIndex, 'btn-enabled': props.listIndex === props.centerIndex }"
                :disabled="props.listIndex !== props.centerIndex">
                View Genre Events
            </button>
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