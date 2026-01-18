// DocumentPermissions.tsx
class DocumentPermissions {
  private readAccess: boolean;
  private writeAccess: boolean;
  private readWriteAccess: boolean;
  private isActive: boolean;

  constructor(readAccess: boolean, writeAccess: boolean) {
    this.readAccess = readAccess;
    this.writeAccess = writeAccess;
    this.readWriteAccess = readAccess && writeAccess;
    this.isActive = true;
  }

  get _readAccess(): boolean {
    return this.readAccess;
  }
  // Getter method for read access
  public getReadAccess(): boolean {
    return this.readAccess;
  }

  // Setter method for read access
  public setReadAccess(readAccess: boolean): void {
    this.readAccess = readAccess;
  }

  // Getter method for write access
  public getWriteAccess(): boolean {
    return this.writeAccess;
  }

  // Setter method for write access
  public setWriteAccess(writeAccess: boolean): void {
    this.writeAccess = writeAccess;
  }



  public getReadWriteAccess(): boolean {
    this.readWriteAccess = this.readAccess && this.writeAccess;
    return this.readWriteAccess;
  }


  public setReadWriteAccess(readWriteAccess: boolean): void {
    this.readWriteAccess = readWriteAccess;
  }
}

export default DocumentPermissions
// Example usage:
const docPermissions = new DocumentPermissions(true, false);
console.log(docPermissions.getReadAccess()); // Output: true
console.log(docPermissions.getWriteAccess()); // Output: false

docPermissions.setWriteAccess(true);
console.log(docPermissions.getWriteAccess()); // Output: true


docPermissions.setReadAccess(false);
docPermissions