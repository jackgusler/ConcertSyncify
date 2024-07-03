<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCachedData, handleLoading, loadingEvents, setCachedData } from '@/model/util';
import { type Event } from '@/model/ticketmaster';
import { type GoogleEventInput, googleLogin, isLoggedInGoogle, getGoogleEvents, createGoogleEvent } from '@/model/google';
import CardList from './CardList.vue';

const props = defineProps<{
    type: string;
    events: Event[];
    modalTitle: string;
}>();

const eventList = ref(props.events);
const selectedEvents = ref<Event[]>([]);

const dateAsc = ref(false);
const dateAngle = ref(0);

const distanceAsc = ref(false);
const distanceAngle = ref(0);

const eventModal = document.getElementById('eventModal');

const emit = defineEmits(['modal-closed']);

const loggedIn = ref(false);

onMounted(async () => {
    const isLogged = await isLoggedInGoogle();
    loggedIn.value = isLogged;

    eventModal?.addEventListener('hidden.bs.modal', () => {
        emit('modal-closed');
    });
});

const handleSelected = async () => {
    handleLoading("event", '+');
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
    handleLoading("event", '-');
};

const handleEmit = (data: Event) => {
    const dataIndex = selectedEvents.value.findIndex(event => event.id === data.id);
    if (dataIndex !== -1) {
        selectedEvents.value.splice(dataIndex, 1);
    } else {
        selectedEvents.value.push(data);
    }
};

const formatGenre = (genre: string) => {
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

const sortByDate = () => {
    eventList.value.sort((a, b) => {
        const dateA = new Date(a.dates.start.dateTime);
        const dateB = new Date(b.dates.start.dateTime);
        if (dateAsc.value)
            return dateB.getTime() - dateA.getTime();
        else
            return dateA.getTime() - dateB.getTime();
    });
    dateAsc.value = !dateAsc.value;
    dateAngle.value += 180;
}

const sortByDistance = async () => {
    handleLoading("event", '+');
    const cachedLatitude = await getCachedData("latitude");
    const cachedLongitude = await getCachedData("longitude");
    if (cachedLatitude && cachedLongitude) {
        distanceSort(cachedLatitude, cachedLongitude);
    } else if ("geolocation" in navigator) {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            const { latitude, longitude } = position.coords;
            setCachedData("latitude", latitude);
            setCachedData("longitude", longitude);
            distanceSort(latitude, longitude);
        } catch (error) {
            console.error("Error getting location:", error);
            // Handle location errors (e.g., user denied location access)
            // FUTURE TOAST ERROR MESSAGE
        }
    } else {
        console.error("Geolocation is not supported by this browser.");
        // Handle case where Geolocation API is not supported
        // FUTURE TOAST ERROR MESSAGE
    }
    distanceAsc.value = !distanceAsc.value;
    distanceAngle.value += 180;
    handleLoading("event", '-');
}

const distanceSort = (latitude: number, longitude: number) => {
    const distances = eventList.value.map(event => ({
        event,
        distance: getEventDistance(event, latitude, longitude)
    }));
    if (distanceAsc.value)
        distances.sort((a, b) => a.distance - b.distance);
    else
        distances.sort((a, b) => b.distance - a.distance);
    eventList.value = distances.map(item => item.event);
}

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const toRadians = (angle: number) => angle * (Math.PI / 180);
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

const getEventDistance = (event: any, userLat: number, userLon: number): number => {
    const venueLat = parseFloat(event._embedded?.venues?.[0]?.location?.latitude);
    const venueLon = parseFloat(event._embedded?.venues?.[0]?.location?.longitude);

    if (!isNaN(venueLat) && !isNaN(venueLon)) {
        return haversine(userLat, userLon, venueLat, venueLon);
    } else {
        return Number.MAX_VALUE;
    }
}

</script>

<template>
    <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="eventModalLabel">
                Events for {{ props.type === 'genre' ? formatGenre(modalTitle) : props.type === 'artist' ?
                    modalTitle : ''
                }}
            </h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body position-relative">
            <Transition>
                <div v-show="loadingEvents" class="loading-container">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Transition>
            <CardList :type="'event'" :events="eventList" @data="handleEmit" />
        </div>
        <div class="modal-footer d-flex align-items-center justify-content-between">
            <div>
                <button type="button" class="btn btn-secondary me-3" @click="sortByDate">
                    <i class="fa-solid fa-arrow-up-short-wide" :style="{ transform: `rotate(${dateAngle}deg)` }"></i>
                    Sort by date
                </button>
                <button type="button" class="btn btn-secondary" @click="sortByDistance">
                    <i class="fa-solid fa-arrow-up-short-wide"
                        :style="{ transform: `rotate(${distanceAngle}deg)` }"></i>
                    Sort by distance
                </button>
            </div>
            <button v-if="loggedIn" type="button" class="btn btn-success" :disabled="selectedEvents.length === 0"
                @click="handleSelected()">
                Add selected to calendar
            </button>
            <button v-else type="button" class="btn btn-success" data-bs-dismiss="modal" @click="googleLogin">
                Login with Google to add events
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

.fa-arrow-up-short-wide {
    transition: all 0.5s;
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>