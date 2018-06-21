import { CropModule } from './crop.module';

describe('CropModule', () => {
  let cropModule: CropModule;

  beforeEach(() => {
    cropModule = new CropModule();
  });

  it('should create an instance', () => {
    expect(cropModule).toBeTruthy();
  });
});
