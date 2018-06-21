export class IdResourceCache<T extends { id?: number } | any> {
  private readonly cacheSize: number = 5000;
  private cache: { [id: number]: T } = {};
  private ids: number[] = [];

  constructor(size?: number) {
    if (size != null) {
      this.cacheSize = size;
    }
  }

  putInCache(entity: T, id?: number) {
    if (id == null) {
      if (!this.isCachable(entity)) {
        return;
      }
      id = this.getId(entity);
    }
    this.setInCache(id, entity);
  }


  removeFromCache(id: number) {
    const idIndex = this.ids.indexOf(id);
    this.ids.splice(idIndex, 1);
    delete this.cache[id];
  }

  getFromCache(id: number): T {
    if (!this.isInCache(id)) {
      return null;
    }
    return this.cache[id];
  }

  getCacheEntries(): number[] {
    return this.ids;
  }

  private isInCache(id: number): boolean {
    return this.cache[id] != null;
  }

  private isCachable(entity: T) {
    const id = this.getId(entity);
    return id != null;
  }

  private getId(entity: T): number {
    if (entity == null) {
      return null;
    }
    if (entity.id == null) {
      return null;
    }
    return entity.id;
  }

  private setInCache(id: number, entity: T) {
    if (this.ids.length >= this.cacheSize) {
      const firstId = this.ids[0];
      this.removeFromCache(firstId);
    }
    this.cache[id] = entity;
    this.ids.push(id);
  }
}
