import { BedModule } from './bed.module';

describe('BedModule', () => {
  let bedModule: BedModule;

  beforeEach(() => {
    bedModule = new BedModule();
  });

  it('should create an instance', () => {
    expect(bedModule).toBeTruthy();
  });
});
