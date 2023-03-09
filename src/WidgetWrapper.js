export function WidgetWrapper({ React, nearApi }) {
  const [accountId, setAccountId] = React.useState('vmpoc.testnet');
  const [account, setAccount] = React.useState(null);
  const [balance, setBalance] = React.useState(null);
  const [localStorageSecret, setLocalStorageSecret] = React.useState('uninitialized LocalStorage secret');
  const [requests, setRequests] = React.useState((window.messaging || { requests: {} }).requests);

  const getRequest = (id) => window.messaging.requests[id];
  const addRequest = ({ payload, type }) => {
    const request = { payload, requestedAt: (new Date()).valueOf(), status: 'requested', type };
    window.messaging.requests[payload.id] = request;
    setRequests({
      ...requests,
      [payload.id]: request,
    });
  };
  const removeRequest = (id) => {
    delete window.messaging.requests[id];
    setRequests({
      ...window.messaging.requests,
    });
  };

  React.useEffect(() => {
    window.messaging = {
      requests: {},
    };

    async function processEvent(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.id && !getRequest(data.id)) {
          return;
        }

        if (data.type === 'moneySent') {
          removeRequest(data.id);
          console.log('removing request', data.id);
        } else if (data.type === 'messageReceived') {
          getRequest(data.id).status = 'received';
          console.log('removing request', data.id);
        }
      } catch (e) {
        console.error(e);
      }
    }

    window.addEventListener('message', processEvent);
    return () => window.removeEventListener('message', processEvent);
  }, []);

  function useComponentToWindowMessaging() {

    function generateId() {
      return Math.round(Math.random() * 10000).toString() + '-' + (new Date()).valueOf();
    }

    const sendNear = ({ senderId, recipientId, amount }) => {
      const id = generateId();
      const payload = {
        id,
        type: 'sendMoney',
        senderId,
        recipientId,
        amount,
      };

      console.log('sending message', { id });
      addRequest({ payload, type: 'sendMoney' });
      window.parent.postMessage(JSON.stringify(payload), '*');
    };

    return {
      sendNear,
    };
  }
  const { sendNear } = useComponentToWindowMessaging({ nearApi });

  React.useEffect(() => {
    async function getLocalStorageSecret() {
      try {
        setLocalStorageSecret(await localStorage.getItem('secret'));
      } catch (e) {
        setLocalStorageSecret(e.message);
      }
    }

    getLocalStorageSecret();
  }, []);

  React.useEffect(() => {
    async function initializeAccount() {
      const currentAccount = new nearApi.Account(nearApi.Connection.fromConfig({
        networkId: 'testnet',
        provider: { type: 'JsonRpcProvider', args: { url: 'https://rpc.testnet.near.org' } },
        signer: { type: 'InMemorySigner', keyStore: {} },
      }), accountId);
      setAccount(currentAccount);
      setBalance((await currentAccount.getAccountBalance()).total);
    }

    initializeAccount();
  }, [accountId]);

  return React.createElement('div', { style: { color: '#3cb' } }, [
    React.createElement('p', { key: 0 }, accountId),
    React.createElement('p', { key: 1 }, balance),
    React.createElement('p', { key: 2 }, localStorageSecret),
    React.createElement('input', {
      key: 3,
      type: 'text',
      value: accountId,
      onChange: (e) => setAccountId(e.target.value)
    }),
    React.createElement('button', { key: 4, onClick: async () => {
      console.log('sending near...')
      sendNear({ senderId: 'gornt.testnet', recipientId: accountId, amount: 10 });
      setBalance((await account.getAccountBalance()).total);
    } }, 'send money'),
    React.createElement(
        'ul',
        { key: 5 },
        Object.entries(requests).map(([id, { type, status }], i) => React.createElement('li', { key: i }, id + ':' + type + ':' + status))
    ),
  ]);
}
