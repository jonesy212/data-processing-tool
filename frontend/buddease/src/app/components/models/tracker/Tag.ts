// Tag.ts
interface TagOptions {
    name: string; // Name of the tag
    color: string; // Color of the tag
  }
  
  class Tag {
    private options: TagOptions;
  
    constructor(options: TagOptions) {
      this.options = options;
    }
  
    public display(): void {
      console.log(`Tag Name: ${this.options.name}`);
      console.log(`Tag Color: ${this.options.color}`);
    }
  }
  
  // Example usage:
  const tagOptions: TagOptions = {
    name: 'Important',
    color: 'red'
  };
  
  const tag = new Tag(tagOptions);
  tag.display();
  