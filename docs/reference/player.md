---
outline: [2,3]
---

# Player

## Enumerations

### Events

#### Enumeration Members

| Enumeration Member | Value |
| ------ | ------ |
| `AUDIO_TRACKS_CHANGE` | `"audioTracksChange"` |
| `AUTO_QUALITY_CHANGE` | `"autoQualityChange"` |
| `PLAYHEAD_CHANGE` | `"playheadChange"` |
| `QUALITIES_CHANGE` | `"qualitiesChange"` |
| `READY` | `"ready"` |
| `RESET` | `"reset"` |
| `SEEKING_CHANGE` | `"seekingChange"` |
| `STARTED` | `"started"` |
| `SUBTITLE_TRACKS_CHANGE` | `"subtitleTracksChange"` |
| `TIME_CHANGE` | `"timeChange"` |
| `TIMELINE_CHANGE` | `"timelineChange"` |
| `VOLUME_CHANGE` | `"volumeChange"` |

## Classes

### HlsPlayer

#### Constructors

##### new HlsPlayer()

```ts
new HlsPlayer(container): HlsPlayer
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `container` | `HTMLDivElement` |

###### Returns

[`HlsPlayer`](#hlsplayer)

#### Properties

| Property | Type |
| ------ | ------ |
| `container` | `HTMLDivElement` |
| `off` | \<`EventKey`\>(`event`: `EventKey`, `listener`: [`HlsPlayerEventMap`](#hlsplayereventmap)\[`EventKey`\]) => `EventEmitter`\<[`HlsPlayerEventMap`](#hlsplayereventmap)\> |
| `on` | \<`EventKey`\>(`event`: `EventKey`, `listener`: [`HlsPlayerEventMap`](#hlsplayereventmap)\[`EventKey`\]) => `EventEmitter`\<[`HlsPlayerEventMap`](#hlsplayereventmap)\> |
| `once` | \<`EventKey`\>(`event`: `EventKey`, `listener`: [`HlsPlayerEventMap`](#hlsplayereventmap)\[`EventKey`\]) => `EventEmitter`\<[`HlsPlayerEventMap`](#hlsplayereventmap)\> |

#### Accessors

##### audioTracks

###### Get Signature

```ts
get audioTracks(): AudioTrack[]
```

###### Returns

[`AudioTrack`](#audiotrack)[]

##### autoQuality

###### Get Signature

```ts
get autoQuality(): boolean
```

###### Returns

`boolean`

##### currentTime

###### Get Signature

```ts
get currentTime(): number
```

###### Returns

`number`

##### duration

###### Get Signature

```ts
get duration(): number
```

###### Returns

`number`

##### live

###### Get Signature

```ts
get live(): boolean
```

###### Returns

`boolean`

##### playhead

###### Get Signature

```ts
get playhead(): Playhead
```

###### Returns

[`Playhead`](#playhead-1)

##### qualities

###### Get Signature

```ts
get qualities(): Quality[]
```

###### Returns

[`Quality`](#quality)[]

##### ready

###### Get Signature

```ts
get ready(): boolean
```

###### Returns

`boolean`

##### seekableStart

###### Get Signature

```ts
get seekableStart(): number
```

###### Returns

`number`

##### seeking

###### Get Signature

```ts
get seeking(): boolean
```

###### Returns

`boolean`

##### started

###### Get Signature

```ts
get started(): boolean
```

###### Returns

`boolean`

##### subtitleTracks

###### Get Signature

```ts
get subtitleTracks(): SubtitleTrack[]
```

###### Returns

[`SubtitleTrack`](#subtitletrack)[]

##### timeline

###### Get Signature

```ts
get timeline(): TimelineItem[]
```

###### Returns

`TimelineItem`[]

##### unstable\_hlsjsVersion

###### Get Signature

```ts
get unstable_hlsjsVersion(): string
```

###### Returns

`string`

##### volume

###### Get Signature

```ts
get volume(): number
```

###### Returns

`number`

#### Methods

##### destroy()

```ts
destroy(): void
```

###### Returns

`void`

##### load()

```ts
load(url): void
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `url` | `string` |

###### Returns

`void`

##### playOrPause()

```ts
playOrPause(): void
```

###### Returns

`void`

##### seekTo()

```ts
seekTo(time): void
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `time` | `number` |

###### Returns

`void`

##### setAudioTrack()

```ts
setAudioTrack(id): void
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `number` |

###### Returns

`void`

##### setQuality()

```ts
setQuality(height): void
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `height` | `null` \| `number` |

###### Returns

`void`

##### setSubtitleTrack()

```ts
setSubtitleTrack(id): void
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `null` \| `number` |

###### Returns

`void`

##### setVolume()

```ts
setVolume(volume): void
```

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `volume` | `number` |

###### Returns

`void`

##### unload()

```ts
unload(): void
```

###### Returns

`void`

## Interfaces

### AudioTrack

#### Properties

| Property | Type |
| ------ | ------ |
| `active` | `boolean` |
| `id` | `number` |
| `label` | `string` |
| `track` | `MediaPlaylist` |

***

### Quality

#### Properties

| Property | Type |
| ------ | ------ |
| `active` | `boolean` |
| `height` | `number` |
| `levels` | `Level`[] |

***

### SubtitleTrack

#### Properties

| Property | Type |
| ------ | ------ |
| `active` | `boolean` |
| `id` | `number` |
| `label` | `string` |
| `track` | `MediaPlaylist` |

## Type Aliases

### HlsPlayerEventMap

```ts
type HlsPlayerEventMap: object & object;
```

#### Type declaration

| Name | Type |
| ------ | ------ |
| `audioTracksChange` | () => `void` |
| `autoQualityChange` | () => `void` |
| `playheadChange` | () => `void` |
| `qualitiesChange` | () => `void` |
| `ready` | () => `void` |
| `reset` | () => `void` |
| `seekingChange` | () => `void` |
| `started` | () => `void` |
| `subtitleTracksChange` | () => `void` |
| `timeChange` | () => `void` |
| `timelineChange` | () => `void` |
| `volumeChange` | () => `void` |

#### Type declaration

| Name | Type |
| ------ | ------ |
| `*` | (`event`) => `void` |

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