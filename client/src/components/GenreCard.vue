<script setup lang="ts">
import { type Genre } from '@/model/spotify';
import { type Event, getEvents } from '@/model/ticketmaster';
import { onMounted, ref } from 'vue';

const props = defineProps<{
    genre: Genre;
    listIndex: number;
    centerIndex: number;
}>();

const events = ref<Event[]>([]);

const hasEvents = ref(false);

onMounted(async () => {
  if (props.genre && props.genre.genre) {
    let genreEvents = await getEvents(props.genre.genre);
    if (!genreEvents || genreEvents.length === 0) {
      // Try fetching events for an alternative genre if the initial fetch is empty
      const alternativeGenre = getAlternativeGenre(props.genre.genre);
      genreEvents = await getEvents(alternativeGenre);
    }

    if (genreEvents && genreEvents.length > 0) {
      events.value = genreEvents;
      hasEvents.value = true;
    }
  }
});

function getAlternativeGenre(initialGenre:string) {
  // Implement logic to determine an alternative genre
  // For simplicity, this example uses a static mapping
  const alternativeGenres: { [key: string]: string } = {
    "pov: indie": "Indie",
    "springfield mo indie": "Indie",
    "electropop": "electric pop",
    // Add more mappings or logic as needed
  };

  return alternativeGenres[initialGenre] || "Alternative"; // Fallback to "Alternative" if no mapping found
}

function formatGenre(genre: string) {
    const exceptions = ["mo", "uk", "dj"]; // Add more exceptions as needed
    return genre
        .split(' ')
        .map(word => {
            // Check if the word is an exception
            if (exceptions.includes(word.toLowerCase())) {
                return word.toUpperCase(); // Return the word in uppercase if it's an exception
            } else {
                // Capitalize the first letter of the word and make the rest lowercase
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        })
        .join(' ');
}
</script>

<template>
    <div class="card d-flex flex-column align-items-center" style="width: 14rem; position: relative;">
        <h5 class="mt-2 mx-3 text-center truncate">{{ formatGenre(props.genre.genre) }}</h5>
        <a :href="props.genre.artist.external_urls.spotify" target="_blank" class="text-decoration-none text-dark">
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
            <button class="btn btn-success mt-auto">View Events</button>
        </div>
        <div v-else class="card-body d-flex flex-column justify-content-end align-items-center">
            <button class="btn btn-secondary" disabled>No Events</button>
        </div>
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