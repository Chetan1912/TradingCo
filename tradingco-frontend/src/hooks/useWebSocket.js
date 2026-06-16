import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { WS_URL } from '../utils/constants';

/**
 * WebSocket hook for STOMP connection with auto-reconnect.
 */
export default function useWebSocket() {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const subscriptionsRef = useRef(new Map());

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {}, // silence debug logs

      onConnect: () => {
        setConnected(true);
        // Re-subscribe on reconnect
        subscriptionsRef.current.forEach((callback, topic) => {
          client.subscribe(topic, (message) => {
            try {
              callback(JSON.parse(message.body));
            } catch { callback(message.body); }
          });
        });
      },

      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const subscribe = useCallback((topic, callback) => {
    subscriptionsRef.current.set(topic, callback);
    const client = clientRef.current;
    if (client?.connected) {
      const sub = client.subscribe(topic, (message) => {
        try {
          callback(JSON.parse(message.body));
        } catch { callback(message.body); }
      });
      return () => {
        sub.unsubscribe();
        subscriptionsRef.current.delete(topic);
      };
    }
    return () => subscriptionsRef.current.delete(topic);
  }, []);

  return { connected, subscribe };
}
