<template>
  <div class="chat d-flex flex-column">
    <vue-custom-scrollbar tagname="div" class="chat__messages flex-grow-1 container" ref="messageContainer">
      <div class="d-flex justify-content-center mt-1 mb-4">
        <b-button
          v-if="showLoadMore"
          size="sm"
          variant="outline-primary"
          @click="emitLoadOlder"
        >load older</b-button>
      </div>
      <transition-group
        name="chat__message--animation"
        class="d-flex flex-column"
        @enter="onMessagesChange"
      >
        <message
          @resend="message => $emit('submit', message)"
          class="chat__message mt-1 mb-1"
          v-for="{ id, userId, createdAt, ...rest } in messages"
          :key="id"
          :date="createdAt | dateFilter"
          :userId="userId"
          :user="userName(userId)"
          :isHost="userId === hostId"
          v-bind="rest"
        ></message>
      </transition-group>
    </vue-custom-scrollbar>
    <b-container class="chat__inputs">
      <b-row>
        <b-col>
          <b-form @submit="emitSubmit">
            <b-textarea
              autofocus
              placeholder="Enter your message"
              no-resize
              no-auto-shrink
              trim
              @keydown.enter="onPressEnter"
              v-model="text"
              rows="3"
              max-rows="3"
            ></b-textarea>
          </b-form>
        </b-col>
        <b-col cols="auto">
          <b-button type="submit" variant="primary">Send</b-button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Message from './Message.vue';

const dateFilter = timestamp =>
  timestamp ? new Date(timestamp).toLocaleString() : '';

export default {
  name: 'Chat',
  components: { Message },
  filters: { dateFilter },
  data() {
    return {
      text: '',
    }
  },
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    showLoadMore: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    hostId() {
      return this.$store.state.user.id;
    },
    earliestMessage() {
      if(this.messages.length < 1 || typeof this.messages[0] === 'undefined') {
        return 0;
      }
      return this.messages[0].id;
    },
    ...mapGetters(['userName'])
  },
  mounted(){
    this.scrollToEnd();
  },
  methods: {
    onMessagesChange(el) {
      this.scrollToEnd();
    },
    scrollToEnd() {
      const messages = this.$refs.messageContainer.$el;
      const height = messages.clientHeight;
      const fullHeight = messages.scrollHeight;
      messages.scrollTo(0, Math.abs(fullHeight - height));
    },
    emitSubmit() {
      if(this.text.length < 1) {
        return;
      }
      const body = this.text.trim();
      const userId = this.$store.state.user.id;
      this.text = '';
      
      this.$emit('submit', { body, userId })
    },
    onPressEnter(e) {
      const { ctrlKey, shiftKey, target } = e;
      if(ctrlKey || shiftKey) {
        if(ctrlKey) {
          target.value += "\n";
        }
        return;
      }
      e.preventDefault();
      this.emitSubmit();
    },
    emitLoadOlder() {
      this.$emit('load-older');
    }
  },
}
</script>

<style>
.chat {
  padding: 2em 0;
}

.chat__messages {
  position: relative;
  overflow-y: scroll;
}
/*
.chat__messages:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 3em;
  background-image: linear-gradient(to top, #ffffff, transparent);
}*/

@media screen and (min-width: 576px) {
  .chat__message {
    max-width: 80%;
  }
}

@media screen and (min-width: 768px) {
  .chat__message {
    max-width: 70%;
  }
}

@media screen and (min-width: 992px) {
  .chat__message {
    max-width: 60%;
  }
}

.chat__inputs {
  padding-top: 2em;
}

.chat__message--animation-enter-active,
.chat__message--animation-leave-active {
  transform: translateX(0);
  transition: all 1s;
}
.chat__message--animation-enter,
.chat__message--animation-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
.chat__message--animation-enter.chat-message--host,
.chat__message--animation-leave-to.chat-message--host {
  transform: translateX(30px);
}
</style>