<template>
  <div class="d-flex flex-column vh-100 h-100">
    <b-container>
      <b-row class="justify-content-end">
        <b-col class="d-flex justify-content-end align-items-baseline">
          <span class="mr-2">You are known as <span class="text-info">{{ user.name }}</span></span>
          <b-button @click="logout" variant="link">Leave</b-button>
        </b-col>
      </b-row>
    </b-container>
    <chat
      class="w-100 flex-grow-1 flex-shrink-1"
      :messages="messages"
      @submit="onSend"
      :show-load-more="earliestMessageId !== 0"
      @load-older="loadOlder"
    ></chat>
  </div>
</template>

<script>
import Chat from '../components/Chat.vue';
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: 'Index',
  components: { Chat },
  middleware: 'authenticated',
  data() {
    return {
      intervalId: null,
      interval: 2500,
      awaitingMessages: false,
    }
  },
  async asyncData({ $config, error, $http, store }) {
    try {
      await store.dispatch('updateMessages', store.getters.lastPage);
    } catch(e) {
      error(e);
    }
  },
  async mounted() {
    window.addEventListener('focus', e => this.onFocusChange(e));
    window.addEventListener('blur', e => this.onFocusChange(e));
    this.restartMessagePolling();
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  },
  computed: {
    ...mapGetters([
      'lastPage',
      'earliestMessageId',
      'prevPage',
    ]),
    ...mapState([
      'user',
      'pageSize',
      'messages',
      'totalMessages',
    ]),
  },
  methods: {
    loadOlder() {
      this.updateMessages(this.prevPage);
    },
    onFocusChange({ type }) {
      switch(type) {
        case 'blur': {
          clearInterval(this.intervalId);
          break;
        }
        case 'focus': {
          this.updateCurrentPage();
          this.restartMessagePolling();
          break;
        }
        default:
          return;
      }
    },
    async updateCurrentPage() {
      this.awaitingMessages = true;
      try {
        await this.updateMessages(this.lastPage);
      } finally {
        this.awaitingMessages = false;
      }
    },
    restartMessagePolling() {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(
        this.updateCurrentPage,
        this.interval,
      );
    },
    async onSend(message) {
      await this.postMessage(message);
      if(!this.awaitingMessages) {
        this.updateCurrentPage();
        this.restartMessagePolling();
      }
    },
    logout() {
      this.$cookies.remove('name');
      this.$router.push({ name: 'login' });
    },
    ...mapActions(['updateMessages', 'postMessage']),
  },
  watch: {
    interval(value) {
      this.restartMessagePolling();
    }
  }
}
</script>

<style>
.chat {
  min-height: 0px;
}
</style>
