
export default {

    namespace: 'launchpage',
  
    state: {
        visibility:true
    },
  
  
    reducers: {
      change(state, {payload: {visibility}}) {
        return { ...state, visibility };
      },
    },
  
  };
  