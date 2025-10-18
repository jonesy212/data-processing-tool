-- Create the extension if not exists
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Create Foreign Server for decentralized storage
CREATE SERVER decentralized_storage_server
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'your_host', port 'your_port', dbname 'your_db');

-- Set user mapping
CREATE USER MAPPING FOR current_user
SERVER decentralized_storage_server
OPTIONS (user 'external_user', password 'external_password');

-- Create Foreign Table for decentralized data
CREATE FOREIGN TABLE decentralized_data
(
  id serial PRIMARY KEY,
  data_column1 datatype1,
  data_column2 datatype2,
  -- Add more columns as needed
)
SERVER decentralized_storage_server
OPTIONS (table_name 'remote_table');
    