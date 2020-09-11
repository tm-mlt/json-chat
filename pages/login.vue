<template>
  <div class="d-flex vh-100">
    <b-container class="m-auto">
      <b-row align-h="center">
        <b-col cols="10" sm="8" md="4">
          <h1 class="h2">Welcome to JSON Chat</h1>
          <b-form @submit.prevent="onSubmit">
            <b-form-group
              label="Your Name"
              label-for="username"
            >
              <b-form-input
                class="mb-2 mr-sm-2 mb-sm-0"
                @input="() => dirty = true"
                v-model="$v.username.$model"
                :state="validateState('username')"
                id="username"
              ></b-form-input>
              <b-form-invalid-feedback>Name length must be greater than 4 letters</b-form-invalid-feedback>
            </b-form-group>
            <b-button :disabled="$v.$invalid" type="submit" variant="primary">Enter</b-button>
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators';

export default {
  data() {
    return {
      username: '',
    }
  },
  validations: {
    username: {
      required,
      minLength: minLength(4)
    },
  },
  methods: {
    validateState(name) {
      const { $dirty, $error } = this.$v[name];
      return $dirty ? !$error : null;
    },
    async onSubmit() {
      const { username: name } = this;
      try {
        await this.$store.dispatch('login', name);
        this.$router.push({ name: 'index' });
      } catch(e) {
        console.log(e);
      }
    }
  },
}
</script>

<style>

</style>