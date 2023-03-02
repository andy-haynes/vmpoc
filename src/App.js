import { useEffect } from 'react';

import './App.css';
import { SandboxedIframe } from './SandboxedIframe';

function App({ jsxBody }) {
    const {
        Account,
        Connection,
        KeyPair,
        keyStores: { InMemoryKeyStore },
    } = window.nearApi;

    const keyStore = new InMemoryKeyStore();
    keyStore.setKey('testnet', 'gornt.testnet', KeyPair.fromString('ed25519:wRxr4RLhPk8NLSTPY5SXs9Txwu6dTsGk6XeybivzuDBfLkWL8SNxuCXCFKjqfzGCmzCxJ6qHEv7KizVmDjXYtY6'));

    async function sendNear({ accountId, amount }) {
        const account = new Account(Connection.fromConfig({
            networkId: 'testnet',
            provider: { type: 'JsonRpcProvider', args: { url: 'https://rpc.testnet.near.org' } },
            signer: { type: 'InMemorySigner', keyStore },
        }), 'gornt.testnet');

        await account.sendMoney(accountId, amount);
    }

    useEffect(() => {
        async function setLocalStorageSecret() {
            await localStorage.setItem('secret', 'localStorageSecret');
        }
        setLocalStorageSecret();

        window.addEventListener('message', async (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'sendMoney') {
                    await sendNear({ accountId: data.accountId, amount: data.amount });
                    for (const { contentWindow } of document.getElementsByClassName('sandboxed-iframe')) {
                        contentWindow.postMessage(JSON.stringify({ type: 'moneySent' }), '*');
                    }
                }
            } catch { }
        });
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <SandboxedIframe key={1} jsxBody={jsxBody} />
                <SandboxedIframe key={2} jsxBody={jsxBody} />
            </header>
        </div>
    );
}

export default App;
