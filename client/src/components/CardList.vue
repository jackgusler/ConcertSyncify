<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { handleLoading, loadingArtists, loadingGenres } from '@/model/util';
import { type Artist, type Genre, getTopArtists, getTopGenres } from '@/model/spotify';
import { type Event } from '@/model/ticketmaster';
import Card from './Card.vue';

const props = defineProps<{
    type: string;
    artists?: Artist[];
    genres?: Genre[];
    events?: Event[];
}>();

const emit = defineEmits(['data']);

const selectedEvents = ref<Event[]>([]);

const allArtists = ref<Artist[]>([]);
const allGenres = ref<Genre[]>([]);
const centerIndex = ref(0);
const cardGap = 100;
const baseScale = ref(1.0);
const scaleDecrement = ref(0.101);
const minimumScale = ref(0.5);
const top = ref(0);
let scrollInterval: number | null | undefined = null;
const containerWidth = ref(0);
const modalContainerWidth = ref(0);

const eventModal = document.getElementById('eventModal');

onMounted(async () => {
    updateSize();
    window.addEventListener('resize', updateSize);

    if (props.type === 'artist') {
        if (props.artists && props.artists?.length > 0) {
            allArtists.value = props.artists;
        } else {
            handleLoading(props.type, '+');
            const artists = await getTopArtists();
            allArtists.value = artists;
            handleLoading(props.type, '-');
        }
    } else if (props.type === 'genre') {
        if (props.genres && props.genres?.length > 0) {
            allGenres.value = props.genres;
        } else {
            handleLoading(props.type, '+');
            const genres = await getTopGenres();
            allGenres.value = genres;
            handleLoading(props.type, '-');
        }
    }

    eventModal?.addEventListener('hidden.bs.modal', () => {
        selectedEvents.value = [];

        if (props.type === 'event') {
            centerIndex.value = 0;
        }
    });
});

const updateSize = () => {
    baseScale.value = window.innerWidth < 768 ? 0.7 : 1.0
    if (props.type === 'event') {
        scaleDecrement.value = window.innerWidth < 768 ? 0.0707 : 0.0909
    } else {
        scaleDecrement.value = window.innerWidth < 768 ? 0.0707 : 0.101
    }
    minimumScale.value = window.innerWidth < 768 ? 0.3 : 0.5
    top.value = window.innerWidth < 768 ? -57 : 0

    updateContainerWidth();
};

const updateContainerWidth = () => {
    const container = document.querySelector('.list-display-container');
    if (container && container.clientWidth !== containerWidth.value) {
        containerWidth.value = container.clientWidth;

    }
    setTimeout(() => {
        const modalContainer = document.querySelector('.modal .list-display-container');
        if (modalContainer && modalContainer.clientWidth !== modalContainerWidth.value) {

            modalContainerWidth.value = modalContainer.clientWidth;

        }
    }, 150);
};

watch(() => props.artists, async (newVal) => {
    if (props.type === 'artist' && newVal) {
        if (newVal.length > 2) {
            handleLoading(props.type, '+');
            allArtists.value = newVal;
            handleLoading(props.type, '-');
        } else {
            const artists = await getTopArtists();
            allArtists.value = artists;
        }
    }
});

watch(() => props.genres, async (newVal) => {
    if (props.type === 'genre' && newVal) {
        if (newVal.length > 2) {
            handleLoading(props.type, '+');
            allGenres.value = newVal;
            handleLoading(props.type, '-');
        } else {
            const genres = await getTopGenres();
            allGenres.value = genres;
        }
    }
});

const calculateScale = (index: number) => {
    const distanceFromCenter = Math.abs(index - centerIndex.value);
    return Math.max(baseScale.value - scaleDecrement.value * distanceFromCenter, minimumScale.value);
}

