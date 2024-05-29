// Tag.ts
interface TagOptions {
  id: string;
  name: string; // Name of the tag
  color: string; // Color of the tag
}

export class Tag {
  private options: TagOptions;

  constructor(options: TagOptions) {
    this.options = options;
  }

  public display(): void {
    console.log(`Tag Name: ${this.options.name}`);
    console.log(`Tag Color: ${this.options.color}`);
  }

  getOptions() {
    return this.options;
  }


  localeCompare(a: Tag, b: Tag) {
    return a.options.name.localeCompare(b.options.name);
  }
}

// Example usage:
const tagOptions: TagOptions = {
  name: "Important",
  color: "red",
};

const tag = new Tag(tagOptions);
tag.display();
