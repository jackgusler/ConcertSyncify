<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { loadingArtists, loadingGenres, loadingEvents, loadingGoogle } from '@/model/util';
import { type GoogleEvent, googleLogin, isLoggedInGoogle, getGoogleEvents } from '@/model/google';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';

const loggedIn = ref(false);
const events = ref<GoogleEvent[]>([]);

interface FormattedEvent {
    start: string | Date;
    end: string | Date;
    title: string;
}

const formattedEvents = ref<FormattedEvent[]>([]);

const fetchAndFormatEvents = async () => {
    const googleEvents = await getGoogleEvents();
    events.value = googleEvents;
    formatEvents();
};

onMounted(async () => {
    loadingGoogle.value++;
    const isLogged = await isLoggedInGoogle();
    loggedIn.value = isLogged;
    if (loggedIn.value) {
        await fetchAndFormatEvents();
    } else {
        events.value = [];
        formattedEvents.value = [];
    }

    window.addEventListener('update-google-events', async (event) => {
        const customEvent = event as CustomEvent<GoogleEvent[]>;
        events.value = customEvent.detail;
        formatEvents();
    });

    // Watch for container resize
    const container = document.querySelector('.my-container');
    if (container) {
        const resizeObserver = new ResizeObserver(() => {
            adjustCalendarSize();
        });
        resizeObserver.observe(container);
    }

    loadingGoogle.value--;
});

const formatEvents = () => {
    formattedEvents.value = events.value.map(event => {
        const start = new Date(event.start.dateTime || event.start.date);
        const end = new Date(event.end.dateTime || event.end.date);

        return {
            start: start,
            end: end,
            title: event.summary,
            from: start.getHours() * 60 + start.getMinutes(), // Convert to minutes from midnight
            to: end.getHours() * 60 + end.getMinutes(), // Convert to minutes from midnight
            label: event.summary,
        };
    });
};

const adjustCalendarSize = () => {
    const container = document.querySelector('.my-container') as HTMLElement;
    const calendarWrapper = document.querySelector('.calendar-wrapper') as HTMLElement;

    if (container && calendarWrapper) {
        const containerWidth = container.clientWidth;
        const containerHeight = containerWidth * 6 / 5; // Maintain 5:6 ratio

        calendarWrapper.style.width = `${containerWidth}px`;
        calendarWrapper.style.height = `${containerHeight}px`;
    }
};
</script>

<template>
    <div class="my-container">
        <div class="d-flex justify-content-center align-items-center">
            <button v-if="!loggedIn && (loadingArtists || loadingGenres || loadingEvents)" class="btn btn-success"
                style="width: 180.15px;">
                <div class="spinner-border" role="status" style="width: 1.25rem; height: 1.25rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </button>
            <button v-else-if="!loggedIn" @click="googleLogin" class="btn btn-success">
                <span>Login with Google</span>
            </button>
        </div>
        <div v-if="loggedIn" class="calendar-wrapper position-relative">
            <Transition>
                <div v-if="loadingGoogle" class="loading-container rounded-3">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Transition>
            <vue-cal class="vuecal--rounded-theme custom-calendar" xsmall hide-view-selector :time="false"
                active-view="month" :disable-views="['week']" :events="formattedEvents">
            </vue-cal>
        </div>
    </div>
</template>

<style scoped>
.my-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.calendar-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgb(60, 60, 60);
    border-radius: 2rem;
    overflow: hidden;
    transition: border-color 0.5s ease;
    max-width: 375px;
    max-height: 450px;
}

.calendar-wrapper:hover {
    border-color: #1db954;
}

.custom-calendar {
    width: 100%;
    height: 100%;

}
</style>
