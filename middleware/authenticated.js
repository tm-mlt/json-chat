export default function ({ store, redirect }) {
  if (store.state.user.id === null) {
    return redirect({ name: 'login' });
  }
}