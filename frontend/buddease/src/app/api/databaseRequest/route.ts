// app/api/databaseRaequest/route.ts
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
  try {
    const { authToken, databaseQuery, operationType } = await request.json();

    // Validate required fields
    if (!authToken || !databaseQuery) {
      return NextResponse.json(
        { error: 'Missing required fields: authToken and databaseQuery are required' },
        { status: 400 }
      );
    }

    if (!isValidAuthToken(authToken)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const databaseResult = await performDatabaseOperation(
      operationType || 'query', // Default to 'query' if not specified
      databaseConfig,
      databaseQuery
    );

    return NextResponse.json({ result: databaseResult });

  } catch (error) {
    console.error('Database API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authToken = searchParams.get('authToken');
    const query = searchParams.get('query');
    const operationType = searchParams.get('operationType') || 'query';

    // Validate required parameters
    if (!authToken) {
      const errorResponse = NextResponse.json(
        { error: 'Missing required parameter: authToken' },
        { status: 400 }
      );
      // Add security headers even to error responses
      Object.entries(createSecurityHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Missing required parameter: query' },
        { status: 400 }
      );
    }

    // Validate authentication token using your validation function
    if (!isValidAuthToken(authToken)) {
      const errorResponse = NextResponse.json(
        { 
          error: 'Unauthorized - Invalid authentication token',
          details: 'Token must be 36 characters long and contain only alphanumeric characters and hyphens'
        },
        { status: 401 }
      );
      Object.entries(createSecurityHeaders()).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
      return errorResponse;
    }

    // Parse additional parameters if provided
    const params = searchParams.get('params');
    let queryParams: any[] = [];
    
    if (params) {
      try {
        queryParams = JSON.parse(params);
        if (!Array.isArray(queryParams)) {
          return NextResponse.json(
            { error: 'Invalid params format - must be a JSON array' },
            { status: 400 }
          );
        }
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid params format - must be valid JSON' },
          { status: 400 }
        );
      }
    }

    // Validate that GET requests only allow read operations
    const upperCaseQuery = query.toUpperCase().trim();
    const isReadOperation = upperCaseQuery.startsWith('SELECT') || 
                           upperCaseQuery.startsWith('WITH') ||
                           upperCaseQuery.startsWith('SHOW') ||
                           upperCaseQuery.startsWith('EXPLAIN') ||
                           upperCaseQuery.startsWith('DESCRIBE');

    const isDangerousOperation = upperCaseQuery.startsWith('INSERT') || 
                                upperCaseQuery.startsWith('UPDATE') || 
                                upperCaseQuery.startsWith('DELETE') ||
                                upperCaseQuery.startsWith('DROP') ||
                                upperCaseQuery.startsWith('CREATE') ||
                                upperCaseQuery.startsWith('ALTER') ||
                                upperCaseQuery.startsWith('TRUNCATE') ||
                                upperCaseQuery.startsWith('GRANT') ||
                                upperCaseQuery.startsWith('REVOKE');

    if (!isReadOperation) {
      return NextResponse.json(
        { error: 'GET requests are only allowed for read operations (SELECT, SHOW, EXPLAIN, etc.)' },
        { status: 405 }
      );
    }

    if (isDangerousOperation) {
      return NextResponse.json(
        { error: 'Dangerous operations are not allowed via GET requests' },
        { status: 403 }
      );
    }

    // Perform database operation
    const databaseResult = await performDatabaseOperation(
      operationType,
      databaseConfig,
      query,
      queryParams
    );

        // Create successful response with security headers
    const successResponse = NextResponse.json({ 
      success: true, 
      result: databaseResult,
      timestamp: new Date().toISOString(),
      queryType: 'read'
    });

    // Add security headers to successful response
    Object.entries(createSecurityHeaders()).forEach(([key, value]) => {
      successResponse.headers.set(key, value);
    });

    return successResponse;

  } catch (error) {
    console.error('GET Database API error:', error);
    
    // ✅ NEW ERROR HANDLING WITH SECURITY HEADERS
    // Create error response
    const errorResponse = NextResponse.json(
      { 
        error: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );

    // Add security headers to error response
    Object.entries(createSecurityHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });

    return errorResponse;
  }
}