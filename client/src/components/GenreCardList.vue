<script setup lang="ts">
import { type Genre, getTopGenres } from '@/model/spotify';
import { onMounted, ref, computed } from 'vue';
import { type Event } from '@/model/ticketmaster';
import GenreCard from './GenreCard.vue';
import EventCardList from './EventCardList.vue';

const eventList = ref<Event[]>([]);
const modalTitle = ref('');
const selectedEvents = ref<Event[]>([]);

const allGenres = ref<Genre[]>([]);
const centerIndex = ref(0);
const baseScale = 1.0;
const scaleDecrement = 0.11;
const minimumScale = 0.6;
let scrollInterval: number | null | undefined = null;

onMounted(async () => {
    const genres = await getTopGenres();
    allGenres.value = genres;
});

function calculateScale(index: number) {
    const distanceFromCenter = Math.abs(index - centerIndex.value);
    return Math.max(baseScale - scaleDecrement * distanceFromCenter, minimumScale);
}

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

function scrollLeft() {
    if (centerIndex.value > 0) centerIndex.value--;
}

function scrollRight() {
    if (centerIndex.value < allGenres.value.length - 1) centerIndex.value++;
}

function startScrolling(directionFunction: () => void) {
    stopScrolling();
    directionFunction();
    scrollInterval = setInterval(directionFunction, 200);
}

function stopScrolling() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
}

function handleEmitFromGenre(data: { events: Event[]; modalTitle: string }) {
    eventList.value = data.events;
    modalTitle.value = data.modalTitle;

}

function handleEmitFromEvent(data: Event) {
    if (selectedEvents.value.includes(data)) {
        selectedEvents.value = selectedEvents.value.filter(event => event !== data);
    } else {
        selectedEvents.value = [...selectedEvents.value, data];
    }
}

function handleSelected() {
    selectedEvents.value = [];
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
    <div class="modal fade" id="eventGenreModal" tabindex="-1" aria-labelledby="eventGenreModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="eventGenreModalLabel">Events for {{ formatGenre(modalTitle) }}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <EventCardList :events="eventList" v-if="eventList.length > 0" @data="handleEmitFromEvent" />
                </div>
                <div class="modal-footer d-flex align-items-center justify-content-between">
                    <div>
                        <button type="button" class="btn btn-secondary me-3">Filter by date</button>
                        <button type="button" class="btn btn-secondary">Filter by distance</button>
                    </div>
                    <button type="button" class="btn btn-success" data-bs-dismiss="modal"
                        :disabled="selectedEvents.length === 0" @click="handleSelected">Add
                        selected to calendar</button>
                </div>
            </div>
        </div>
    </div>

    <div class="row mt-2 align-items-center justify-content-center" style="position: relative;">
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @mousedown="startScrolling(scrollLeft)"
                @mouseup="stopScrolling" @mouseleave="stopScrolling" :disabled="centerIndex === 0">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        </div>
        <div class="col list-display-container">
            <GenreCard class="card-hover" v-for="(item, index) in genreStyles" :key="item.genre.artist.id"
                :genre="item.genre" :style="item.style" :listIndex="index" :centerIndex="centerIndex"
                @data="handleEmitFromGenre" />
        </div>
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @mousedown="startScrolling(scrollRight)"
                @mouseup="stopScrolling" @mouseleave="stopScrolling" :disabled="centerIndex === allGenres.length - 1">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    </div>
</template>

<style scoped></style>