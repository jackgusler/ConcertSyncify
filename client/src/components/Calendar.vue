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

onMounted(async () => {
    const isLogged = await isLoggedInGoogle();
    loggedIn.value = isLogged;
    if (loggedIn.value) {
        const googleEvents = await getGoogleEvents();
        events.value = googleEvents;
        formatEvents();
    }
});

const handleLogout = async () => {
    await googleLogout();
    const isLogged = await isLoggedInGoogle();
    loggedIn.value = isLogged;
    events.value = [];
    formattedEvents.value = [];
};

const formatEvents = () => {
    formattedEvents.value = events.value.map(event => ({
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        title: event.summary,
    }));
};
</script>

<template>
    <div class="calendar-container">
        <button v-if="!loggedIn" @click="googleLogin" class="btn btn-success">Login with Google</button>
        <button v-else @click="handleLogout" class="btn btn-success">Logout</button>

        <div v-if="loggedIn" class="calendar-wrapper">
            <vue-cal class="custom-calendar" :events="formattedEvents" />
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
}

.custom-calendar {
    width: 100%; /* Adjust width as needed */
    height: 100%; /* Adjust height as needed */
    max-height: 83vh;
}
</style>
