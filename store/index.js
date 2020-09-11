export const state = () => ({
  user: {
    id: null,
    name: '',
    token: '',
  },
  users: [],
  page: 0,
  pageSize: 5,
  pages: [],
  messages: [],
  totalMessages: 0,
  loadedInterval: {
    start: Infinity,
    end: -Infinity,
  }
});

export const SET_USER = 'SET_USER';
export const SET_USERS = 'SET_USERS';
export const SET_MESSAGES = 'SET_MESSAGES';
export const SET_TOTAL_MESSAGES = 'SET_TOTAL_MESSAGES';
export const SET_PAGES = 'SET_PAGES';
export const SET_PAGE = 'SET_PAGE';
export const SET_LOADED_INTERVAL = 'SET_LOADED_INTERVAL';

export const mutations = {
  [SET_USER](state, user = {}) {
    state.user = user;
  },
  [SET_USERS](state, users = []) {
    state.users = users;
  },
  [SET_MESSAGES](state, messages) {
    state.messages = messages;
  },
  [SET_TOTAL_MESSAGES](state, total) {
    state.totalMessages = total;
  },
  [SET_PAGES](state, pages) {
    state.pages = [...new Set([...state.pages, ...pages])].sort((a, b) => a - b);
  },
  [SET_PAGE](state, page) {
    state.page = page;
  },
  [SET_LOADED_INTERVAL](state, { start = Infinity, end = -Infinity }) {
    const { loadedInterval } = state;
    state.loadedInterval = {
      start: Math.min(start, loadedInterval.start),
      end: Math.max(end, loadedInterval.end),
    };
  }
}

const pageParams = (_start = 0, _end = 1) => ({ _start, _end });
const min0 = value => Math.max(0, value);
const getPageIndexById = (pageSize = 5, id = 0) => Math.floor(id / pageSize);
const getLastPage = (total, page) => pageParams(total - page, total + 1);

export const getters = {
  userId: ({ user }) => user.id,
  userName: ({ users }) =>
    _id => {
      const user = users.find(({ id }) => id === _id);
      return user ? user.name : 'Anonymous';
    },
  lastPage: ({ totalMessages, pageSize }) => getLastPage(totalMessages, pageSize),
  pageParamsByIndex: ({ pageSize }) => id => {
    const i = getPageIndexById(pageSize, id);
    const start = i * pageSize;
    console.log({i, start, pageSize, id});
    return pageParams(start, start + pageSize);
  },
  earliestMessageId: ({ messages }) =>
    typeof messages[0] === 'undefined' ? 0 : messages[0].id,
  oldestMessageId: ({ messages }) =>
    typeof messages[messages.length - 1] === 'undefined' ? 0 : messages[messages.length - 1].id,
  prevPage: ({ pageSize, loadedInterval }) =>
    pageParams( min0(loadedInterval.start - pageSize), min0(loadedInterval.end)),
}

export const actions = {
  async nuxtServerInit ({ commit, dispatch }, { app, error, req }) {
    const name = app.$cookies.get('name');
    const token = app.$cookies.get('token');

    if(typeof name !== 'undefined' && name !== '' &&
      typeof token !== 'undefined' && token !== '') {
        commit(SET_USER, await dispatch('getUser', { name, token }));
    }
    await Promise.all([
      dispatch('getUsers'),
      dispatch('getTotalMessages')
    ]);
  },
  async login({ commit }, name) {
    let token = this.$cookies.get('token');
    const user = await this.$http.$post('/login/', { token, name });

    setUserCookies.call(this, user);
    commit(SET_USER, user);
  },
  async getUser(store, { name, token }) {
    const [user] = await this.$http.$get(`/users/?name=${name}&token=${token}`);
    return user;
  },
  async getUsers({ commit }) {
    commit(SET_USERS, await this.$http.$get('/users/'));
  },
  async updateMessages({ commit, state, getters }, { _start, _end } = pageParams()) {
    const { messages } = state;
    const { earliestMessageId, oldestMessageId } = getters;
    const params = new URLSearchParams({
      _sort: 'createdAt',
      _order: 'asc',
      _start,
      _end,
    });
    const response = await this.$http.get(`/messages/?${params}`);
    commit(SET_TOTAL_MESSAGES, +response.headers.get('X-Total-Count'));
    commit(SET_LOADED_INTERVAL, { start: _start, end: _end });

    const newMessages = await response.json();
    const oldMessages = messages.filter(({ id }) =>
      id > _start && id >= _end || id < _start && id <= _end);
    commit(SET_MESSAGES, [...oldMessages, ...newMessages]);
    return newMessages;
  },
  async getTotalMessages({ commit }) {
    const response = await this.$http.head(`/messages/?_start=0&_end=1`);
    commit(SET_TOTAL_MESSAGES, +response.headers.get('X-Total-Count'));
  },
  async postMessage({ dispatch, commit, state, getters }, message) {
    const posted = await this.$http.$post('/messages/', message);
    const { id } = posted;
    commit(SET_LOADED_INTERVAL, { end: id });
    return posted;
  }
}

function setUserCookies({ name, token }){
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  this.$cookies.set('name', name, { expires });
  this.$cookies.set('token', token);
}
