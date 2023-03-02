export function WidgetWrapper({ React, nearApi }) {
  const [accountId, setAccountId] = React.useState('vmpoc.testnet');
  const [, setAccount] = React.useState(null);
  const [balance, setBalance] = React.useState(null);
  const [localStorageSecret, setLocalStorageSecret] = React.useState('uninitialized LocalStorage secret');

  function sendMoney() {
    window.parent.postMessage(JSON.stringify({
      type: 'sendMoney',
      accountId,
      amount: 10,
    }), '*');
  }

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

      window.addEventListener('message', async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'moneySent') {
            const newBalance = await currentAccount.getAccountBalance();
            setBalance(newBalance.total);
          }
        } catch { }
      });
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
        await sendMoney();
      } }, 'send money'),
  ]);
}
