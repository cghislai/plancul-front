import { CultureModule } from './culture.module';

describe('CultureModule', () => {
  let cultureModule: CultureModule;

  beforeEach(() => {
    cultureModule = new CultureModule();
  });

  it('should create an instance', () => {
    expect(cultureModule).toBeTruthy();
  });
});
