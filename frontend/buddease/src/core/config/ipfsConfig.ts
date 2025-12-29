// ipfsConfig.ts
export const ipfsConfig = {
    repo: {
      autoMigrate: true,
      fs: '/path/to/custom/fs',
    },
    init: true,
    start: true,
    config: {
      Addresses: {
        Swarm: [
          '/ip4/0.0.0.0/tcp/4001',
          '/ip6/::/tcp/4001',
        ],
        API: '/ip4/127.0.0.1/tcp/5001',
        Gateway: '/ip4/127.0.0.1/tcp/8080',
      },
    },
    EXPERIMENTAL: {
      pubsub: true,
      sharding: true,
    },
    configPath: '/path/to/ipfs/config',
    startTimeout: 20 * 60 * 1000,
    preload: {
      enabled: true,
      addresses: [
        '/dnsaddr/node1.example.com',
        '/dnsaddr/node2.example.com',
      ],
    },
    libp2p: {
      config: {
        dht: {
          enabled: true,
          clientMode: true,
        },
      },
    },
    relay: {
      enabled: true,
      hop: {
        enabled: false,
      },
    },
    ipnsPubsub: true,
    keychain: {
      pass: 'your-secret-passphrase',
    },
    // Additional IPFS configuration
    ipfsPath: 'newLocal',
    ipfsPort: 5001,
    ipfsProtocol: 'http',
    ipfsHost: 'localhost',
    ipfsGatewayProtocol: 'http',
    ipfsGatewayHost: 'localhost',
    ipfsGatewayPort: 8080,
    ipfsGatewayPath: '/ipfs',
    ipfsGatewayUrl: 'http://localhost:8080/ipfs',
    ipfsApiPort: 5002,
    ipfsApiProtocol: 'http',
    ipfsApiHost: 'localhost',
    ipfsApiUrl: 'http://localhost:5002',
    ipfsApiPath: '/api/v0',
    ipfsSwarmPort: 4001,
    ipfsSwarmProtocol: 'http',
    ipfsSwarmHost: 'localhost',
    ipfsSwarmUrl: 'http://localhost:4001',
    ipfsSwarmPath: '/swarm/peers',
    ipfsWsPort: 5003
};
