.. _get_profile_picture:

Get Profile Picture
===================

API endpoint to retrieve the profile picture URL of the authenticated user.

.. http:get:: /api/user/profile-picture

   **Request**

   - *Method:* ``GET``
   - *Authentication:* Token-based (JWT)
   - *Headers:*
     - ``Authorization: Bearer <your_access_token>``

   **Response**

   - *Success Code:* ``200 OK``
     - *Content:* JSON object with the profile picture URL.
       Example:
       ```json
       {
         "profilePictureUrl": "https://example.com/profile_picture.jpg"
       }
       ```
   - *Error Codes:*
     - ``401 Unauthorized``: When the request lacks proper authentication.
     - ``404 Not Found``: If the user or their profile picture is not found.

   **Example Usage**

   .. code-block:: http

      GET /api/user/profile-picture
      Host: your-api-host.com
      Authorization: Bearer <your_access_token>

   **Example Response**

   .. code-block:: json

      {
        "profilePictureUrl": "https://example.com/profile_picture.jpg"
      }

