<!-- Link_HATEOAS.md -->

# HATEOAS Documentation

## Overview

**Definition**: HATEOAS (Hypermedia As The Engine Of Application State) is a REST constraint where the API response includes links to related actions and resources, allowing clients to dynamically discover available actions without hardcoding endpoints.

# User Interface Components
## Scenario 1: Rendering HATEOAS Links in React

Description: Verify that the Link and HATEOASLinks components correctly render links from a HATEOAS-enabled API response.

**Steps:**

Define a HATEOASLink interface with properties such as href, rel, and method.

Implement a Link component that handles clicks and displays link titles.

Implement a HATEOASLinks component to render multiple links dynamically.

**Assertions:**

Each link should display the correct title or rel attribute.

Clicking a link should trigger the onClick handler.

Data attributes (data-rel, data-method) should be attached for testing and inspection.

```typescript
interface HATEOASLink {
  href: string;
  rel: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  type?: string;
  title?: string;
}
```

**API Response Handling**
# Scenario 2: User Profile with HATEOAS

Description: Verify that user data is displayed with navigable HATEOAS links.

**Steps:**

Retrieve a user API response containing _links or links.

Map response links into HATEOASLink objects.

Render links with the HATEOASLinks component.

**Assertions:**

Self link navigates to the current user resource.

Update link allows editing user details.

Delete link asks for confirmation before deleting.

Related links navigate to associated resources (e.g., todos, projects).
```typescript
{
  success: true,
  status: 200,
  data: { id: "123", name: "John Doe" },
  links: {
    self: "/api/users/123",
    update: "/api/users/123",
    delete: "/api/users/123",
    related: ["/api/users/123/todos", "/api/users/123/projects"]
  }
}
```

Response Standardization
**Scenario 3:** Enhanced BaseResponseType with 
## HATEOAS

Description: Verify that the BaseResponseType supports HATEOAS by including _links.

**Steps:**

Extend BaseResponseType to include _links.

Define HATEOASLink interface with optional metadata (e.g., templated, deprecation, profile).

Return _links from API responses for navigation.

**Assertions:**

self link is always present.

Optional navigation links (first, next, last, related) are included when available.

Links contain correct href, method, and optional attributes.
```typescript
export interface BaseResponseType<T extends BaseDataEntity> {
  success: boolean;
  status: number;
  message: string;
  timestamp: Date;
  data?: T | T[] | null;
  requestId: string;
  _links?: {
    self: HATEOASLink;
    first?: HATEOASLink;
    previous?: HATEOASLink;
    next?: HATEOASLink;
    last?: HATEOASLink;
    related?: HATEOASLink[];
    [rel: string]: HATEOASLink | HATEOASLink[] | undefined;
  };
}
```

# Real-World Example

**Scenario 4:** Shopping Cart with HATEOAS

Description: Verify that the client dynamically adapts its UI based on _links provided in the shopping cart API response.

**Steps:**

Fetch a shopping cart resource from /api/carts/123.

Render UI controls for each available action in _links.

Execute the corresponding HTTP method when a link is activated.

**Assertions:**

Self link refreshes the cart view.

Add-item link allows adding products.

Checkout link starts the checkout process.

Empty-cart link removes all items.
```typescript
{
  "success": true,
  "status": 200,
  "data": {
    "id": "123",
    "name": "Shopping Cart",
    "items": [...]
  },
  "_links": {
    "self": { "href": "/api/carts/123", "method": "GET" },
    "add-item": { "href": "/api/carts/123/items", "method": "POST" },
    "checkout": { "href": "/api/carts/123/checkout", "method": "POST" },
    "empty-cart": { "href": "/api/carts/123", "method": "DELETE" }
  }
}
```

# Benefits of HATEOAS
**Scenario 5:** Advantages of HATEOAS

Description: Verify the architectural benefits of adopting HATEOAS in REST APIs.

**Steps:**

Compare API behavior with and without HATEOAS.

Observe how clients consume responses dynamically.

**Assertions:**

Discoverability: Clients don’t need hardcoded URLs.

Decoupling: Server can change endpoints without breaking clients.

### State Management: Server defines valid actions based on resource state.

Self-documenting: API responses describe available operations.