previewInterfaceImportDiff
import ts from 'typescript';

function previewInterfaceImportDiff(
  before: string,
  after: string
): string[] {
  const parse = (code: string) =>
    ts.createSourceFile('file.ts', code, ts.ScriptTarget.Latest, true);

  const getImports = (sf: ts.SourceFile) =>
    sf.statements.filter(ts.isImportDeclaration);

  const beforeImports = getImports(parse(before));
  const afterImports = getImports(parse(after));

  return afterImports
    .filter(a =>
      !beforeImports.some(b => b.getText() === a.getText())
    )
    .map(i => i.getText());
}
