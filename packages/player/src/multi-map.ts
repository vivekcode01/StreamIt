export class MultiMap<V, K1 = string, K2 = string> {
  private map_ = new Map<K1, Map<K2, V>>();

  get(k1: K1) {
    let map = this.map_.get(k1);
    if (!map) {
      map = new Map();
      this.map_.set(k1, map);
    }
    return map;
  }

  add(k1: K1, k2: K2, value: V) {
    const map = this.get(k1);
    map.set(k2, value);
  }

  values(k1: K1) {
    return this.get(k1).values();
  }

  has(k1: K1, k2: K2) {
    return this.get(k1).has(k2);
  }
}
