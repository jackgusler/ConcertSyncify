<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { type Artist, getTopArtists } from '@/model/spotify';
import { type Event } from '@/model/ticketmaster';
import { type GoogleEventInput, googleLogin, isLoggedInGoogle, getGoogleEvents, createGoogleEvent } from '@/model/google';
import ArtistCard from './ArtistCard.vue';
import EventCardList from './EventCardList.vue';

const eventList = ref<Event[]>([]);
const modalTitle = ref('');
const selectedEvents = ref<Event[]>([]);

const loggedIn = ref(false);

const allArtists = ref<Artist[]>([]);
const centerIndex = ref(0);
const baseScale = 1.0;
const scaleDecrement = 0.101;
const minimumScale = 0.6;
let scrollInterval: number | null | undefined = null;

const eventArtistModal = ref<HTMLElement | null>(null);

onMounted(async () => {
    const artists = await getTopArtists();
    allArtists.value = artists;

    const isLogged = await isLoggedInGoogle();
    loggedIn.value = isLogged;

    eventArtistModal.value?.addEventListener('hidden.bs.modal', () => {
        selectedEvents.value = [];
    });
});

function calculateScale(index: number) {
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

function scrollLeft() {
    if (centerIndex.value > 0) centerIndex.value--;
}

function scrollRight() {
    if (centerIndex.value < allArtists.value.length - 1) centerIndex.value++;
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

function handleEmitFromArtist(data: { events: Event[]; modalTitle: string }) {
    eventList.value = data.events;
    modalTitle.value = data.modalTitle;
}

function handleEmitFromEvent(data: Event) {
    const dataIndex = selectedEvents.value.findIndex(event => event.id === data.id);
    if (dataIndex !== -1) {
        selectedEvents.value.splice(dataIndex, 1);
    } else {
        selectedEvents.value.push(data);
    }
}

async function handleSelected() {
    // Wait for all events to be created before proceeding
    await Promise.all(selectedEvents.value.map(async (event: any) => {
        const googleEvent: GoogleEventInput = {
            summary: event.name,
            description: event.info,
            location: event._embedded?.venues[0].name,
            start: event.dates.start.dateTime,
            timeZone: event.dates.timezone,
            eventId: event.id
        };

        await createGoogleEvent(googleEvent);
    }));

    selectedEvents.value = [];
    const googleEvents = await getGoogleEvents();
    window.dispatchEvent(new CustomEvent('update-google-events', { detail: googleEvents }));
}
</script>

<template>
    <div class="modal fade" id="eventArtistModal" ref="eventArtistModal" tabindex="-1"
        aria-labelledby="eventArtistModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="eventArtistModalLabel">Events for {{ modalTitle }}</h1>
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
                    <button v-if="loggedIn" type="button" class="btn btn-success"
                        :class="{ 'btn-disabled': selectedEvents.length === 0 }" @click="handleSelected">
                        Add selected to calendar
                    </button>
                    <button v-else type="button" class="btn btn-success" data-bs-dismiss="modal" @click="googleLogin">
                        Login with Google to add events
                    </button>
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
            <ArtistCard class="card-hover" v-for="(item, index) in artistStyles" :key="item.artist.id"
                :artist="item.artist" :style="item.style" :listIndex="index" :centerIndex="centerIndex"
                @data="handleEmitFromArtist" />
        </div>
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @mousedown="startScrolling(scrollRight)"
                @mouseup="stopScrolling" @mouseleave="stopScrolling" :disabled="centerIndex === allArtists.length - 1">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
.btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transition: opacity 0.3s ease;
}

/* Ensure the button is styled correctly when not disabled */
button:not(.btn-disabled) {
    opacity: 1;
    cursor: pointer;
    transition: opacity 0.3s ease;
}
</style>
