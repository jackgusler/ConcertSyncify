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

onMounted(async () => {
    // if (props.artist && props.artist.name) {
    //     const artistEvents = await getEvents(props.artist.name);
    //     if (artistEvents && artistEvents.length > 0) {
    //         events.value = artistEvents;
    //         hasEvents.value = true;
    //     }
    // }
});

</script>

<template>
    <div class="card d-flex flex-column align-items-center" style="width: 14rem; position: relative;">
        <h5 class="mt-2 mx-3 text-center truncate">{{ props.artist.name }}</h5>
        <a :href="props.artist.external_urls.spotify" target="_blank" class="text-decoration-none text-dark">
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
        <!-- <div v-if="hasEvents" class="card-body pt-0 d-flex flex-column justify-content-end align-items-center"
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
            <button class="btn btn-success mt-auto">View Events</button>
        </div>
        <div v-else class="card-body d-flex flex-column justify-content-end align-items-center">
            <button class="btn btn-secondary" disabled>No Events</button>
        </div> -->
    </div>
</template>

<style scoped>
.card-title,
h5,
p {
    color: white;
}

* {
    user-select: none;
}
</style>