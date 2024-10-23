// ipfsGenerator.ts

interface IPFSConfig {
    repo: {
      autoMigrate: boolean;
      fs: string;
    };
    init: boolean;
    start: boolean;
    config: {
      Addresses: {
        Swarm: string[];
        API: string;
        Gateway: string;
      };
    };
    EXPERIMENTAL: {
      pubsub: boolean;
      sharding: boolean;
    };
    configPath: string;
    startTimeout: number;
    preload: {
      enabled: boolean;
      addresses: string[];
    };
    libp2p: {
      config: {
        dht: {
          enabled: boolean;
          clientMode: boolean;
        };
      };
    };
    relay: {
      enabled: boolean;
      hop: {
        enabled: boolean;
      };
    };
    ipnsPubsub: boolean;
    keychain: {
      pass: string;
    };
  }
  
  // Function to generate IPFS configuration
  const ipfsGenerator = (customConfig: Partial<IPFSConfig> = {}): IPFSConfig => {
    const defaultConfig: IPFSConfig = {
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
    };
  
    return {
      ...defaultConfig,
      ...customConfig,
    };
  };
  
  export default ipfsGenerator;
  