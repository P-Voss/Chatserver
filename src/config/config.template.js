
const config = {
    chatModule: "",
    serverConfig: {
        ssl: false,
        host: "host",
        port: "port",
        ssl_key: "path/to/sslKey",
        ssl_cert: "path/to/sslCert"
    },
    mysqlConfig: {
        host: "host",
        user: "user",
        password: "password",
        database: "database",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }
};

module.exports = config;
