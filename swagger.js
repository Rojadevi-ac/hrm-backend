// swagger.js
import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "HRM Backend API",
            version: "1.0.0",
            description:
                "Location-based Employee Attendance Management System built with Node.js, Express, and MongoDB.",
            contact: {
                name: "Focus Engineering",
                email: "support@focusengineering.com",
            },
        },
        servers: [
            {
                url: "https://hrm-location-backend.onrender.com/api",
                description: "Live server (Render deployment)",
            },
            {
                url: "http://localhost:5000/api",
                description: "Local development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your JWT token for authentication (without 'Bearer ' prefix).",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Include all route and controller files for auto-doc generation
    apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
