<script setup lang="ts">
import type { Genre } from '@/model/spotify';


const props = defineProps<{
    genre: Genre;
    listIndex: number;
    centerIndex: number;
}>();

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