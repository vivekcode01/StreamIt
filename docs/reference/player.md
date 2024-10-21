---
outline: [2,3]
---

# Player

## Enumerations

### Events

List of events.

#### Enumeration Members

| Enumeration Member | Value |
| ------ | ------ |
| `AUDIO_TRACKS_CHANGE` | `"audioTracksChange"` |
| `AUTO_QUALITY_CHANGE` | `"autoQualityChange"` |
| `PLAYHEAD_CHANGE` | `"playheadChange"` |
| `QUALITIES_CHANGE` | `"qualitiesChange"` |
| `READY` | `"ready"` |
| `RESET` | `"reset"` |
| `SUBTITLE_TRACKS_CHANGE` | `"subtitleTracksChange"` |
| `TIME_CHANGE` | `"timeChange"` |
| `VOLUME_CHANGE` | `"volumeChange"` |

## Classes

### HlsFacade

A facade wrapper that simplifies working with HLS.js API.

#### Constructors

##### new HlsFacade()

```ts
new HlsFacade(hls, userOptions?): HlsFacade
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `hls` | `Hls` |
| `userOptions`? | `Partial`\<[`HlsFacadeOptions`](#hlsfacadeoptions)\> |

###### Returns

[`HlsFacade`](#hlsfacade)

#### Properties

| Property | Type |
| ------ | ------ |
| `hls` | `Hls` |

#### Accessors

##### audioTracks

```ts
get audioTracks(): AudioTrack[]
```

Audio tracks of the primary asset.

###### Returns

[`AudioTrack`](#audiotrack)[]

##### autoQuality

```ts
get autoQuality(): boolean
```

Whether auto quality is enabled for all assets.

###### Returns

`boolean`

##### cuePoints

```ts
get cuePoints(): number[]
```

A list of ad cue points, can be used to plot on a seekbar.

###### Returns

`number`[]

##### duration

```ts
get duration(): number
```

Duration of the primary asset.

###### Returns

`number`

##### interstitial

```ts
get interstitial(): null | Interstitial
```

When currently playing an interstitial, this holds all the info
from that interstitial, such as time / duration, ...

###### Returns

`null` \| [`Interstitial`](#interstitial-1)

##### playhead

```ts
get playhead(): Playhead
```

Returns the playhead, will preserve the user intent across interstitials.
When we're switching to an interstitial, and the user explicitly requested play,
we'll still return the state as playing.

###### Returns

[`Playhead`](#playhead-1)

##### qualities

```ts
get qualities(): Quality[]
```

Qualities list of the primary asset.

###### Returns

[`Quality`](#quality)[]

##### ready

```ts
get ready(): boolean
```

We're ready when the master playlist is loaded.

###### Returns

`boolean`

##### started

```ts
get started(): boolean
```

We're started when atleast 1 asset started playback, either the master
or interstitial playlist started playing.

###### Returns

`boolean`

##### subtitleTracks

```ts
get subtitleTracks(): SubtitleTrack[]
```

Subtitle tracks of the primary asset.

###### Returns

[`SubtitleTrack`](#subtitletrack)[]

##### time

```ts
get time(): number
```

Time of the primary asset.

###### Returns

`number`

##### volume

```ts
get volume(): number
```

Volume across all assets.

###### Returns

`number`

#### Methods

##### destroy()

```ts
destroy(): void
```

Destroys the facade.

###### Returns

`void`

##### off()

```ts
off<E>(event, listener): void
```

###### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* keyof [`HlsFacadeListeners`](#hlsfacadelisteners) |

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `E` |
| `listener` | [`HlsFacadeListeners`](#hlsfacadelisteners)\[`E`\] |

###### Returns

`void`

##### on()

```ts
on<E>(event, listener): void
```

###### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* keyof [`HlsFacadeListeners`](#hlsfacadelisteners) |

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `E` |
| `listener` | [`HlsFacadeListeners`](#hlsfacadelisteners)\[`E`\] |

###### Returns

`void`

##### playOrPause()

```ts
playOrPause(): void
```

Toggles play or pause.

###### Returns

`void`

##### seekTo()

```ts
seekTo(targetTime): void
```

Seek to a time in primary content.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `targetTime` | `number` |  |

###### Returns

`void`

##### setAudioTrack()

```ts
setAudioTrack(id): void
```

Sets audio by id. All audio tracks are defined in `audioTracks`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `number` |  |

###### Returns

`void`

##### setQuality()

```ts
setQuality(height): void
```

Sets quality by id. All quality levels are defined in `qualities`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `height` | `null` \| `number` |  |

###### Returns

`void`

##### setSubtitleTrack()

```ts
setSubtitleTrack(id): void
```

Sets subtitle by id. All subtitle tracks are defined in `subtitleTracks`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `null` \| `number` |  |

###### Returns

`void`

##### setVolume()

```ts
setVolume(volume): void
```

Sets volume.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `volume` | `number` |  |

###### Returns

`void`

##### use()

```ts
use(fn): void
```

Register a plugin. It'll be called when an asset is ready,
and the return value when the asset should be resetted.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | [`HlsFacadePluginFn`](#hlsfacadepluginfn) |  |

###### Returns

`void`

## Type Aliases

### AudioTrack

```ts
type AudioTrack: object;
```

Defines an audio track.

#### Type declaration

| Name | Type |
| ------ | ------ |
| `active` | `boolean` |
| `id` | `number` |
| `label` | `string` |
| `track` | `MediaPlaylist` |

***

### AudioTracksChangeEventData

```ts
type AudioTracksChangeEventData: object;
```

#### Type declaration

| Name | Type |
| ------ | ------ |
| `audioTracks` | [`AudioTrack`](#audiotrack)[] |

***

### AutoQualityChangeEventData

```ts
type AutoQualityChangeEventData: object;
```

#### Type declaration

| Name | Type |
| ------ | ------ |
| `autoQuality` | `boolean` |

***

### CustomInterstitialType

```ts
type CustomInterstitialType: "ad" | "bumper";
```

A custom type for each `ASSET`.

***

### HlsFacadeListeners

```ts
type HlsFacadeListeners: object;
```

List of events with their respective event handlers.

#### Type declaration

| Name | Type |
| ------ | ------ |
| `*` | () => `void` |
| `audioTracksChange` | (`data`) => `void` |
| `autoQualityChange` | (`data`) => `void` |
| `playheadChange` | (`data`) => `void` |
| `qualitiesChange` | (`data`) => `void` |
| `ready` | () => `void` |
| `reset` | () => `void` |
| `subtitleTracksChange` | (`data`) => `void` |
| `timeChange` | (`data`) => `void` |
| `volumeChange` | (`data`) => `void` |

***

### HlsFacadeOptions

```ts
type HlsFacadeOptions: object;
```

#### Type declaration

| Name | Type |
| ------ | ------ |
| `multipleVideoElements` | `boolean` |

***

### HlsFacadePluginFn()

```ts
type HlsFacadePluginFn: (facade) => () => void;
```

A plugin is a function that receives a facade instance, and expects
a destroy function as return value.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `facade` | [`HlsFacade`](#hlsfacade) |

#### Returns

`Function`

##### Returns

`void`

***

### Interstitial

```ts
type Interstitial: object;
```

Defines an interstitial, which is not the primary content.

#### Type declaration

| Name | Type |
| ------ | ------ |
| `duration` | `number` |
| `player` | `HlsAssetPlayer` |
| `time` | `number` |
| `type`? | [`CustomInterstitialType`](#custominterstitialtype) |

***

### Playhead

```ts
type Playhead: 
  | "idle"
  | "play"
  | "playing"
  | "pause"
  | "ended";
