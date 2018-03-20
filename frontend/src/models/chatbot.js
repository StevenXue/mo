export default {
  namespace: 'chatbot',
  state: {
    opened: false,
  },
  reducers: {
    updateState(state, {payload}) {
      return {...state, ...payload}
    },
  }

}
