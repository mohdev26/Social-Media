 import { bootstrap } from "./app.controller";

bootstrap().catch((error: unknown) => {
    console.log (" Failed to start the application: ", error);
    process.exit(1);
});