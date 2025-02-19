import { FileCategory } from "../documents/FileType";

// isValidFileCategory.tsy
function isValidFileCategory(key: string): key is keyof typeof FileCategory {
    return key in FileCategory;
}
  

const category = process.argv[3]
export { isValidFileCategory, category };