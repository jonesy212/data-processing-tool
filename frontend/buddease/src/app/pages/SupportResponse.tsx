import React from'react';
const SupportResponse = ({ message }: { message: string }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Support Response</title>
      </head>
      <body>
        <h2>Support Response</h2>
        <p>{message}</p>
      </body>
    </html>
  );
};

export default SupportResponse;
