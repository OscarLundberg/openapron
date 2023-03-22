export interface Model {
  id: string;
  name?: string;
  description?: string;
}

export interface Completion {
  text: string;
}

export interface AIApi {
  /**
   * Called automatically if a model is not set in env vars
   */
  listModels(): Promise<Model[]>;

  /**
   * Creates a completion using given model and prompt
   */
  createCompletion(model: Model, prompt: string): Promise<Completion>;
}