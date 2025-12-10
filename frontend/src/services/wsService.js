class WSService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect() {
    const URL = process.env.REACT_APP_WS_URL.replace("http", "ws");
    this.socket = new WebSocket(`${URL}/ws/ws`);

    this.socket.onopen = () => console.log("WS Connected");

    this.socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (this.listeners[data.type]) {
        this.listeners[data.type].forEach((cb) => cb(data.payload));
      }
    };

    this.socket.onclose = () => {
      console.log("WS disconnected — retrying...");
      setTimeout(() => this.connect(), 2000);
    };
  }

  subscribe(eventType, callback) {
    if (!this.listeners[eventType]) this.listeners[eventType] = [];
    this.listeners[eventType].push(callback);
  }
}

const wsService = new WSService();
export default wsService;