```

State of playhead across all assets.

***

### PlayheadChangeEventData

```ts
type PlayheadChangeEventData: object;
```

#### Type declaration

| Name | Type |
| ------ | ------ |
| `playhead` | [`Playhead`](#playhead-1) |
| `started` | `boolean` |

***

### QualitiesChangeEventData

```ts
type QualitiesChangeEventData: object;
```

#### Type declaration

| Name | Type |
| ------ | ------ |
| `qualities` | [`Quality`](#quality)[] |

***

### Quality

```ts
type Quality: object;
```

Defines a quality level.

#### Type declaration

| Name | Type |
| ------ | ------ |
| `active` | `boolean` |
| `height` | `number` |
| `levels` | `Level`[] |

***

### State

```ts
type State: object;
```

State variables.

#### Type declaration

| Name | Type |
| ------ | ------ |
| `audioTracks` | [`AudioTrack`](#audiotrack)[] |
| `autoQuality` | `boolean` |
| `duration` | `number` |
| `playhead` | [`Playhead`](#playhead-1) |
| `qualities` | [`Quality`](#quality)[] |
| `started` | `boolean` |
| `subtitleTracks` | [`SubtitleTrack`](#subtitletrack)[] |
| `time` | `number` |
| `volume` | `number` |

***

### SubtitleTrack

```ts
type SubtitleTrack: object;
```

Defines an in-band subtitle track.

#### Type declaration

| Name | Type |
| ------ | ------ |
| `active` | `boolean` |
| `id` | `number` |
| `label` | `string` |
| `track` | `MediaPlaylist` |

***

### SubtitleTracksChangeEventData

```ts
type SubtitleTracksChangeEventData: object;
```

#### Type declaration

| Name | Type |
| ------ | ------ |
| `subtitleTracks` | [`SubtitleTrack`](#subtitletrack)[] |

***

### TimeChangeEventData

```ts
type TimeChangeEventData: object;
```

#### Type declaration

| Name | Type |
| ------ | ------ |
| `duration` | `number` |
| `time` | `number` |

***

### VolumeChangeEventData

```ts
type VolumeChangeEventData: object;
```

#### Type declaration

| Name | Type |
| ------ | ------ |
| `volume` | `number` |
