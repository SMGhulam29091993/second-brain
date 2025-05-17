import Source from "../models/source.model";

/**
 * Adds a new content source to the database.
 *
 * Checks if a content source with the given name already exists.
 * If it does, throws an error. Otherwise, creates and returns the new source.
 *
 * @param source - The name of the content source to add.
 * @returns A promise that resolves to the newly created source document.
 * @throws Will throw an error if the source already exists or if creation fails.
 */
export const addContentSource = async (source: string) => {
  try {
    const existSource = await Source.findOne({ name: source });
    if (existSource) {
      throw new Error("Content source already exists");
    }
    const addSource = await Source.create({ name: source });
    if (!addSource) {
      throw new Error("Failed to add content source");
    }
    return addSource;
  } catch (error) {
    console.error("Error adding content source:", error);
    throw new Error((error as Error).message);
  }
};
