import swaggerAutogen from "swagger-autogen"

const doc = {
    info: {
        title: 'Auth Service API',
        description: 'API documentation for the Auth Service',
        version:"1.0.0"
    },
    host: "localhost:6001",
    schemes:["http"],
}

const outFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.router.ts"];

swaggerAutogen()(outFile,endpointsFiles,doc)