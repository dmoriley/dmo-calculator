export const EventEmitter = {
  events: {},
  emit: function(event, data) {
    if(!this.events[event]) return; // if the event doesnt exist, do nothing
    this.events[event].forEach(callback => callback(data)); // fire every callback associated with the supplied event
  },
  subscribe: function(event, callback) {
    if(!this.events[event]) this.events[event] = []; // if the event doesnt exists add it to the event object
    this.events[event].push(callback); // push the callback to the event
  },
  unsubscribe: function(event) {
    if(!this.events[event]) return; // no event to unsub from do nothing
    delete this.events[event]; // remove the event from the event object;
  }
}

// https://medium.com/@lolahef/react-event-emitter-9a3bb0c719