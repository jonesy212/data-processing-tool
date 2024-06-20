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

  getId(): string {
    return this.options.id;
  }

  localeCompare(a: Tag, b: Tag) {
    return a.options.name.localeCompare(b.options.name);
  }
}

// Example usage:
const tagOptions: TagOptions = {
  id: "",
  name: "Important",
  color: "red",
};


const tagOptions1: TagOptions = {
  id: "1",
  name: "Important",
  color: "red",
};

const tagOptions2: TagOptions = {
  id: "2",
  name: "Less Important",
  color: "blue",
};

export const tag1: Tag = new Tag(tagOptions1);
export const tag2: Tag = new Tag(tagOptions2);

const tags: Tag[] = [tag1, tag2];
export const tag = new Tag(tagOptions);
tag.display();

// Display all tags
tags.forEach(tag => {
  console.log(`Tag Name: ${tag.getOptions().name}, Tag Color: ${tag.getOptions().color}`);
});

// Sort tags by name
tags.sort((a, b) => a.localeCompare(a, b));

// Display sorted tags
console.log("Sorted Tags:");
tags.forEach(tag => {
  console.log(`Tag Name: ${tag.getOptions().name}, Tag Color: ${tag.getOptions().color}`);
});

export type {TagOptions}