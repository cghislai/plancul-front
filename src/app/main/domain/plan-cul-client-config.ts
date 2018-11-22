export interface PlanCulClientConfig {
  apiUrl: string;
  authenticatorApiUrl: string;
  astronomyApiUrl: string;
  authenticatorApplicationName: string;
  applicationUrlsByLanguages: {
    [lang: string]: string
  };

}
