<script setup lang="ts">
import { type GoogleEvent, googleLogin, googleLogout, isLoggedInGoogle, getGoogleEvents } from '@/model/google';
import { onMounted, ref } from 'vue';
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
    const isLogged = await isLoggedInGoogle();
    loggedIn.value = isLogged;
    if (loggedIn.value) {
        await fetchAndFormatEvents();
    }

    window.addEventListener('update-google-events', async (event) => {
        const customEvent = event as CustomEvent<GoogleEvent[]>; // Assuming event.detail is of type GoogleEvent[]
        events.value = customEvent.detail;
        formatEvents();
    });
});

const handleLogout = async () => {
    googleLogout();
    events.value = [];
    formattedEvents.value = [];
};

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
</script>

<template>
    <div class="calendar-container">
        <button v-if="!loggedIn" @click="googleLogin" class="btn btn-success">Login with Google</button>
        <button v-else @click="handleLogout" class="btn btn-success">Logout</button>

        <div v-if="loggedIn" class="calendar-wrapper">
            <vue-cal class="vuecal--rounded-theme vuecal--full-height-delete" xsmall hide-view-selector :time="false" active-view="month"
                :disable-views="['week']" :events="formattedEvents" :editable-events="{ delete: true }"
                >
            </vue-cal>
        </div>
    </div>
</template>

<style scoped>
.calendar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 90%;
    width: 100%;
    padding: 1rem;
}

.calendar-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
    border: 2px solid #1db954;
    border-radius: 2rem;
    overflow: hidden;
}

.custom-calendar {
    width: 100%;
    /* Adjust width as needed */
    height: 100%;
    /* Adjust height as needed */
    max-height: 83vh;
}
</style>
