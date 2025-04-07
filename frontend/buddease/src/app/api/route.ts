// app/api/database-request/route.ts
import isValidAuthToken from "@/app/components/security/AuthValidation";
import { databaseConfig } from '@/app/configs/DatabaseConfig';
import performDatabaseOperation from "@/server/database/DatabaseOperations";
import { NextResponse } from 'next/server';

/**
 * Handles POST requests for database operations.
 *
 * @remarks/
 * This function expects a JSON payload with `authToken` and `databaseQuery`.
 * It validates the `authToken` and then performs a database operation using the provided `databaseQuery`.
 *
 * @param request - The incoming POST request.
 * @returns - A JSON response with the result of the database operation or an error message.
 *
 * @throws Will throw an error if the database operation fails.
 * @throws Will throw an error if the `authToken` is invalid.
 */

export async function POST(request: Request) {
  const { authToken, databaseQuery } = await request.json();

  if (isValidAuthToken(authToken)) {
    try {
      const databaseResult = await performDatabaseOperation(
        'createDatabase', // or pass this from request if needed
        databaseConfig,
        databaseQuery
      );
      return NextResponse.json({ result: databaseResult });
    } catch (error) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}


