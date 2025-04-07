# Sanitization Module Documentation

## Functionality

### `sanitize()`

**Description**: Universal input sanitizer with XSS protection

```typescript
function sanitize(
  input: unknown,
  options?: {
    allowHtml?: boolean;
    allowedTags?: string[];
    strict?: boolean;
    returnTrusted?: boolean;
  }
): string | TrustedHTML
Parameters:

Parameter	Type	Default	Description
input	unknown	-	Value to sanitize
options	object	{}	Configuration options
→ allowHtml	boolean	false	Permit HTML content
→ allowedTags	string[]	[]	Whitelist of allowed HTML tags
→ strict	boolean	true	Enable aggressive sanitization
→ returnTrusted	boolean	false	Return TrustedHTML object
Returns: string | TrustedHTML - Sanitized output

sanitizeData()
Description: Strict string-only sanitizer (alias of sanitize())

typescript
Copy
function sanitizeData(data: string): string
Parameters:

Parameter	Type	Description
data	string	String input to sanitize
Returns: string - Sanitized string

Test Cases
Basic HTML Sanitization
Description: Verify basic HTML tag removal
Test Input:

typescript
Copy
sanitize('<script>alert(1)</script>Hello')
Expected Output:

Copy
"Hello"
Assertions:

All HTML tags should be removed

Plain text should remain unchanged

Allowed HTML Content
Description: Verify permitted HTML tags are preserved
Test Input:

typescript
Copy
sanitize('<b>Strong</b> <script>alert(1)</script>', {
  allowHtml: true,
  allowedTags: ['b']
})
Expected Output:

Copy
"<b>Strong</b> "
Assertions:

Allowed tags should remain

Disallowed tags should be removed

Strict Mode vs Lenient Mode
Description: Compare strict and lenient sanitization
Test Inputs:

typescript
Copy
// Strict mode
sanitize('Price: $19.99')

// Lenient mode
sanitize('Price: $19.99', { strict: false })
Expected Outputs:

Copy
"Price: 19.99"  // Strict
"Price: $19.99" // Lenient
Assertions:

Strict mode should remove special chars

Lenient mode should preserve common punctuation

Browser Compatibility
Feature	Chrome	Firefox	Safari	Edge	IE11
Basic Sanitization	✅ 90+	✅ 78+	✅ 14+	✅ 90+	⚠️*
Trusted Types	✅ 83+	❌	❌	✅ 83+	❌
Unicode Support	✅ 90+	✅ 78+	✅ 14+	✅ 90+	❌
*IE11 requires polyfills for full functionality

Security Considerations
mermaid
Copy
graph TD
    A[User Input] --> B{Contains HTML?}
    B -->|Yes| C[HTML Sanitization]
    B -->|No| D[Text Sanitization]
    C --> E[Remove Dangerous Tags]
    C --> F[Filter Attributes]
    D --> G[Remove Special Chars]
    E --> H[Safe Output]
    F --> H
    G --> H
Best Practices:

Always sanitize:

typescript
Copy
// Bad
element.innerHTML = userInput;

// Good
element.innerHTML = sanitize(userInput, { allowHtml: true });
For URLs, combine with encoding:

typescript
Copy
const safeUrl = encodeURI(sanitize(userUrl));
When allowing HTML:

typescript
Copy
// Restrict allowed tags
sanitize(richText, {
  allowHtml: true,
  allowedTags: ['b', 'i', 'em', 'strong']
});
Version History
Version	Changes
2.1	Added Trusted Types support
2.0	Improved Unicode handling
1.0	Initial release
Copy

This documentation features:
1. Proper Markdown syntax with code blocks
2. Clear parameter tables
3. Test case sections with input/output examples
4. Compatibility matrix
5. Visual security workflow diagram (Mermaid syntax)
6. Version history
7. Best practice examples

The formatting is consistent with standard technical documentation and can be rendered correctly by any Markdown viewer. Would you like me to add any additional sections or modify the existing ones?