import { useEffect } from 'react';

import './App.css';

const MODULE_SECRET = 'MODULE_SECRET';

const JS_CODE = `
  const [accountId, setAccountId] = React.useState('gornt.testnet');
  const [account, setAccount] = React.useState(null);
  const [balance, setBalance] = React.useState(null);
  const [localStorageSecret, setLocalStorageSecret] = React.useState('uninitialized LocalStorage secret');

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
    React.createElement('p', { key: 3 }, typeof MODULE_SECRET === 'undefined' ? 'no module secret' : MODULE_SECRET),
    React.createElement('p', { key: 4 }, typeof LOCAL_SECRET === 'undefined' ? 'no local secret' : LOCAL_SECRET),
    React.createElement('input', { key: 5, type: 'text', value: accountId, onChange: (e) => setAccountId(e.target.value) }),
  ]);
`;

function buildSandboxedWidget(code) {
    const LOCAL_SECRET = 'LOCAL_SECRET';
    return `
        <html>
            <head>
                <script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script crossorigin src="https://cdn.jsdelivr.net/npm/near-api-js@1.1.0/dist/near-api-js.min.js"></script>
            </head>
            <body>
                <div id="app"></div>
                <script type="text/jsx">
                    (function () {
                        const Sanboxed = Function('', \`
                            "use strict";
                            ${code}
                        \`);
                        ReactDOM.createRoot(document.getElementById('app'))
                            .render(<Sanboxed />);
                    }())
                </script>
            </body>
        </html>
    `;
}

function App() {
    const MODULE_SECRET = 'MODULE_SECRET';
    useEffect(() => {
        async function setLocalStorageSecret() {
            await localStorage.setItem('secret', 'localStorageSecret');
        }
        setLocalStorageSecret();
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <iframe
                    csp={[
                        "default-src 'self'",
                        "connect-src https://rpc.near.org https://rpc.testnet.near.org",
                        "script-src 'unsafe-inline' 'unsafe-eval'",
                        "script-src-elem https://unpkg.com https://cdn.jsdelivr.net 'unsafe-inline'",
                        '',
                    ].join('; ')}
                    height={300}
                    sandbox='allow-scripts'
                    srcDoc={buildSandboxedWidget(JS_CODE)}
                    title='code-container'
                    width={500}
                />
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
