import { ref, onMounted, onUnmounted } from 'vue';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';

let ws: WebSocket | null = null;
let instance: ReturnType<typeof useWebSocket> | null = null;

export function useWebSocket() {
  if (instance) return instance;

  const message = ref<string | null>(null);
  const isConnected = ref<boolean>(false);
  let retryCount = 0;
  const maxRetries = 5;

  const connect = () => {
    if (retryCount >= maxRetries) {
      console.error('Max WebSocket retry attempts reached');
      return;
    }

    ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log('WebSocket connected to:', WEBSOCKET_URL);
      isConnected.value = true;
      retryCount = 0;
    };

    ws.onmessage = (event: MessageEvent) => {
      console.log('WebSocket message received:', event.data);
      message.value = event.data;
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected from:', WEBSOCKET_URL, 'reconnecting...', 'retry count:', retryCount);
      isConnected.value = false;
      retryCount++;
      setTimeout(connect, 1000 * Math.pow(2, retryCount));
    };

    ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      isConnected.value = false;
    };
  };

  const sendMessage = async (data: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!ws) {
        reject(new Error('WebSocket is not initialized'));
        return;
      }

      if (ws.readyState === WebSocket.OPEN) {
        console.log('Sending WebSocket message:', data);
        ws.send(data);
        resolve();
      } else {
        const currentWs = ws;
        const checkConnection = setInterval(() => {
          if (currentWs.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            console.log('Sending WebSocket message after reconnect:', data);
            currentWs.send(data);
            resolve();
          } else if (currentWs.readyState === WebSocket.CLOSED || currentWs.readyState === WebSocket.CLOSING) {
            clearInterval(checkConnection);
            reject(new Error('WebSocket connection failed'));
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkConnection);
          reject(new Error('WebSocket connection timeout'));
        }, 5000);
      }
    });
  };

  onMounted(() => connect());
  onUnmounted(() => {
    if (ws) {
      ws.close();
      ws = null;
    }
  });

  instance = { message, sendMessage, isConnected };
  return instance;
}

// import { ref, onMounted, onUnmounted } from 'vue'

// const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080'

// export function useWebSocket() {
//   const message = ref<string | null>(null)
//   const isConnected = ref<boolean>(false)
//   let ws: WebSocket | null = null
//   let retryCount = 0
//   const maxRetries = 5

//   const connect = () => {
//     if (retryCount >= maxRetries) {
//       console.error('Max WebSocket retry attempts reached')
//       return
//     }

//     ws = new WebSocket(WEBSOCKET_URL)
    
//     ws.onopen = () => {
//       console.log('WebSocket connected to:', WEBSOCKET_URL)
//       isConnected.value = true
//       retryCount = 0
//     }

//     ws.onmessage = (event: MessageEvent) => {
//         console.log('WebSocket message received:', event.data);
//       message.value = event.data
//     }

//     ws.onclose = () => {
//         console.log('WebSocket disconnected from:', WEBSOCKET_URL, 'reconnecting...', 'retry count:', retryCount);
//         isConnected.value = false;
//         retryCount++;
//         setTimeout(connect, 1000 * Math.pow(2, retryCount));
//     };

//     ws.onerror = (error: Event) => {
//       console.error('WebSocket error:', error)
//       isConnected.value = false
//     }
//   }

//   const sendMessage = async (data: string): Promise<void> => {
//     return new Promise((resolve, reject) => {
//       if (!ws) {
//         reject(new Error('WebSocket is not initialized'))
//         return
//       }

//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(data)
//         resolve()
//       } else {
//         // Gunakan variabel lokal untuk menghindari masalah TypeScript
//         const currentWs = ws
//         const checkConnection = setInterval(() => {
//           if (currentWs.readyState === WebSocket.OPEN) {
//             clearInterval(checkConnection)
//             currentWs.send(data)
//             resolve()
//           } else if (currentWs.readyState === WebSocket.CLOSED || currentWs.readyState === WebSocket.CLOSING) {
//             clearInterval(checkConnection)
//             reject(new Error('WebSocket connection failed'))
//           }
//         }, 100)

//         // Timeout jika koneksi tidak terbuka dalam 5 detik
//         setTimeout(() => {
//           clearInterval(checkConnection)
//           reject(new Error('WebSocket connection timeout'))
//         }, 5000)
//       }
//     })
//   }

//   onMounted(() => connect())
//   onUnmounted(() => {
//     if (ws) {
//       ws.close()
//       ws = null
//     }
//   })

//   return { message, sendMessage, isConnected }
// }