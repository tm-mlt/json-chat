<template>
  <div :class="[
    'chat-message',
    isHost ? 'chat-message--host' : null,
    `align-self-${isHost ? 'start' : 'end'}`,
  ]">
    <div class="chat-message__user font-weight-bold">{{ user }}</div>
    <div class="d-flex">
      <div class="chat-message__body">{{ body }}</div>
      <div class="chat-message__date flex-shrink-0 ml-4 align-self-end">
        <b-spinner v-if="loading" variant="light" small></b-spinner>
        <small v-else>{{ date }}</small>
      </div>
    </div>
    <div v-if="hasError" class="mt-2 d-flex justify-content-end align-items-baseline">
      Message wasn't delivered
      <b-button
        @click="$emit('resend', { body, userId })"
        class="ml-2"
        variant="outline-light"
        size="sm"
      >send again</b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: {
    isHost: {
      type: Boolean,
      default: false,
    },
    body: {
      type: String,
      default: '',
    },
    user: {
      type: String,
      default: ''
    },
    userId: {
      type: Number,
      default: null,
    },
    date: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false,
    },
    hasError: {
      type: Boolean,
      default: false,
    }
  },
}
</script>

<style>
  .chat-message {
    position: relative;
    padding: 1em 1.7em;
    color: white;
    border-radius: 1em;
    background-color: var(--secondary);
  }

  .chat-message.chat-message--host {
    background-color: var(--primary);
  }

  .chat-message.chat-message--host:last-of-type:before {
    background-color: var(--primary);
  }

  .chat-message__date {
    margin-bottom: -0.5em;
  }

  .chat-message__user {

  }

  .chat-message__body {

  }
</style>