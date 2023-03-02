function buildSandboxedWidget(code) {
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
                        const Sandboxed = Function('', \`
                            "use strict";
                            ${code}
                        \`);
                        ReactDOM.createRoot(document.getElementById('app'))
                            .render(<Sandboxed />);
                    }())
                </script>
            </body>
        </html>
    `;
}

export function SandboxedIframe({ jsxBody }) {
    return (
        <iframe
            csp={[
                "default-src 'self'",
                "connect-src https://rpc.near.org https://rpc.testnet.near.org",
                "script-src 'unsafe-inline' 'unsafe-eval'",
                "script-src-elem https://unpkg.com https://cdn.jsdelivr.net 'unsafe-inline'",
                '',
            ].join('; ')}
            height={300}
            id='sandboxed-iframe'
            sandbox='allow-scripts'
            srcDoc={buildSandboxedWidget(jsxBody)}
            title='code-container'
            width={600}
        />
    );
}