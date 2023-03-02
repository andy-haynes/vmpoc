# Sandboxed iframe PoC

This is an demo implementation for an alternative way of sandboxing
user-submitted JSX built with create-react-app (`npm run start` to run).

The high-level approach is:
- user submits a JSX body
- we transpile the JSX
- the transpiled JSX gets `eval`'d into a function body by way of the `Function` constructor
- the `eval`'d function is rendered inside a sandboxed `iframe` with `<script>` tags to import Babel, React, and NAJ
- parent and child scopes communicate via message passing (e.g. user code requests a transaction be signed by the parent scope who sends a message back upon completion)

In this demo, pressing the `send money` button sends 10yN
to the input account from the hardcoded `gornt.testnet` account
and the UI refreshes upon receiving the `moneySent` message.

To update the code running in the `iframe`, edit the contents
of `WidgetWrapper`. The function declaration is only used for ease
of prototyping, only the body is used to match the current functionality
in Near Social. Note that at the moment this component
does not contain any JSX to keep the prototype simple; in
a real implementation the transpilation would happen as
part of a pipeline to validate, sanitize, and translate
user-submitted code.