const artistStyles = computed(() => {
    return allArtists.value.map((artist, index) => {
        const scale = calculateScale(index);
        const distanceFromCenter = Math.abs(index - centerIndex.value);
        const zIndex = index === centerIndex.value ? 200 : 100 - distanceFromCenter
        const left = containerWidth.value / 2 - 112;
        let translateX = 0;

        if (index < centerIndex.value) {
            translateX = -cardGap * distanceFromCenter
        } else if (index > centerIndex.value) {
            translateX = cardGap * distanceFromCenter
        }

        return {
            artist,
            style: {
                transform: `scale(${scale}) translateX(${translateX}px)`,
                zIndex: zIndex,
                left: `${left}px`,
                top: `${top.value}px`,
                position: 'absolute',
                transformOrigin: 'center center',
            }
        };
    });
});

const genreStyles = computed(() => {
    return allGenres.value.map((genre, index) => {
        const scale = calculateScale(index);
        const distanceFromCenter = Math.abs(index - centerIndex.value);
        const zIndex = index === centerIndex.value ? 200 : 100 - distanceFromCenter
        const left = containerWidth.value / 2 - 112;
        let translateX = 0;

        if (index < centerIndex.value) {
            translateX = -cardGap * distanceFromCenter
        } else if (index > centerIndex.value) {
            translateX = cardGap * distanceFromCenter
        }

        return {
            genre,
            style: {
                transform: `scale(${scale}) translateX(${translateX}px)`,
                zIndex: zIndex,
                left: `${left}px`,
                top: `${top.value}px`,
                position: 'absolute',
                transformOrigin: 'center center',
            }
        };
    });
});

const eventStyles = computed(() => {
    return props.events?.map((event, index) => {
        const scale = calculateScale(index);
        const distanceFromCenter = Math.abs(index - centerIndex.value);
        const zIndex = index === centerIndex.value ? 200 : 100 - distanceFromCenter
        const left = modalContainerWidth.value / 2 - 112;
        let translateX = 0;

        if (index < centerIndex.value) {
            translateX = -cardGap * distanceFromCenter
        } else if (index > centerIndex.value) {
            translateX = cardGap * distanceFromCenter
        }

        return {
            event,
            style: {
                transform: `scale(${scale}) translateX(${translateX}px)`,
                zIndex: zIndex,
                left: `${left}px`,
                top: `${top.value}px`,
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
    updateContainerWidth();
    emit('data', data);
};

function handleEmitEvent(event: Event) {
    emit('data', event);
}
</script>

<template>
    <div class="row mt-2 align-items-center justify-content-center">
        <Transition>
            <div v-if="(props.type === 'artist' && loadingArtists) || (props.type === 'genre' && loadingGenres)"
                class="loading-container rounded-3">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </Transition>
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @mousedown="startScrolling(scrollLeft)"
                @mouseup="stopScrolling" @mouseleave="stopScrolling" :disabled="centerIndex === 0">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        </div>

        <div class="col list-display-container">
            <Card v-if="props.type === 'artist'" v-for="(item, index) in artistStyles" :type="props.type"
                :artist="item.artist" :listIndex="index" :centerIndex="centerIndex" :key="item.artist.id"
                :style="item.style" @data="handleEmit" />

            <Card v-if="props.type === 'genre'" v-for="(item, index) in genreStyles" :type="props.type"
                :genre="item.genre" :listIndex="index" :centerIndex="centerIndex"
                :key="item.genre.genre + `-` + item.genre.artist.id" :style="item.style" @data="handleEmit" />

            <Card v-if="props.type === 'event'" v-for="(item, index) in eventStyles" :type="props.type"
                :event="item.event" :listIndex="index" :centerIndex="centerIndex" :key="item.event.id"
                :style="item.style" @data="handleEmitEvent" />
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

.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}

.list-display-container {
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 380px;
    overflow: hidden;
}

.list-display-container>* {
    flex: 0 0 auto;
    position: absolute;
}

.list-display-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to right, #121212 0%, transparent 25%, transparent 75%, #121212 100%);
    pointer-events: none;
    z-index: 200;
}

@media (max-width: 768px) {
    .list-display-container {
        height: 266px;
    }

    .list-display-container::after {
        background: linear-gradient(to right, #121212 0%, transparent 20%, transparent 80%, #121212 100%);
    }
}
</style>
