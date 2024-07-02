<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { type Artist, type Genre, getTopArtists, getTopGenres } from '@/model/spotify';
import { type Event } from '@/model/ticketmaster';
import { isLoggedInGoogle } from '@/model/google';
import ArtistCard from './ArtistCard.vue';
import GenreCard from './GenreCard.vue';
import EventCard from './EventCard.vue';

const props = defineProps<{
    type: string;
    events?: Event[];
}>();

const emit = defineEmits(['data']);

const selectedEvents = ref<Event[]>([]);

const loggedIn = ref(false);

const allArtists = ref<Artist[]>([]);
const allGenres = ref<Genre[]>([]);
const centerIndex = ref(0);
const baseScale = 1.0;
const scaleDecrement = 0.101;
const minimumScale = 0.6;
let scrollInterval: number | null | undefined = null;

const eventModal = document.getElementById('eventModal');

onMounted(async () => {

    const isLogged = await isLoggedInGoogle();
    loggedIn.value = isLogged;

    if (props.type === 'artist') {
        const artists = await getTopArtists();
        allArtists.value = artists;
    } else if (props.type === 'genre') {
        const genres = await getTopGenres();
        allGenres.value = genres;
    }

    eventModal?.addEventListener('hidden.bs.modal', () => {
        selectedEvents.value = [];

        if (props.type === 'event') {
            centerIndex.value = 0;
        }
    });
});

const calculateScale = (index: number) => {
    const distanceFromCenter = Math.abs(index - centerIndex.value);
    return Math.max(baseScale - scaleDecrement * distanceFromCenter, minimumScale);
}

const artistStyles = computed(() => {
    return allArtists.value.map((artist, index) => {
        const scale = calculateScale(index);
        const zIndex = index === centerIndex.value ? 200 : 100 - Math.abs(index - centerIndex.value);
        const translateX = (index - centerIndex.value) * 110;
        return {
            artist,
            style: {
                transform: `scale(${scale}) translateX(${translateX}px)`,
                zIndex: zIndex,
                left: '194px',
                top: 0,
                position: 'absolute',
            }
        };
    });

});

const genreStyles = computed(() => {
    return allGenres.value.map((genre, index) => {
        const scale = calculateScale(index);
        const zIndex = index === centerIndex.value ? 200 : 100 - Math.abs(index - centerIndex.value);
        const translateX = (index - centerIndex.value) * 110;
        return {
            genre,
            style: {
                transform: `scale(${scale}) translateX(${translateX}px)`,
                zIndex: zIndex,
                left: '194px',
                top: 0,
                position: 'absolute',
            }
        };
    });
});

const eventStyles = computed(() => {
    return props.events?.map((event, index) => {
        const scale = calculateScale(index);
        const zIndex = index === centerIndex.value ? 200 : 100 - Math.abs(index - centerIndex.value);
        const translateX = (index - centerIndex.value) * 110;
        return {
            event,
            style: {
                transform: `scale(${scale}) translateX(${translateX}px)`,
                zIndex: zIndex,
                left: '209px',
                top: 0,
                position: 'absolute',
            }
        };
    });
});

const scrollLeft = () => {
    if (centerIndex.value > 0) centerIndex.value--;
}

const scrollRight = () => {
    if (props.type === 'artist' && centerIndex.value < allArtists.value.length - 1) centerIndex.value++;
    else if (props.type === 'genre' && centerIndex.value < allGenres.value.length - 1) centerIndex.value++;
    else if (props.type === 'event' && props.events && centerIndex.value < props.events.length - 1) centerIndex.value++;
}

const startScrolling = (directionFunction: () => void) => {
    stopScrolling();
    directionFunction();
    scrollInterval = setInterval(directionFunction, 200);
}

const stopScrolling = () => {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
}

const handleEmit = (data: { type: string, events: Event[]; modalTitle: string }) => {
    emit('data', data);
};

function handleEmitEvent(event: Event) {
    emit('data', event);
}
</script>

<template>
    <div class="row mt-2 align-items-center justify-content-center" style="position: relative;">
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @mousedown="startScrolling(scrollLeft)"
                @mouseup="stopScrolling" @mouseleave="stopScrolling" :disabled="centerIndex === 0">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        </div>
        <div class="col list-display-container">
            <ArtistCard v-if="props.type === 'artist'" v-for="(item, index) in artistStyles" :key="item.artist.id"
                :artist="item.artist" :style="item.style" :listIndex="index" :centerIndex="centerIndex"
                @data="handleEmit" />
            <GenreCard v-if="props.type === 'genre'" v-for="(item, index) in genreStyles" :key="item.genre.artist.id"
                :genre="item.genre" :style="item.style" :listIndex="index" :centerIndex="centerIndex"
                @data="handleEmit" />
            <EventCard v-if="props.type === 'event'" v-for="(item, index) in eventStyles" :key="item.event.id"
                :event="item.event" :style="item.style" :listIndex="index" :centerIndex="centerIndex"
                @data="handleEmitEvent" />
        </div>
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @mousedown="startScrolling(scrollRight)"
                @mouseup="stopScrolling" @mouseleave="stopScrolling"
                :disabled="props.type === 'artist' ? centerIndex === allArtists.length - 1 : centerIndex === allGenres.length - 1">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
.btn {
    transition: background-color 0.3s ease, opacity 0.3s ease;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}
</style>