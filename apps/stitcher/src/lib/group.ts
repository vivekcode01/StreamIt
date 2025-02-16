export class Group<K = unknown, V = unknown> {
  private map_ = new Map<K, Set<V>>();

  add(key: K, value?: V) {
    let set = this.map_.get(key);
    if (!set) {
      set = new Set();
      this.map_.set(key, set);
    }
    if (value !== undefined) {
      set.add(value);
    }
  }

  forEach(callback: (value: K, items: V[]) => void) {
    Array.from(this.map_.entries()).forEach(([key, set]) => {
      const items = Array.from(set.values());
      callback(key, items);
    });
  }

  map<R>(callback: (value: K, items: V[]) => R) {
    const result: R[] = [];
    this.forEach((value, items) => {
      result.push(callback(value, items));
    });
    return result;
  }
}
