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

    async function sendNear({ senderId, recipientId, amount }) {
        const account = new Account(Connection.fromConfig({
            networkId: 'testnet',
            provider: { type: 'JsonRpcProvider', args: { url: 'https://rpc.testnet.near.org' } },
            signer: { type: 'InMemorySigner', keyStore },
        }), senderId);

        await account.sendMoney(recipientId, amount);
    }

    useEffect(() => {
        async function setLocalStorageSecret() {
            await localStorage.setItem('secret', 'localStorageSecret');
        }
        setLocalStorageSecret();

        window.addEventListener('message', async (event) => {
            try {
                if (typeof event.data !== 'string') {
                    return;
                }

                const data = JSON.parse(event.data);
                console.log('outer window received message', { event, data });
                if (data.type === 'sendMoney') {
                    await sendNear(data);
                    for (const { contentWindow } of document.getElementsByClassName('sandboxed-iframe')) {
                        contentWindow.postMessage(JSON.stringify({ type: 'moneySent', id: data.id }), '*');
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <SandboxedIframe key={1} jsxBody={jsxBody} />
            </header>
        </div>
    );
}

export default App;
