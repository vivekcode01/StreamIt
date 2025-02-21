# Overview

Superstreamer comes with a player wrapper around HLS.js. Our goal is to offer a simplified API alongside HLS.js, tailored for developers building a player UI, while preserving access to the powerful features that HLS.js provides.

## Features

- Offer intuitive data structures, events, and methods tailored for developers building a player UI.
- Implement a robust state machine.
- Provide simplified player-centric methods like `playOrPause`, `setVolume`, and more.
- Support spec-compliant plugins, including features like ad signaling.

## Installation

::: code-group

```sh [npm]
npm i @superstreamer/player
```

```sh [pnpm]
pnpm add @superstreamer/player
```

```sh [yarn]
yarn add @superstreamer/player
```

```sh [bun]
bun add @superstreamer/player
```
:::

::: warning

We're currently using a beta version of HLS.js, v1.6.0-beta.4. Once the final release is available, we'll update the dependency accordingly.

:::

## Usage

Create a `HlsPlayer` instance and pass it a container.

```ts
import { HlsPlayer } from "@superstreamer/player";

const container = document.getElementById("playerContainer");
const player = new HlsPlayer(container);

// Load a source.
player.load("https://stitcher.superstreamer.xyz/sessions/b435b2e3-870c-48ce-bc29-fa397e360098/master.m3u8");
```

Check the [Player reference](/reference/player) for more info.